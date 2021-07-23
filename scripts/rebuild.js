const platform = require("os").platform;
const fs = require("fs-extra");
const path = require("path");

const sharpNodeUrl =`https://raw.githubusercontent.com/fhyoga/picgo-plugin-watermark/v1.0.0/external/sharp/${platform}/sharp.node`;

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    var ws = fs.createWriteStream(dest);
    const request = /^https:\/\//.test(url) ? require('https') : require('http')
    request.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(response.statusMessage)
        return
      }
      console.log('sharp.node file is downloading...')
      response.pipe(ws);
      ws.on('finish', () => {
        console.log('')
        console.log('sharp.node download complete')
        ws.close();
        resolve()
      });
      response.on('data', () => {
        process.stdout.write('=')
      })
    }).on('error', (err) => { 
      // Handle errors
      // Delete the file async. (But we don't check the result)
      console.log('')
      console.log('sharp.node download fail')
      fs.unlink(dest, () => {});
      reject(err.message)
    })
  })
}

// is CI?
console.log(process.env.SKIP_REBUILD);
if (process.env.SKIP_REBUILD) return

(async () => {
  const targetDir = path.join(
    __dirname,
    `../../../node_modules/sharp`
  )
  // as a npm package to install 
  if (fs.existsSync(targetDir)) {
    const targetPath = path.join(
      __dirname,
      `../../../node_modules/sharp/build/Release/sharp.node`
    );
    // Most modern macOS, Windows and Linux systems
    // sharp(0.28.3) package will auto fetch sharp.node file
    if (!fs.existsSync(targetPath)) {
      const sourcePath = path.join(
        __dirname,
        `../external/sharp/${platform}/sharp.node`
      );
      if (!fs.existsSync(sourcePath)) {
        try {
          fs.mkdirpSync(path.dirname(sourcePath))
          // download sharp.node
          await downloadFile(sharpNodeUrl, sourcePath)
        } catch (error) {
          throw new Error(error)
        }
      }
      try {
        await fs.rename(sourcePath, targetPath);
      } catch (error) {
        throw new Error("copy sharp error")
      }
    }
  }
  console.log('watermark plugin install completed')
})()
