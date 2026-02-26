import type { Container, Graphics, Text, TextStyle, Sprite, Texture, TilingSprite, AnimatedSprite } from "pixi.js";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      pixiContainer: {
        x?: number;
        y?: number;
        children?: React.ReactNode;
      };
      pixiGraphics: {
        draw?: (g: Graphics) => void;
        x?: number;
        y?: number;
        eventMode?: "none" | "passive" | "auto" | "static" | "dynamic";
        cursor?: string;
        onPointerTap?: (e: any) => void;
        onClick?: (e: any) => void;
        onRightClick?: (e: any) => void;
      };
      pixiText: {
        text?: string;
        x?: number;
        y?: number;
        anchor?: number | { x: number; y: number };
        style?: Partial<TextStyle> | Record<string, any>;
      };
      pixiSprite: {
        texture?: Texture;
        x?: number;
        y?: number;
        anchor?: number | { x: number; y: number };
        scale?: number | { x: number; y: number };
        eventMode?: "none" | "passive" | "auto" | "static" | "dynamic";
        cursor?: string;
        onPointerTap?: (e: any) => void;
      };
      pixiTilingSprite: {
        texture?: Texture;
        width?: number;
        height?: number;
        x?: number;
        y?: number;
      };
      pixiAnimatedSprite: {
        ref?: React.Ref<AnimatedSprite>;
        textures?: Texture[];
        x?: number;
        y?: number;
        anchor?: number | { x: number; y: number };
        scale?: number | { x: number; y: number };
        animationSpeed?: number;
        loop?: boolean;
        eventMode?: "none" | "passive" | "auto" | "static" | "dynamic";
        cursor?: string;
        onPointerTap?: (e: any) => void;
      };
    }
  }
}

export {};
