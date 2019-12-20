import Picgo from "picgo";
import sharp from "sharp";
import path from "path";
export = (ctx: Picgo) => {
  const handle = async ctx => {
    const input = ctx.input;
    ctx.log.info(input);
    // const output = await Promise.all(
    //   input.map(image => {
    //     return sharp(image)
    //       .composite([
    //         {
    //           input: "/Users/dec-f/Assets/84x84.png"
    //         }
    //       ])
    //       .toFile(
    //         `/Users/dec-f/Project/picgo-plugin-watermark/ooo.${path.extname(
    //           image
    //         )}`
    //       );
    //   })
    // );
    return ctx;
  };
  const register = () => {
    ctx.helper.transformer.register("test", { handle });
  };
  return {
    register,
    transformer: "test" // 请将transformer的id注册在这里
  };
};
