import type { CSSProperties } from "react";

import Image from "next/image";

import walkerSprites from "./walker-sprites.json";

function getWalkerName(sprite: string) {
  const fileName = sprite.replace(/\.[^.]+$/, "");
  const [, ...nameParts] = fileName.split("-");

  if (nameParts.length === 0) {
    return fileName;
  }

  return nameParts
    .join(" ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function SpriteStage() {
  const sprites = walkerSprites;

  if (sprites.length === 0) {
    return null;
  }

  return (
    <div className="sprite-stage" aria-hidden="true">
      {[...sprites].reverse().map((sprite, index) => (
        <figure
          key={sprite}
          className="walking-footer-character"
          style={{ "--walker-index": index } as CSSProperties}
        >
          <figcaption className="walking-footer-chat">
            {getWalkerName(sprite)}
          </figcaption>
          <Image
            className="walking-footer-sprite pixelated"
            src={`/sprites/${sprite}`}
            alt=""
            width={200}
            height={200}
            unoptimized
          />
        </figure>
      ))}
    </div>
  );
}
