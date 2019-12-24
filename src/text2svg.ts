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
  return textToSVG.getSVG(text, { ...fontOptions, ...options });
};
