import fs from 'fs-extra'
import Picgo from "picgo";
import Color from 'color';

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

interface ICoordinate {
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
}): ICoordinate => {
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

export interface IConfig {
  text: string;
  textColor: string;
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
  config: IConfig
) => [string[], IConfig] = config => {
  const { position, fontSize, minSize, textColor } = config;
  const parsedFontSize = parseInt(fontSize);
  let parsedConfig: IConfig = { ...config };
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
  if (textColor) {
    try {
      parsedConfig.textColor = Color(textColor).hex()
    } catch (error) {
      errors.push('textColor')
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

// 是否是网络图片
export const isUrl: (url: string) => boolean = (url) => {
  return /^https?:\/\//.test(url)
}

export const downloadImage: (ctx: Picgo, url: string) => Promise<Buffer> = async (ctx, url) => {
  return await ctx.request({ method: 'GET', url, encoding: null })
    .on('error', function(err) {
      ctx.log.error(`网络图片下载失败，${url}`)
      ctx.log.error(err)
    }).on('response', (response: Response): void => {
      const contentType = response.headers['content-type']
      if (contentType && !contentType.includes('image')) {
        throw new Error(`${url} is not image`)
      }
  })
}

export const getImageBufferData: (ctx: Picgo, imageUrl: string) => Promise<Buffer> = (ctx, imageUrl) => {
  if (isUrl(imageUrl)) {
    return downloadImage(ctx, imageUrl)
  } else {
    return fs.readFile(imageUrl)
  }
}