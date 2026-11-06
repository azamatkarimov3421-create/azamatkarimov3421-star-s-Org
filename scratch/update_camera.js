import fs from 'fs';

const p = 'C:/Users/Owner/.gemini/antigravity/scratch/imported_nur_chess/unpacked/Nur chess 100/src/components/Board3D.tsx';
let s = fs.readFileSync(p, 'utf8');

const targetRegex = /const isCinema = !!cinemaModeRef\.current;[\s\S]*?cameraRef\.current\.updateProjectionMatrix\(\);/m;

const replacement = `const isCinema = !!cinemaModeRef.current;
      const isLandscape = aspect > 1.05;

      let baseDist: number;
      let lookAtZ: number;

      if (isLandscape) {
        // Gorizontal ko'rinish: foydalanuvchi chizgan binafsha chiziqqacha (ekran bo'yicha 95% vertikal)
        baseDist = isCinema ? 14.2 : 15.6;
        lookAtZ = 0.75;
      } else {
        // Vertikal telefon: barcha 10 ta ustun (A-H) va raqamlar (1-10) to'liq va maksimal keng
        baseDist = isCinema ? 36.5 : 40.5;
        lookAtZ = 0.50;
      }

      const scaleFactor = isLandscape
        ? Math.max(1.0, 1.40 / aspect)
        : Math.max(1.0, 0.46 / aspect);

      const camDist = baseDist * scaleFactor;
      const camY = 0.84 * camDist;
      const camZ = lookAtZ + 0.54 * camDist;

      cameraRef.current.position.set(0, camY, camZ);
      cameraRef.current.lookAt(0, 0, lookAtZ);
      cameraRef.current.updateProjectionMatrix();`;

s = s.replace(targetRegex, replacement);
fs.writeFileSync(p, s, 'utf8');
console.log('Camera calibration updated successfully!');
