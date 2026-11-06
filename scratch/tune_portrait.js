import fs from 'fs';

const p = 'C:/Users/Owner/.gemini/antigravity/scratch/imported_nur_chess/unpacked/Nur chess 100/src/components/Board3D.tsx';
let s = fs.readFileSync(p, 'utf8');

s = s.replace(
  'baseDist = isCinema ? 39.0 : 44.5;',
  'baseDist = isCinema ? 42.0 : 48.0;'
);
s = s.replace(
  'Math.max(1.0, 0.48 / aspect);',
  'Math.max(1.0, 0.46 / aspect);'
);

fs.writeFileSync(p, s, 'utf8');
console.log('Portrait baseDist set to 48.0!');
