const ELECTRON_VERSION = "6.1.7";

const { exec } = require("child_process");
const { npm_config_argv } = process.env;
const argv = JSON.parse(npm_config_argv).original[1] || "";
/*
 * e.g."npm_config_argv": "{\"remain\":[],\"cooked\":[\"add\"],\"original\":[\"add\",\"/Users/* dec-f/Project/picgo-plugin-watermark"]}"
 *
 * To exclude local development scenarios
 * When developing locally, node_modules is not flattened and no processing is required
 */
console.log("npm_config_argv: ", npm_config_argv);
console.log("argv: ", argv);
console.log("isDev: ", /\//.test(argv));
if (/\//.test(argv)) {
  exec(`npx electron-rebuild --version ${ELECTRON_VERSION}`, (err, stdout) => {
    console.log("err", err);
    console.log("stdout: ", stdout);
  });
} else {
  `cd ../../ && ls && npx electron-rebuild --version ${ELECTRON_VERSION}`,
    (err, stdout) => {
      console.log("err", err);
      console.log("stdout: ", stdout);
    };
}
