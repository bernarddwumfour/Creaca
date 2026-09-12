import React from 'react';
import { Composition, AnyZodObject } from 'remotion';
import { LessonVideo, LessonVideoProps } from './LessonVideo';

const FPS = 30;

export function RemotionRoot() {
    return (
        <Composition<AnyZodObject, LessonVideoProps>
            id="LessonVideo"
            component={LessonVideo}
            durationInFrames={FPS * 10}
            fps={FPS}
            width={1920}
            height={1080}
            defaultProps={{ blocks: [] }}
            calculateMetadata={async ({ props }) => {
                const total = props.blocks.reduce((sum, block) => sum + block.durationInFrames, 0);
                return { durationInFrames: Math.max(total, FPS) };
            }}
        />
    );
}
