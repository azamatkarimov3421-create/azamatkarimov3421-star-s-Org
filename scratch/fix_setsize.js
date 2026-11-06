import fs from 'fs';

const p = 'C:/Users/Owner/.gemini/antigravity/scratch/imported_nur_chess/unpacked/Nur chess 100/src/components/Board3D.tsx';
let s = fs.readFileSync(p, 'utf8');

// Replace all setSize calls to use updateStyle = false and force 100% canvas size
s = s.replace(/renderer\.setSize\(width,\s*height\);/g, 'renderer.setSize(width, height, false);\n    canvas.style.width = "100%";\n    canvas.style.height = "100%";');
s = s.replace(/rendererRef\.current\.setSize\(w,\s*h\);/g, 'rendererRef.current.setSize(w, h, false);\n          if (canvasRef.current) {\n            canvasRef.current.style.width = "100%";\n            canvasRef.current.style.height = "100%";\n          }');

fs.writeFileSync(p, s, 'utf8');
console.log('Replaced setSize successfully!');
