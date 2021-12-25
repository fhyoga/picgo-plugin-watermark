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

          addWaterMarkImagePath = path.join(
            basePath,
            `${baseName}_${dayjs().format('YYYYMMDDHHmmss')}.${extname}`
          )
          logger.info(`图片路径: ${addWaterMarkImagePath}`)

          switch (wmImageSaveType) {
            case WmImageSaveType.replaceOrigin:
              addWaterMarkImagePath = image
              break
            case WmImageSaveType.renameOrigin:
              ctx.once('finished', () => {
                let originImageTargetPath = path.join(
                  path.dirname(image),
                  `${baseName}_o_${dayjs().format('YYYYMMDDHHmmss')}.${extname}`
                )

                fs.rename(image, originImageTargetPath, function (err) {
                  if (err) {
                    logger.info(JSON.stringify(coordinate));
                    ctx.emit("notification", {
                      title: "图片重命名失败",
                      body: "原文件从" + image + "重命名为" + originImageTargetPath + "失败"
                    })
                    return
                  }
                  fs.rename(addWaterMarkImagePath, image, function (err2) {
                    if (err2) {
                      logger.info(JSON.stringify(coordinate));
                      ctx.emit("notification", {
                        title: "图片重命名失败",
                        body: "水印文件从" + addWaterMarkImagePath + "重命名为" + image + "失败"
                      })
                      return
                    }
                  });
                });

              })
              break
            case WmImageSaveType.originNameWithTimestamp:
              addWaterMarkImagePath = path.join(
                path.dirname(image),
                `${baseName}_${dayjs().format('YYYYMMDDHHmmss')}.${extname}`
              )
              break
            default:
              ctx.once('finished', () => {
                // 删除 picgo 生成的图片文件，例如 `~/.picgo/20200621205720.png`
                fs.remove(addWaterMarkImagePath).catch((e) => {
                  ctx.log.error(e)
                })
              })
              break
          }
          ctx.once('failed', () => {
            // 删除 picgo 生成的图片文件，例如 `~/.picgo/20200621205720.png`
            fs.remove(addWaterMarkImagePath).catch((e) => {
              ctx.log.error(e)
            })
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

  logger.info('图片处理完毕')

  return addedWaterMarkInput;
};
