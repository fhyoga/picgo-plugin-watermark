import Picgo from "picgo";
import dayjs from 'dayjs';
import fs from 'fs-extra'

import sharp from "sharp";
import path from "path";
import Logger from "picgo/dist/src/lib/Logger";
import { getCoordinateByPosition, PositionType, getImageBufferData } from "./util";

interface IInput {
  input: any[];
  minWidth: number;
  minHeight: number;
  position: string;
  waterMark: string | Buffer;
}

export const inputAddWaterMarkHandle: (
  ctx: Picgo,
  iinput: IInput,
  logger: Logger
) => Promise<string[]> = async (ctx, imageInput, logger) => {
  const { input, minWidth, minHeight, waterMark, position } = imageInput;
  const sharpedWaterMark = sharp(waterMark);
  const waterMarkMeta = await sharpedWaterMark.metadata();

  const addedWaterMarkInput = await Promise.all(
    input.map(async image => {
      let addWaterMarkImagePath = '';

      // get image buffer data
      const imageBuffer = await getImageBufferData(ctx, image)

      const sharpedImage = sharp(imageBuffer);

      const { width, height, format } = await sharpedImage.metadata();
      const coordinate = getCoordinateByPosition({
        width,
        height,
        waterMark: {
          width: waterMarkMeta.width,
          height: waterMarkMeta.height,
          position: PositionType[position]
        }
      });
      logger.info(JSON.stringify(coordinate));
      logger.info(`watermark 图片文件格式：${format}`)

      // Picture width or length is too short, do not add watermark
      // Or trigger minimum size limit
      if (
        coordinate.left <= 0 ||
        coordinate.top <= 0 ||
        width <= minWidth ||
        height <= minHeight
      ) {
        addWaterMarkImagePath = image;
        logger.info('watermark 图片尺寸不满足，跳过水印添加')
      } else {
        // 如果图片是 picgo 生成的图片，则说明是剪切板图片
        // https://github.com/PicGo/PicGo-Core/blob/85ecd16253ea58910de63511ea95e6f6fb6249d6/src/utils/getClipboardImage.ts#L25
        if (ctx.baseDir === path.dirname(image)) {
          addWaterMarkImagePath = image
        } else {
          // not a clipboard image, generate a new file to save watermark image
          // 如果不是剪切板图片，说明图片为通过拖拽或选择的本地图片、或者是网络图片的url，需要在 picgo 目录下生成一个图片
          // 用于存放添加水印后的图片
          const extname = format || path.extname(image) || 'png'
          addWaterMarkImagePath = path.join(ctx.baseDir, `${dayjs().format('YYYYMMDDHHmmss')}.${extname}`)

          ctx.once('failed', () => {
            // 删除 picgo 生成的图片文件，例如 `~/.picgo/20200621205720.png`
            fs.remove(addWaterMarkImagePath).catch((e) => { ctx.log.error(e) })
          })
          ctx.once('finished', () => {
            // 删除 picgo 生成的图片文件，例如 `~/.picgo/20200621205720.png`
            fs.remove(addWaterMarkImagePath).catch((e) => { ctx.log.error(e) })
          })
        }

        await sharpedImage
          .composite([
            {
              input: await sharpedWaterMark.toBuffer(),
              ...coordinate
            }
          ]).toFile(addWaterMarkImagePath)

        logger.info('watermark 水印添加成功')
      }
      return addWaterMarkImagePath
    })
  );
  return addedWaterMarkInput;
};
