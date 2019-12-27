const ELECTRON_VERSION = "6.1.7";

const path = require("path");
const rebuild = require("electron-rebuild").default;

console.log("path:", path.join(__dirname, "../../../"));
rebuild({
  buildPath: path.join(__dirname, "../../../"),
  force: true,
  debug: true,
  useCache: false,
  electronVersion: ELECTRON_VERSION
})
  .then(() => console.info("Rebuild Successful"))
  .catch(e => {
    console.error("Building modules didn't work!");
    console.error(e);
  });
