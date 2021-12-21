import Picgo from "picgo";
import { IPluginConfig } from "picgo/dist/src/utils/interfaces";

import {IConfig} from './util'

export enum WmImageFilePathType {
  picGoBase = '默认目录',
  originImageBase = '原文件所在目录'
}

export enum WmImageSaveType {
  abandon = '删除水印图片',
  replaceOrigin = '替换原文件',
  originNameWithTimestamp = '使用原文件名称+时间戳',
  renameOrigin = '使用原文件名称，原文件重命名'
}

export const config: (ctx: Picgo) => IPluginConfig[] = ctx => {
  let userConfig = ctx.getConfig<IConfig>("picgo-plugin-watermark");
  if (!userConfig) {
    userConfig = {
      image: '',
      fontFamily: '',
      fontSize: '',
      textColor: '',
      minSize: '',
      position: '',
      text: '',
      wmImageFilePathType: WmImageFilePathType.picGoBase,
      wmImageSaveType: WmImageSaveType.abandon,
    };
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
      name: "textColor",
      type: "input",
      default: userConfig.textColor,
      required: false,
      message: "文字的颜色，支持rgb和hex格式，如rgb(178, 178, 178)或#b2b2b2",
      alias: "水印文字颜色"
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
    },
    {
      name: "wmImageFilePathType",
      type: "list",
      choices: Object.values(WmImageFilePathType),
      default: userConfig.wmImageFilePathType || WmImageFilePathType.picGoBase,
      required: false,
      message: "请选择水印图片临时文件存储位置",
      alias: "水印图片临时文件存储位置"
    },
    {
      name: "wmImageSaveType",
      type: "list",
      choices: Object.values(WmImageSaveType),
      default: userConfig.wmImageSaveType || WmImageSaveType.abandon,
      required: false,
      message: "请选择水印图片存储方式",
      alias: "水印图片存储方式"
    }
  ];
};
