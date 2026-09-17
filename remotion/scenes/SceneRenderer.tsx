import React from 'react';
import { TitleScene } from './TitleScene';
import { ConceptScene } from './ConceptScene';
import { DiagramScene } from './DiagramScene';
import { CodeScene } from './CodeScene';
import { StepsScene } from './StepsScene';
import { RecapScene } from './RecapScene';
import type { Scene } from './types';

/** Picks the animated component for a scene by its `type`. Unknown types fall
 *  back to a Concept-style card so a bad/new type never breaks the render. */
export function SceneRenderer({ scene }: { scene: Scene }) {
    switch (scene.type) {
        case 'title':
            return <TitleScene scene={scene as any} />;
        case 'diagram':
            return <DiagramScene scene={scene as any} />;
        case 'code':
            return <CodeScene scene={scene as any} />;
        case 'steps':
            return <StepsScene scene={scene as any} />;
        case 'recap':
            return <RecapScene scene={scene as any} />;
        case 'concept':
        default:
            return <ConceptScene scene={{ ...(scene as any), type: 'concept' }} />;
    }
}
