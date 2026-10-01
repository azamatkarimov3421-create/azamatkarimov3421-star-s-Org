const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8799;
const ROOT = path.resolve(__dirname, '..');

// 90° Upright Staunton tournament proportions:
// King is tallest, Pawn is ~70% of King, all pieces anchored at yOffset -0.52
const PIECES = [
  { name: 'pawn',   file: 'pawn.glb',   scaleFactor: 1.05, yOffset: -0.52, camY: 0.50, camZ: 2.55, lookY: 0.20, rotY: -90 },
  { name: 'rook',   file: 'rook.glb',   scaleFactor: 1.20, yOffset: -0.52, camY: 0.50, camZ: 2.55, lookY: 0.20, rotY: 195 },
  { name: 'knight', file: 'knight.glb', scaleFactor: 1.26, yOffset: -0.52, camY: 0.50, camZ: 2.55, lookY: 0.20, rotY: 28 },
  { name: 'bishop', file: 'bishop.glb', scaleFactor: 1.34, yOffset: -0.52, camY: 0.50, camZ: 2.55, lookY: 0.20, rotY: 195 },
  { name: 'queen',  file: 'queen.glb',  scaleFactor: 1.40, yOffset: -0.52, camY: 0.50, camZ: 2.55, lookY: 0.20, rotY: 195 },
  { name: 'king',   file: 'king.glb',   scaleFactor: 1.46, yOffset: -0.52, camY: 0.50, camZ: 2.55, lookY: 0.20, rotY: 195 },
  { name: 'nur',    file: 'nur.glb',    scaleFactor: 1.40, yOffset: -0.52, camY: 0.50, camZ: 2.55, lookY: 0.20, rotY: 195 },
];

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        for (const [filename, dataUrl] of Object.entries(data)) {
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');

          const pubPath = path.join(ROOT, 'public', 'pieces', filename);
          const distPath = path.join(ROOT, 'dist', 'pieces', filename);

          fs.mkdirSync(path.dirname(pubPath), { recursive: true });
          fs.writeFileSync(pubPath, buffer);
          console.log('Saved:', filename, buffer.length, 'bytes');

          if (fs.existsSync(path.join(ROOT, 'dist'))) {
            fs.mkdirSync(path.dirname(distPath), { recursive: true });
            fs.writeFileSync(distPath, buffer);
          }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        console.log('All 14 pieces rendered and saved successfully!');
        setTimeout(() => {
          server.close();
          process.exit(0);
        }, 1500);
      } catch (err) {
        console.error('Error saving image:', err);
        res.writeHead(500);
        res.end(err.message);
      }
    });
    return;
  }

  if (req.url === '/render') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Master 3D Piece Renderer (90° Upright)</title>
  <script type="importmap">
    {
      "imports": {
        "three": "/node_modules/three/build/three.module.js",
        "three/addons/": "/node_modules/three/examples/jsm/"
      }
    }
  </script>
