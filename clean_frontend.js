const fs = require('fs');
const path = require('path');

function rmDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file, index) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        rmDir(curPath);
      } else {
        try { fs.unlinkSync(curPath); } catch(e){}
      }
    });
    try { fs.rmdirSync(dirPath); } catch(e){}
  }
}

console.log("Cleaning frontend node_modules...");
rmDir(path.join(__dirname, 'frontend/node_modules'));
try { fs.unlinkSync(path.join(__dirname, 'frontend/package-lock.json')); } catch(e){}
console.log("Done");
