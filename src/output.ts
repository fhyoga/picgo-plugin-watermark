import sharp from "sharp";
import path from "path";
import Logger from "picgo/dist/src/lib/Logger";
import { getCoordinateByPosition, PositionType } from "./util";

interface IInput {
  input: any[];
  minWidth: number;
  minHeight: number;
  position: string;
  waterMark: string | Buffer;
}
interface IOutput {
  width: number;
  height: number;
  fileName: string;
  extname: string;
  buffer: Buffer;
}
export const outputGen: (
  iinput: IInput,
  logger: Logger
) => Promise<IOutput[]> = async (imageInput, logger) => {
  const { input, minWidth, minHeight, waterMark, position } = imageInput;
  const sharpedWaterMark = sharp(waterMark);
  const waterMarkMeta = await sharpedWaterMark.metadata();
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
      logger.info(JSON.stringify(coordinate));
      let transformedImage = {
        width,
        height,
        fileName,
        extname,
        buffer: null
      };

      // Picture width or length is too short, do not add watermark
      // Or trigger minimum size limit
      if (
        coordinate.left <= 0 ||
        coordinate.top <= 0 ||
        width <= minWidth ||
        height <= minHeight
      ) {
        transformedImage.buffer = await sharpedImage.toBuffer();
      } else {
        transformedImage.buffer = await sharpedImage
          .composite([
            {
              input: await sharpedWaterMark.toBuffer(),
              ...coordinate
            }
          ])
          .toBuffer();
      }
      return transformedImage;
    })
  );
  return output;
};
