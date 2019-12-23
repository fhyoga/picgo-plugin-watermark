# picgo-plugin-watermark

# Features

- Add watermark to picture

# Installation

Open [PicGo](https://github.com/Molunerfinn/PicGo) and add this plugin `picgo-plugin-watermark`

### Setting

#### text

水印文字

#### fontSize

字体大小，默认`14`

#### image

水印图片，优先级大于文字

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
