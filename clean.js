const fs = require('fs');
const path = require('path');

function rmDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file, index) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        rmDir(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

console.log("Cleaning backend node_modules...");
rmDir(path.join(__dirname, 'backend/node_modules'));
try { fs.unlinkSync(path.join(__dirname, 'backend/package-lock.json')); } catch(e){}

console.log("Cleaning frontend node_modules...");
rmDir(path.join(__dirname, 'frontend/node_modules'));
try { fs.unlinkSync(path.join(__dirname, 'frontend/package-lock.json')); } catch(e){}

console.log("Done");
