import React from 'react';
import { AbsoluteFill, Audio, Series, staticFile } from 'remotion';
import { THEME } from './scenes/theme';
import { SceneRenderer } from './scenes/SceneRenderer';
import { Subtitles } from './scenes/Subtitles';
import type { Scene } from './scenes/types';

export type LessonVideoProps = {
    scenes: Scene[];
    subtitles?: boolean;
} & Record<string, unknown>;

export function LessonVideo({ scenes, subtitles = true }: LessonVideoProps) {
    return (
        <AbsoluteFill style={{ backgroundColor: THEME.bg }}>
            <Series>
                {scenes.map((scene, index) => (
                    <Series.Sequence key={index} durationInFrames={Math.max(scene.durationInFrames, 1)}>
                        <SceneRenderer scene={scene} />
                        {subtitles ? (
                            <Subtitles text={scene.narration} durationInFrames={Math.max(scene.durationInFrames, 1)} />
                        ) : null}
                        {scene.audioFile ? <Audio src={staticFile(scene.audioFile)} /> : null}
                    </Series.Sequence>
                ))}
            </Series>
        </AbsoluteFill>
    );
}
