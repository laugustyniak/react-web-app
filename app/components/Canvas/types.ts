// Canvas/types.ts
export interface CanvasImage {
    id: string;
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    selected: boolean;
}

export type CanvasTool = 'move' | 'resize' | 'crop' | null;
