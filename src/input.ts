import Picgo from "picgo";
import dayjs from 'dayjs';
import fs from 'fs-extra'

import sharp from "sharp";
import path from "path";
import Logger from "picgo/dist/src/lib/Logger";
import {getCoordinateByPosition, getImageBufferData, PositionType} from "./util";
import {WmImageFilePathType, WmImageSaveType} from "./config";

interface IInput {
  input: any[];
  minWidth: number;
  minHeight: number;
  position: string;
  waterMark: string | Buffer;
  wmImageFilePathType?: WmImageFilePathType;
  wmImageSaveType?: WmImageSaveType;
}

export const inputAddWaterMarkHandle: (
  ctx: Picgo,
  iinput: IInput,
  logger: Logger
) => Promise<string[]> = async (ctx, imageInput, logger) => {
  const {input, minWidth, minHeight, waterMark, position, wmImageFilePathType, wmImageSaveType} = imageInput;
  const sharpedWaterMark = sharp(waterMark);
  const waterMarkMeta = await sharpedWaterMark.metadata();

  const addedWaterMarkInput = await Promise.all(
    input.map(async image => {
      let addWaterMarkImagePath = '';

      // get image buffer data
      const imageBuffer = await getImageBufferData(ctx, image)

      const sharpedImage = sharp(imageBuffer);

      const {width, height, format} = await sharpedImage.metadata();
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
          const originExtname = path.extname(image)
          const extname = format || originExtname || 'png'
          const baseName = path.basename(image, `${originExtname}`)
          logger.info(`图片文件全名：${baseName}，图片类型：${extname}，文件名：${baseName}，文件后缀：${originExtname}`)

          let basePath
          switch (wmImageFilePathType) {
            case WmImageFilePathType.originImageBase:
              basePath = path.dirname(image)
              break;
            default:
              basePath = ctx.baseDir
              break
          }

          const addWaterMarkImageTmpPath = path.join(
            basePath,
            `${baseName}_${dayjs().format('YYYYMMDDHHmmss')}.${extname}`
          )

          await sharpedImage
            .composite([
              {
                input: await sharpedWaterMark.toBuffer(),
                ...coordinate
              }
            ]).toFile(addWaterMarkImageTmpPath)

          const originImageBakPath = path.join(
            path.dirname(image),
            `.${baseName}.${extname}`
          )
          await fs.rename(image, originImageBakPath);
          await fs.rename(addWaterMarkImageTmpPath, image);
          logger.info('watermark 水印添加成功')
          addWaterMarkImagePath = image
          logger.info(`原始图片原位置：${image}`)
          logger.info(`原始图片转移位置：${originImageBakPath}`)
          logger.info(`水印图片位置：${addWaterMarkImagePath}`)

          ctx.once('finished', () => {
            switch (wmImageSaveType) {
              case WmImageSaveType.abandon:
                fs.renameSync(originImageBakPath, image)
                break;
              case WmImageSaveType.replaceOrigin:
                fs.remove(originImageBakPath).catch((e) => {
                  ctx.log.error(e)
                })
                break;
              case WmImageSaveType.originNameWithTimestamp:
                fs.renameSync(addWaterMarkImagePath, addWaterMarkImageTmpPath);
                fs.renameSync(originImageBakPath, image);
                break;
              case WmImageSaveType.renameOrigin:
                fs.renameSync(originImageBakPath, addWaterMarkImageTmpPath);
                break;
            }
          })

          ctx.once('failed', () => {
            // 删除 picgo 生成的图片文件，例如 `~/.picgo/20200621205720.png`
            fs.remove(addWaterMarkImagePath).catch((e) => {
              ctx.log.error(e)
            })
          })
        }
      }
      return addWaterMarkImagePath
    })
  );

  logger.info('图片处理完毕')

  return addedWaterMarkInput;
};
