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
            defaultProps={{ scenes: [] }}
            calculateMetadata={async ({ props }) => {
                const total = (props.scenes || []).reduce((sum, scene) => sum + (scene.durationInFrames || 0), 0);
                return { durationInFrames: Math.max(total, FPS) };
            }}
        />
    );
}
