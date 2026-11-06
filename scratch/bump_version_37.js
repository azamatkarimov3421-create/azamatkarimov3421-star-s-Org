import fs from 'fs';

const bgPath = 'C:/Users/Owner/.gemini/antigravity/scratch/imported_nur_chess/unpacked/Nur chess 100/android/app/build.gradle';
let bg = fs.readFileSync(bgPath, 'utf8');
bg = bg.replace(/versionCode \d+/, 'versionCode 37');
bg = bg.replace(/versionName "[^"]+"/, 'versionName "1.2.16"');
fs.writeFileSync(bgPath, bg, 'utf8');

const pjPath = 'C:/Users/Owner/.gemini/antigravity/scratch/imported_nur_chess/unpacked/Nur chess 100/package.json';
let pj = fs.readFileSync(pjPath, 'utf8');
pj = pj.replace(/"version": "[^"]+"/, '"version": "1.2.16"');
fs.writeFileSync(pjPath, pj, 'utf8');

console.log('Bumped version to 37 (1.2.16) successfully');
