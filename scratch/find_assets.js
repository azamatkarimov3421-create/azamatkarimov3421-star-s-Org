import fs from 'fs';
import path from 'path';

function searchDir(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist' && f !== 'android') searchDir(full);
    } else if (f.endsWith('.ts') || f.endsWith('.tsx')) {
      const content = fs.readFileSync(full, 'utf8');
      const regex = /['"](\/(pieces|models|sounds|assets|textures)\/[^'"]+)['"]/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        console.log(`${full}: ${match[1]}`);
      }
    }
  }
}

searchDir('src');
