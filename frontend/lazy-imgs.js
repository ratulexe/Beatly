import fs from 'fs';
import path from 'path';

const getAllFiles = (dirPath, arrayOfFiles) => {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.jsx')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });
  return arrayOfFiles;
};

const files = getAllFiles('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('<img ')) {
    // Basic replacement for tags that don't already have loading="lazy"
    // Regex matches <img ...> and ensures we don't duplicate
    const updatedContent = content.replace(/<img\s+(?![^>]*loading=["']lazy["'])/g, '<img loading="lazy" ');
    
    if (content !== updatedContent) {
      fs.writeFileSync(file, updatedContent);
      console.log(`Updated images in ${file}`);
    }
  }
});
