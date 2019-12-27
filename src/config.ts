import Picgo from "picgo";
import { PluginConfig } from "picgo/dist/src/utils/interfaces";

export const config: (ctx: Picgo) => PluginConfig[] = ctx => {
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
    },
    {
      name: "minSize",
      type: "input",
      default: userConfig.minSize,
      required: false,
      message: "最小尺寸限制，小于这一尺寸不添加水印。E.g.200*200",
      alias: "最小尺寸"
    }
  ];
};