</head>
<body style="background: transparent; margin: 0; overflow: hidden;">
  <canvas id="c" width="512" height="512"></canvas>
  <div id="log" style="color: white; font-family: sans-serif; position: absolute; top: 10px; left: 10px;"></div>
  <script type="module">
    import * as THREE from 'three';
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

    const canvas = document.getElementById('c');
    const width = 512;
    const height = 512;
    const logEl = document.getElementById('log');

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const pieces = ${JSON.stringify(PIECES)};
    const loader = new GLTFLoader();
    const results = {};

    function renderPiece(gltf, cfg, isWhite) {
      const scene = new THREE.Scene();

      // Soft Ambient Light
      const amb = new THREE.AmbientLight(0xfff6ea, isWhite ? 0.85 : 0.95);
      scene.add(amb);

      // Key Warm Directional Light
      const key = new THREE.DirectionalLight(0xfffaec, isWhite ? 2.6 : 3.0);
      key.position.set(1.5, 4.5, 3.0);
      key.castShadow = true;
      key.shadow.mapSize.width = 1024;
      key.shadow.mapSize.height = 1024;
      key.shadow.radius = 3.5;
      key.shadow.bias = -0.0005;
      scene.add(key);

      // Fill Cool Directional Light
      const fill = new THREE.DirectionalLight(0xcde0ff, isWhite ? 1.1 : 1.5);
      fill.position.set(-3.5, 2.5, 2.0);
      scene.add(fill);

      // Strong Specular Rim Light (outlines curves with crisp silver/gold rim)
      const rim = new THREE.DirectionalLight(isWhite ? 0xfff0dc : 0xd8eeff, isWhite ? 2.5 : 4.6);
      rim.position.set(0, 3.8, -3.8);
      scene.add(rim);

      // Soft Floor bounce light
      const bounce = new THREE.DirectionalLight(0xffecd0, 0.40);
      bounce.position.set(0, -2, 2.5);
      scene.add(bounce);

      // Clone model
      const model = gltf.scene.clone(true);

      // Apply Materials matching reference image
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          const orig = Array.isArray(child.material) ? child.material[0] : child.material;
          const origNormal = orig?.normalMap || null;

          if (isWhite) {
            // Warm ivory / polished cream
            child.material = new THREE.MeshStandardMaterial({
              color: new THREE.Color(0xf6ede0),
              roughness: 0.18,
              metalness: 0.04,
              normalMap: origNormal,
              normalScale: new THREE.Vector2(1.5, 1.5)
            });
          } else {
            // Polished obsidian / satin ebony with silver specular highlight
            child.material = new THREE.MeshStandardMaterial({
              color: new THREE.Color(0x1d1b1a),
              roughness: 0.22,
              metalness: 0.18,
              normalMap: origNormal,
              normalScale: new THREE.Vector2(1.5, 1.5)
            });
          }
        }
      });

      // Compute bounding box
      const box = new THREE.Box3().setFromObject(model);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = cfg.scaleFactor / maxDim;
      model.scale.set(scale, scale, scale);

      model.position.x = -center.x * scale;
      model.position.y = -box.min.y * scale + cfg.yOffset;
      model.position.z = -center.z * scale;
      model.rotation.y = (cfg.rotY * Math.PI) / 180;
      scene.add(model);

      // Contact shadow on ground floor
      const floorGeo = new THREE.PlaneGeometry(5, 5);
      const floorMat = new THREE.ShadowMaterial({ opacity: isWhite ? 0.38 : 0.52 });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = cfg.yOffset;
      floor.receiveShadow = true;
      scene.add(floor);

      // Camera: Elevation ~6.7° so pieces stand 90° upright, majestic and tall
      const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
      camera.position.set(0, cfg.camY, cfg.camZ);
      camera.lookAt(0, cfg.lookY, 0);

      renderer.render(scene, camera);
      return canvas.toDataURL('image/png');
    }

    async function processAll() {
      for (const piece of pieces) {
        logEl.textContent = 'Loading ' + piece.name + '...';
        await new Promise((resolve) => {
          loader.load('/public/models/' + piece.file, (gltf) => {
            logEl.textContent = 'Rendering ' + piece.name + '...';
            results['3d_' + piece.name + '_white.png'] = renderPiece(gltf, piece, true);
            results['3d_' + piece.name + '_black.png'] = renderPiece(gltf, piece, false);
            resolve();
          }, undefined, (err) => {
            console.error('Error loading ' + piece.name, err);
            resolve();
          });
        });
      }

      logEl.textContent = 'Saving all rendered pieces...';
      fetch('/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(results)
      }).then(r => r.json()).then(data => {
        logEl.textContent = 'DONE!';
      }).catch(e => {
        logEl.textContent = 'Error: ' + e;
      });
    }

    processAll();
  </script>
</body>
</html>`);
    return;
  }

  // Static files
  let safePath = path.normalize(req.url.split('?')[0]);
  if (safePath === '/') safePath = '/index.html';
  const filePath = path.join(ROOT, safePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.css': 'text/css',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.glb': 'model/gltf-binary'
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found: ' + req.url);
  }
});

server.listen(PORT, () => {
  console.log('Master render server running on http://localhost:' + PORT);
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const cmd = `"${edgePath}" --headless --disable-gpu=false --use-gl=angle --remote-debugging-port=0 http://localhost:${PORT}/render`;
  console.log('Launching Edge to render all 14 master 3D pieces...');
  exec(cmd, (err) => {
    if (err) console.error('Edge exec notice:', err);
  });
});
