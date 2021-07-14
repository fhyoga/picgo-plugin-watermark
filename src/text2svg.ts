import TextToSVG from "text-to-svg";
import { fontOptions } from "./attr";

let textToSVG = null;
export const loadFontFamily = (fontFamily: string): void => {
  textToSVG = TextToSVG.loadSync(fontFamily);
};
export const getSvg = (
  text: string,
  options?: { fontSize?: number; [propName: string]: any }
): string => {
  const svgOptions: {[propName: string]: any} = {
    attributes: {},
    ...fontOptions
  }
  if (options) {
    svgOptions.attributes = {
      ...svgOptions.attributes,
      ...options
    }
    if (options.fontSize) {
      svgOptions.fontSize = options.fontSize
    }
  }
  return textToSVG.getSVG(text, svgOptions);
};
