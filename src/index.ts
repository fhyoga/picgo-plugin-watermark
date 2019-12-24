import Picgo from "picgo";
import sharp from "sharp";
import path from "path";
import { getCoordinateByPosition, PositionType } from "./util";
import { loadFontFamily, getSvg } from "./text2svg";

const handle = async (ctx: Picgo) => {
  const input = ctx.input;
  const userConfig = ctx.getConfig("picgo-plugin-watermark");
  let { text, position = "rb", fontSize, image, fontFamily } = userConfig;
  fontSize = parseInt(fontSize);
  // 无效数字且不为空
  if (fontSize === NaN && fontSize !== null) {
    ctx.log.error("fontSize设置错误，检查是否为有效数字");
    throw new Error("fontSize设置错误，检查是否为有效数字");
  }
  try {
    loadFontFamily(fontFamily || undefined);
  } catch (error) {
    ctx.log.error("字体文件载入失败，请检查文件路径");
    ctx.log.error(error);
    throw error;
  }

  let waterMark = null;
  if (image) {
    try {
      waterMark = sharp(image);
    } catch (error) {
      ctx.log.error(error);
      throw error;
    }
  } else {
    waterMark = sharp(Buffer.from(getSvg(text, fontSize ? { fontSize } : {})));
  }
  const waterMarkMeta = await waterMark.metadata();

  const output = await Promise.all(
    input.map(async image => {
      const fileName = path.basename(image);
      const extname = path.extname(image);
      const sharpedImage = sharp(image);
      const { width, height } = await sharpedImage.metadata();
      const coordinate = getCoordinateByPosition({
        width,
        height,
        waterMark: {
          width: waterMarkMeta.width,
          height: waterMarkMeta.height,
          position: PositionType[position]
        }
      });
      ctx.log.info(JSON.stringify(coordinate));
      return {
        buffer: await sharpedImage
          .composite([
            {
              input: await waterMark.toBuffer(),
              ...coordinate
            }
          ])
          .toBuffer(),
        width,
        height,
        fileName,
        extname
      };
    })
  );
  ctx.output = output;
  return ctx;
};
const config = (ctx: Picgo) => {
  let userConfig = ctx.getConfig("picgo-plugin-watermark");
  if (!userConfig) {
    userConfig = {};
  }
  return [
    {
      name: "fontFamily",
      type: "input",
      default: userConfig.fontFamily,
      required: false,
      message: "字体文件路径；水印中有汉字时，此项必须有",
      alias: "字体文件路径"
    },
    {
      name: "text",
      type: "input",
      default: userConfig.text,
      required: false,
      message: "文字，默认只支持英文，中文支持需要配置字体文件路径",
      alias: "水印文字"
    },
    {
      name: "fontSize",
      type: "input",
      default: userConfig.fontSize,
      required: false,
      message: "默认 14px",
      alias: "字体大小"
    },
    {
      name: "image",
      type: "input",
      default: userConfig.image,
      required: false,
      message: "水印图片的绝对路径，优先级高于文字",
      alias: "水印图片路径"
    },
    {
      name: "position",
      type: "input",
      default: userConfig.position,
      required: false,
      message: "E.g:右上为'rt'，更多信息查看Readme",
      alias: "水印位置"
    }
  ];
};

export = (ctx: Picgo) => {
  const register = () => {
    ctx.helper.transformer.register("watermark", { handle });
  };
  return {
    register,
    transformer: "watermark",
    config
  };
};
