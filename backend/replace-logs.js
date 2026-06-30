import fs from 'fs';
import path from 'path';

const getAllFiles = (dirPath, arrayOfFiles) => {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.js') && file !== 'logger.js' && file !== 'validateEnv.js') {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });
  return arrayOfFiles;
};

const files = getAllFiles('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('console.log') || content.includes('console.error')) {
    // Determine relative path to logger
    const depth = file.split(path.sep).length - 2; // -1 for src, -1 for filename
    let loggerPath = '../config/logger.js';
    if (depth === 1) loggerPath = '../config/logger.js';
    else if (depth === 2) loggerPath = '../../config/logger.js';
    else if (depth === 0) loggerPath = './config/logger.js';
    
    // Add import if not present
    if (!content.includes('logger.js')) {
      const lines = content.split('\n');
      let lastImportIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          lastImportIndex = i;
        }
      }
      lines.splice(lastImportIndex + 1, 0, `import logger from '${loggerPath}';`);
      content = lines.join('\n');
    }
    
    // Replace console
    content = content.replace(/console\.log\(/g, 'logger.info(');
    content = content.replace(/console\.error\(/g, 'logger.error(');
    
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
