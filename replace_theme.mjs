import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

let count = 0;
walkDir('./src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('indigo')) {
      // Replace indigo with amber
      let newContent = content.replace(/indigo/g, 'amber');
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Replaced in ${filePath}`);
      count++;
    }
  }
});

console.log(`Finished replacing in ${count} files.`);
