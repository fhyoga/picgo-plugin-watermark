import Picgo from "picgo";

import { parseAndValidate } from "./util";
import { loadFontFamily, getSvg } from "./text2svg";
import { config } from "./config";
import { outputGen } from "./output";

const handle = async (ctx: Picgo): Promise<Picgo | boolean> => {
  const input = ctx.input;
  const userConfig = ctx.getConfig("picgo-plugin-watermark");

  const [
    errors,
    {
      text,
      position = "rb",
      parsedFontSize,
      image,
      fontFamily,
      minWidth,
      minHeight
    }
  ] = parseAndValidate(userConfig);

  // Verify configuration
  if (errors.length) {
    ctx.emit("notification", {
      title: "watermark设置错误",
      body: errors.join("，") + "设置错误，请检查"
    });
    // To prevent the next step
    throw new Error();
  }

  try {
    loadFontFamily(fontFamily || undefined);
  } catch (error) {
    ctx.log.error("字体文件载入失败");
    ctx.log.error(error);
    ctx.emit("notification", {
      title: "watermark设置错误",
      body: "字体文件载入失败，请检查字体文件路径"
    });
    // To prevent the next step
    throw new Error();
  }

  let waterMark = null;
  if (image) {
    waterMark = image;
  } else {
    waterMark = Buffer.from(
      getSvg(text, parsedFontSize ? { fontSize: parsedFontSize } : {})
    );
  }
  try {
    ctx.output = await outputGen(
      {
        input,
        minHeight,
        minWidth,
        position,
        waterMark
      },
      ctx.log
    );
  } catch (error) {
    ctx.log.error(error);
    ctx.emit("notification", {
      title: "watermark转化错误",
      body: "可能是水印图或字体文件路径无效，请检查。"
    });
    // To prevent the next step
    throw new Error();
  }
  return ctx;
};

export = (ctx: Picgo): any => {
  const register: () => void = () => {
    ctx.helper.transformer.register("watermark", { handle });
  };
  return {
    register,
    transformer: "watermark",
    config
  };
};
