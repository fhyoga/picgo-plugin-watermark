# picgo-plugin-watermark

# Screenshot

![](https://gitee.com/Dec-F/ImageHosting/raw/master/img/2019/12/25/20191225174743.png)

![](https://gitee.com/Dec-F/ImageHosting/raw/master/img/2000-57139f0ecc19a932873e59a055d486d8.jpg)

![](https://gitee.com/Dec-F/ImageHosting/raw/master/img/2019/12/27/20191227170849.jpg)

# Features

Add watermark to picture

# Installation

Open [PicGo](https://github.com/Molunerfinn/PicGo)>=2.2.0 and add this plugin `picgo-plugin-watermark`

### Setting

#### fontFamily

字体文件路径。E.g.`/Users/fonts/Arial-Unicode-MS.ttf`。

默认只支持英文水印，中文支持需要自行导入中文字体文件。

#### text

水印文字。E.g.`hello world`

#### fontSize

字体大小，默认`14`

#### image

水印图片路径。E.g.`/Users/watermark.png`，优先级大于文字

#### position

位置，默认`rb`

```js
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
```

#### minSize

原图最小尺寸，小于这一尺寸不添加水印。E.g.200\*200。

高度或宽度任何一个小于限制，都会触发

# ChangeLog

[ChangeLog](https://github.com/Dec-F/picgo-plugin-watermark/blob/master/CHANGELOG.md)
