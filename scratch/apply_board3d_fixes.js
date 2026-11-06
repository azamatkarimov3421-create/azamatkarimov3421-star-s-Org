import fs from 'fs';

const filePath = 'C:/Users/Owner/.gemini/antigravity/scratch/imported_nur_chess/unpacked/Nur chess 100/src/components/Board3D.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Initial width/height and renderer.setSize
const oldInit = `    const width = container.clientWidth || 800;
    const height = container.clientHeight || 800;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true, // Shaffof fon — orqa fonga tabiiy qo'shiladi!
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);`;

const newInit = `    const width = container.clientWidth || window.innerWidth || 800;
    const height = container.clientHeight || window.innerHeight || 800;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true, // Shaffof fon — orqa fonga tabiiy qo'shiladi!
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height, false);`;

if (!content.includes('renderer.setSize(width, height, false);')) {
  content = content.replace(oldInit, newInit);
}

// 2. updateCameraForAspect
const oldCameraSection = `    const updateCameraForAspect = (w: number, h: number) => {
      if (!cameraRef.current) return;
      const aspect = w / h;
      cameraRef.current.aspect = aspect;

      // Responsive masofa va balandlik: telefonning tor vertikal ekranida (aspect < 0.94)
      // doskaning 10 ta ustuni va 1-10 raqamlari har doim to'liq ekranga sig'adi!
      // Qulay, keng va professional 61 darajali ko'rish burchagi
      // Responsive masofa va burchak:
      // Foydalanuvchi chizgan binafsha chiziqlar bo'yicha doska maksimal katta qilib o'rnatiladi!
      // Cinema Mode (Kino ko'rish rejimi) yoqilganda esa doska butun ekranni 98% to'ldiradi!
      const isCinema = !!cinemaModeRef.current;
      const baseDist = isCinema ? 14.8 : 16.6;
      const lookAtY = 0.0;
      const lookAtZ = 0.22;

      // Mobil vertikal va gorizontal ekranlarda masofani proporsional moslash
      // Samsung A10 dan S26 gacha, Redmi, Honor va barcha telifonlarga 100% moslash
      const isLandscape = aspect > 1.15;
      const scaleFactor = isLandscape
        ? (isCinema ? Math.max(1.0, 1.48 / aspect) : Math.max(1.0, 1.58 / aspect))
        : (isCinema ? Math.max(1.0, 1.04 / aspect) : Math.max(1.0, 1.12 / aspect));

      const camDist = baseDist * scaleFactor;

      const camY = lookAtY + 0.84 * camDist;
      const camZ = lookAtZ + 0.54 * camDist;

      cameraRef.current.position.set(0, camY, camZ);
      cameraRef.current.lookAt(0, lookAtY, lookAtZ);
      cameraRef.current.updateProjectionMatrix();
    };`;

const newCameraSection = `    const updateCameraForAspect = (w: number, h: number) => {
      if (!cameraRef.current) return;
      const aspect = w / h;
      cameraRef.current.aspect = aspect;

      // Foydalanuvchi chizgan binafsha chiziqlar bo'yicha doska maksimal katta hajmga keltiriladi!
      // Landscape: doska vertikal bo'yicha deyarli 95% to'ldiradi, chet tugmalarga xalal bermaydi
      // Portrait: doska barcha 10 ta ustun (A-H) va raqamlarni (1-10) to'liq, markazlashgan va maksimal ko'rsatadi
      const isCinema = !!cinemaModeRef.current;
      const isLandscape = aspect > 1.05;

      let baseDist: number;
      let lookAtZ: number;

      if (isLandscape) {
        // Gorizontal ko'rinish
        baseDist = isCinema ? 14.2 : 15.6;
        lookAtZ = 0.75;
      } else {
        // Vertikal telefon ko'rinishi
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
      cameraRef.current.updateProjectionMatrix();
    };`;

content = content.replace(oldCameraSection, newCameraSection);

// 3. renderLoop and resizeObserver
const oldLoop = `    // Render sikli
    const renderLoop = () => {
      animFrameRef.current = requestAnimationFrame(renderLoop);
      renderer.render(scene, camera);
    };
    renderLoop();

    // Resize kuzatuvchisi
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          updateCameraForAspect(w, h);
          rendererRef.current.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // Telifon ekrani burilganda (Samsung, Redmi, Honor va boshqalar) darhol kamerani tekislash
    const handleOrientationChange = () => {
      const recompute = () => {
        if (!container || !cameraRef.current || !rendererRef.current) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        if (w > 0 && h > 0) {
          updateCameraForAspect(w, h);
          rendererRef.current.setSize(w, h);
        }
      };
      recompute();
      setTimeout(recompute, 80);
      setTimeout(recompute, 280);
    };`;

const newLoop = `    // Render sikli (dinamik o'lcham va tomonlar nisbatini nazorat qiladi)
    const renderLoop = () => {
      animFrameRef.current = requestAnimationFrame(renderLoop);
      if (container && rendererRef.current && cameraRef.current) {
        const curW = container.clientWidth || window.innerWidth;
        const curH = container.clientHeight || window.innerHeight;
        if (curW > 0 && curH > 0) {
          const curAspect = curW / curH;
          if (Math.abs(cameraRef.current.aspect - curAspect) > 0.005) {
            updateCameraForAspect(curW, curH);
            rendererRef.current.setSize(curW, curH, false);
          }
        }
      }
      renderer.render(scene, camera);
    };
    renderLoop();

    // Resize kuzatuvchisi
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.round(entry.contentRect.width || container.clientWidth || window.innerWidth);
        const h = Math.round(entry.contentRect.height || container.clientHeight || window.innerHeight);
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          updateCameraForAspect(w, h);
          rendererRef.current.setSize(w, h, false);
        }
      }
    });
    resizeObserver.observe(container);

    // Telifon ekrani burilganda darhol kamerani tekislash
    const handleOrientationChange = () => {
      const recompute = () => {
        if (!container || !cameraRef.current || !rendererRef.current) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        if (w > 0 && h > 0) {
          updateCameraForAspect(w, h);
          rendererRef.current.setSize(w, h, false);
        }
      };
      recompute();
      setTimeout(recompute, 50);
      setTimeout(recompute, 150);
      setTimeout(recompute, 300);
    };`;

content = content.replace(oldLoop, newLoop);

// 4. Canvas style
content = content.replace(
  'className="w-full h-full block cursor-pointer select-none touch-none bg-transparent"',
  'className="w-full h-full block cursor-pointer select-none touch-none bg-transparent" style={{ width: "100%", height: "100%", display: "block" }}'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Board3D updated successfully!');
