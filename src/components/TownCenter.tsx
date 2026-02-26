import { extend } from "@pixi/react";
import { Sprite, Assets, Texture } from "pixi.js";
import { useState, useEffect } from "react";

extend({ Sprite });

interface TownCenterProps {
  x: number;
  y: number;
  scale: number;
}

export function TownCenter({ x, y, scale }: TownCenterProps) {
  const [texture, setTexture] = useState<Texture | null>(null);

  useEffect(() => {
    Assets.load("/Tiny Swords (Free Pack)/Buildings/Blue Buildings/House2.png").then((loadedTexture) => {
      setTexture(loadedTexture);
    });
  }, []);

  if (!texture) return null;

  return (
    <pixiSprite
      texture={texture}
      x={x}
      y={y}
      anchor={0.5}
      scale={scale}
    />
  );
}
