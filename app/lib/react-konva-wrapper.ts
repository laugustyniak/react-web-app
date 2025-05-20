// react-konva-wrapper.ts - TypeScript version with proper types
import { Stage, Layer, Rect, Circle, Line, Text, Image, Group, Shape, Label, Tag, Path } from 'react-konva/lib/ReactKonvaStage';
import type {
    StageProps, LayerProps, RectProps, CircleProps, LineProps, TextProps,
    ImageProps, GroupProps, ShapeProps, LabelProps, TagProps, PathProps
} from 'react-konva';
import type Konva from 'konva';

// Export all components with their types
export {
    Stage,
    Layer,
    Rect,
    Circle,
    Line,
    Text,
    Image,
    Group,
    Shape,
    Label,
    Tag,
    Path,
    // Types
    StageProps,
    LayerProps,
    RectProps,
    CircleProps,
    LineProps,
    TextProps,
    ImageProps,
    GroupProps,
    ShapeProps,
    LabelProps,
    TagProps,
    PathProps
};

// Export for Transformer component
export type TransformerProps = {
    ref?: React.RefObject<Konva.Transformer>;
    boundBoxFunc?: (oldBox: Konva.Box, newBox: Konva.Box) => Konva.Box;
    enabledAnchors?: string[];
    rotateEnabled?: boolean;
    borderEnabled?: boolean;
    borderStroke?: string;
    borderStrokeWidth?: number;
    borderDash?: number[];
    anchorStroke?: string;
    anchorStrokeWidth?: number;
    anchorFill?: string;
    anchorSize?: number;
    keepRatio?: boolean;
    centeredScaling?: boolean;
    ignoreStroke?: boolean;
    node?: Konva.Node;
    [key: string]: any;
};

export const Transformer = Shape as any as React.FC<TransformerProps>;

// Event types
export type KonvaEventObject<T extends Konva.Node> = {
    target: T;
    evt: Event;
    type: string;
    pointerId: number;
    pointerType: string;
    clientX: number;
    clientY: number;
    movementX: number;
    movementY: number;
};
