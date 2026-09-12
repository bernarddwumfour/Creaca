import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import crypto from 'crypto';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { parseMedia } from '@remotion/media-parser';
import { nodeReader } from '@remotion/media-parser/node';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface IncomingBlock {
    block_type: string;
    title: string;
    body: string;
    code: string;
    language: string;
    audio_base64: string;
}

const FPS = 30;
// Breathing room after each block's narration ends, before the next slide cuts in.
const PADDING_FRAMES = 20;

/**
 * Server-to-server only: renders a module's approved lesson content (with
 * pre-generated narration audio) into an mp4 via Remotion, and stores it
 * under public/generated-videos/. Called by kyrios-backend's
 * generate_video_task, never from the browser — gated by a shared secret,
 * not user auth.
 */
export async function POST(request: NextRequest) {
    const secret = request.headers.get('x-internal-secret');
    if (!secret || !process.env.INTERNAL_RENDER_SECRET || secret !== process.env.INTERNAL_RENDER_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { module_id?: string; blocks?: IncomingBlock[] };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const blocks = body.blocks;
    if (!Array.isArray(blocks) || blocks.length === 0) {
        return NextResponse.json({ error: 'blocks must be a non-empty array' }, { status: 400 });
    }

    const jobId = crypto.randomUUID();
    const workDir = path.join(os.tmpdir(), `remotion-${jobId}`);
    const publicDir = path.join(workDir, 'public');
    await fs.mkdir(publicDir, { recursive: true });

    try {
        const compositionBlocks = [];
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            const audioFile = `audio-${i}.mp3`;
            const audioPath = path.join(publicDir, audioFile);
            await fs.writeFile(audioPath, Buffer.from(block.audio_base64, 'base64'));

            const { durationInSeconds } = await parseMedia({
                src: audioPath,
                reader: nodeReader,
                fields: { durationInSeconds: true },
                acknowledgeRemotionLicense: true,
            });
            const durationSeconds = durationInSeconds ?? 5;
            const durationInFrames = Math.max(Math.round(durationSeconds * FPS) + PADDING_FRAMES, FPS);

            compositionBlocks.push({
                block_type: block.block_type,
                title: block.title,
                body: block.body,
                code: block.code,
                language: block.language,
                audioFile,
                durationInFrames,
            });
        }

        const totalFrames = compositionBlocks.reduce((sum, b) => sum + b.durationInFrames, 0);
        const inputProps = { blocks: compositionBlocks };

        const bundleLocation = await bundle({
            entryPoint: path.join(process.cwd(), 'remotion', 'index.ts'),
            publicDir,
        });

        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: 'LessonVideo',
            inputProps,
        });

        const outputPath = path.join(workDir, 'output.mp4');
        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation: outputPath,
            inputProps,
        });

        const outputDir = path.join(process.cwd(), 'public', 'generated-videos');
        await fs.mkdir(outputDir, { recursive: true });
        const fileName = `${body.module_id || 'module'}-${Date.now()}.mp4`;
        await fs.copyFile(outputPath, path.join(outputDir, fileName));

        return NextResponse.json({
            url: `/generated-videos/${fileName}`,
            duration_seconds: Math.round(totalFrames / FPS),
        });
    } catch (error: any) {
        console.error('[render-video] failed:', error);
        return NextResponse.json({ error: error?.message || 'Video render failed' }, { status: 500 });
    } finally {
        await fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
    }
}
