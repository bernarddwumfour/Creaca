// Scene input types — mirror the JSON the AI script generator produces
// (apps/ai/services/prompts.py::build_video_script_prompt), enriched by the
// render route with `durationInFrames` and an optional `audioFile`.

export interface SceneCommon {
    type: string;
    narration?: string;
    durationInFrames: number;
    audioFile?: string;
}

export interface TitleScene extends SceneCommon {
    type: 'title';
    heading?: string;
    subtitle?: string;
}

export interface ConceptScene extends SceneCommon {
    type: 'concept';
    heading?: string;
    points?: string[];
}

export interface DiagramNode {
    id: string;
    label: string;
}
export interface DiagramEdge {
    from: string;
    to: string;
    label?: string;
}
export interface DiagramScene extends SceneCommon {
    type: 'diagram';
    heading?: string;
    layout?: 'flow' | 'stack' | 'cycle' | 'nested';
    nodes?: DiagramNode[];
    edges?: DiagramEdge[];
}

export interface CodeHighlight {
    lines?: number[];
    caption?: string;
}
export interface CodeScene extends SceneCommon {
    type: 'code';
    heading?: string;
    language?: string;
    code?: string;
    highlights?: CodeHighlight[];
}

export interface StepsScene extends SceneCommon {
    type: 'steps';
    heading?: string;
    steps?: string[];
}

export interface RecapScene extends SceneCommon {
    type: 'recap';
    heading?: string;
    points?: string[];
}

export type Scene =
    | TitleScene
    | ConceptScene
    | DiagramScene
    | CodeScene
    | StepsScene
    | RecapScene
    | SceneCommon; // fallback for unknown types
