import fs from 'fs';

const p = 'C:/Users/Owner/.gemini/antigravity/scratch/imported_nur_chess/unpacked/Nur chess 100/src/components/Board3D.tsx';
let s = fs.readFileSync(p, 'utf8');

// Insert window.__DEBUG__ logs
s = s.replace(
  'const updateCameraForAspect = (w: number, h: number) => {',
  `const updateCameraForAspect = (w: number, h: number) => {
      (window as any).__BOARD_DEBUG__ = { w, h, aspect: w/h, time: Date.now() };`
);

fs.writeFileSync(p, s, 'utf8');
console.log('Inserted debug log');
