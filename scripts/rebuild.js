const platform = require("os").platform;
const fs = require("fs");
const path = require("path");
const sourcePath = path.join(
  __dirname,
  `../external/sharp/${platform}/sharp.node`
);
const targetPath = path.join(
  __dirname,
  `../../../node_modules/sharp/build/Release/sharp.node`
);
fs.rename(sourcePath, targetPath, err => {
  if (err) throw new Error("copy sharp error");
});
