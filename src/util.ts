import { OFFSET } from "./attr";

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

interface Coordinate {
  left: number;
  top: number;
}
export const getCoordinateByPosition = (prop: {
  width: number;
  height: number;
  waterMark: {
    width: number;
    height: number;
    position: PositionType;
  };
}): Coordinate => {
  const { width, height, waterMark } = prop;
  const p = waterMark.position.split("-");
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

export interface Config {
  text: string;
  position: string;
  fontSize: string;
  image: string;
  fontFamily: string;
  minSize: string;
  minWidth?: number;
  minHeight?: number;
  parsedFontSize?: number;
}
export const parseAndValidate: (
  config: Config
) => [string[], Config] = config => {
  const { position, fontSize, minSize } = config;
  const parsedFontSize = parseInt(fontSize);
  let parsedConfig: Config = { ...config };
  let errors = [];
  // 无效数字且不为空
  if (isNaN(parsedFontSize) && fontSize !== null) {
    errors.push("fontSize");
  } else {
    parsedConfig.parsedFontSize = parsedFontSize;
  }
  if (position && !PositionType[position]) {
    errors.push("position");
  }
  if (minSize) {
    let [minWidth, minHeight] = minSize.split("*").map((v: string) => +v);
    if (!minWidth || !minHeight) {
      errors.push("minSize");
    } else {
      parsedConfig.minHeight = minHeight;
      parsedConfig.minWidth = minWidth;
    }
  }
  return [
    errors,
    {
      ...config,
      ...parsedConfig
    }
  ];
};
