import { fontOptions, OFFSET } from "./attr";
import path from "path";
const TextToSVG = require("text-to-svg");
const textToSVG = TextToSVG.loadSync(
  path.join(__dirname, "../fonts/Arial-Unicode-MS.ttf")
);

export enum PositionType {
  lt = "left-top",
  ct = "center-top",
  rt = "right-top",
  lm = "left-middle",
  cm = "center-middle",
  rm = "right-middle",
  lb = "left-bottom",
  cb = "center-bottom",
  rb = "right-bottom"
}

export const getCoordinateByPosition = (prop: {
  width: number;
  height: number;
  waterMark: {
    width: number;
    height: number;
    position: PositionType;
  };
}): { left: number } => {
  let { width, height, waterMark } = prop;
  let p = waterMark.position.split("-");
  return p.reduce(
    (acc, pos) => {
      switch (pos) {
        case "left":
          acc.left = OFFSET.X;
          break;
        case "center":
          acc.left = Math.floor((width - waterMark.width) / 2);
          break;
        case "right":
          acc.left = Math.floor(width - OFFSET.X - waterMark.width);
          break;
        case "top":
          acc.top = OFFSET.Y;
          break;
        case "middle":
          acc.top = Math.floor((height - waterMark.height) / 2);
          break;
        case "bottom":
          acc.top = Math.floor(height - OFFSET.Y - waterMark.height);
          break;
      }
      return acc;
    },
    { left: 0, top: 0 }
  );
};

export const getSvg = (
  text: string,
  options?: { fontSize?: number; [propName: string]: any }
): string => {
  return textToSVG.getSVG(text, { ...fontOptions, ...options });
};
