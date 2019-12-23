const sharp = require("sharp");
const path = require("path");
const svgStr = `<svg height="30" width="100%">
<text fill="red">ddasdasdasd</text>
</svg>`;

const TextToSVG = require("text-to-svg");
const textToSVG = TextToSVG.loadSync("./fonts/Arial-Unicode-MS.ttf");

const attributes = { fill: "#b2b2b2" };
const options = {
  x: 0,
  y: 0,
  fontSize: 12,
  anchor: "top",
  attributes: { fill: "#b2b2b2" }
};

const svg = textToSVG.getSVG("水印测试", options);
console.log(svg);
sharp(path.join(__dirname, "./640x300.png"))
  .composite([
    {
      input: Buffer.from(svg)
    }
  ])
  .toFile("./sd.jpg");
