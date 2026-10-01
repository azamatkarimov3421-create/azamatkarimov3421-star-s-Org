const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8888;
const ROOT = path.resolve(__dirname, '..');

const server = http.createServer((req, res) => {
  let safePath = path.normalize(req.url.split('?')[0]);
  if (safePath === '/') safePath = '/test';

  if (req.url.startsWith('/test')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Wide 3D Chess Board Test</title>
  <script type="importmap">
    {
      "imports": {
        "three": "/node_modules/three/build/three.module.js",
        "three/addons/": "/node_modules/three/examples/jsm/"
      }
    }
  </script>
  <style>
    body { margin: 0; background: #120d09 url('/public/textures/wood_table_bg.jpg') center/cover; overflow: hidden; }
    canvas { width: 100vw; height: 100vh; display: block; }
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <script type="module">
    import * as THREE from 'three';
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

    const canvas = document.getElementById('c');
    const width = 1600;
    const height = 900;
    canvas.width = width;
    canvas.height = height;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0); // Transparent background!
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.10;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();

    // ── Seamless Soft Shadow Receiver Plane (Transparent ShadowMaterial) ──
    const shadowGeo = new THREE.PlaneGeometry(60, 60);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.58 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.40;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // ── Board Dimensions (10x10) ──
    const SQ_SIZE = 1.0;
    const BOARD_WIDTH = 10 * SQ_SIZE;
    const FRAME_MARGIN = 0.52;
    const TOTAL_WIDTH = BOARD_WIDTH + FRAME_MARGIN * 2;
    const BOARD_THICKNESS = 0.40;

    // ── Warm Golden-Honey Wood Frame with Official Nur Chess 100 Coordinates ──
    const FILES = ['A', 'B', 'C', 'N', 'E', 'D', 'M', 'F', 'G', 'H'];

    function createFrameTextureWithCoords() {
      const cv = document.createElement('canvas');
      cv.width = 1024;
      cv.height = 1024;
      const ctx = cv.getContext('2d');

      const img = new Image();
      img.src = '/public/textures/wood_frame.jpg';
      return new Promise(resolve => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, 1024, 1024);

          ctx.fillStyle = 'rgba(165, 115, 60, 0.25)';
          ctx.fillRect(0, 0, 1024, 1024);

          const marginPx = (FRAME_MARGIN / TOTAL_WIDTH) * 1024;
          const innerSize = 1024 - marginPx * 2;

          ctx.strokeStyle = '#221105';
          ctx.lineWidth = 4;
          ctx.strokeRect(marginPx, marginPx, innerSize, innerSize);

          ctx.strokeStyle = '#85552a';
          ctx.lineWidth = 2;
          ctx.strokeRect(marginPx - 2, marginPx - 2, innerSize + 4, innerSize + 4);

          ctx.font = 'bold 24px system-ui, sans-serif';
          ctx.fillStyle = '#2b1608';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const sqPx = innerSize / 10;

          // Bottom letters & Top letters
          for (let f = 0; f < 10; f++) {
            const x = marginPx + (f + 0.5) * sqPx;
            ctx.fillText(FILES[f], x, 1024 - marginPx * 0.46);
            ctx.fillText(FILES[f], x, marginPx * 0.46);
          }

          // Left ranks & Right ranks (1 at bottom, 10 at top)
          for (let r = 0; r < 10; r++) {
            const y = marginPx + (9 - r + 0.5) * sqPx;
            ctx.fillText(String(r + 1), marginPx * 0.46, y);
            ctx.fillText(String(r + 1), 1024 - marginPx * 0.46, y);
          }

          const tex = new THREE.CanvasTexture(cv);
          tex.needsUpdate = true;
          resolve(tex);
        };
        img.onerror = () => {
          const fallback = new THREE.TextureLoader().load('/public/textures/wood_frame.jpg');
          resolve(fallback);
        };
      });
    }

    const frameTex = await createFrameTextureWithCoords();
    const frameGeo = new THREE.BoxGeometry(TOTAL_WIDTH, BOARD_THICKNESS, TOTAL_WIDTH);
    const frameMat = new THREE.MeshStandardMaterial({
      map: frameTex,
      roughness: 0.44,
      metalness: 0.04,
      color: 0xdeb887
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.y = -BOARD_THICKNESS / 2;
    frameMesh.castShadow = true;
    frameMesh.receiveShadow = true;
    scene.add(frameMesh);

    // ── 10x10 Squares ──
    const textureLoader = new THREE.TextureLoader();
    const lightTex = textureLoader.load('/public/textures/wood_light_square.jpg');
    const darkTex = textureLoader.load('/public/textures/wood_dark_square.jpg');

    const lightMat = new THREE.MeshStandardMaterial({
      map: lightTex,
      roughness: 0.42,
      metalness: 0.02,
      color: 0xffeedd
    });
    const darkMat = new THREE.MeshStandardMaterial({
      map: darkTex,
      roughness: 0.38,
      metalness: 0.02,
      color: 0x824e2b
    });

    const sqGeo = new THREE.BoxGeometry(SQ_SIZE, 0.035, SQ_SIZE);
    for (let r = 0; r < 10; r++) {
      for (let f = 0; f < 10; f++) {
        const isLight = (r + f) % 2 !== 0;
        const sq = new THREE.Mesh(sqGeo, isLight ? lightMat : darkMat);
        sq.position.x = (f - 4.5) * SQ_SIZE;
        sq.position.z = (4.5 - r) * SQ_SIZE;
        sq.position.y = 0.018;
        sq.receiveShadow = true;
        scene.add(sq);
      }
    }

    // ── Front Rim Plinth (Attached to front of board, tilted for readability) ──
    const rimCanvas = document.createElement('canvas');
    rimCanvas.width = 1024;
    rimCanvas.height = 64;
    const rimCtx = rimCanvas.getContext('2d');
    rimCtx.fillStyle = '#1c1007';
    rimCtx.fillRect(0, 0, 1024, 64);
    rimCtx.strokeStyle = '#7a421f';
    rimCtx.lineWidth = 4;
    rimCtx.strokeRect(2, 2, 1020, 60);

    rimCtx.fillStyle = '#f5ede0';
    rimCtx.font = 'bold 26px system-ui, sans-serif';
    rimCtx.textAlign = 'left';
    rimCtx.textBaseline = 'middle';
    rimCtx.fillText('KANDIDAT V MASTERA (BOT TEMUR)', 35, 32);
    rimCtx.font = 'italic 24px system-ui, sans-serif';
    rimCtx.textAlign = 'right';
    rimCtx.fillText('6. Oqlarning yurishi', 989, 32);

    const rimTex = new THREE.CanvasTexture(rimCanvas);
    const rimGeo = new THREE.BoxGeometry(TOTAL_WIDTH, 0.34, 0.10);
    const rimMat = new THREE.MeshStandardMaterial({ map: rimTex, roughness: 0.45 });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.set(0, -BOARD_THICKNESS / 2 - 0.02, TOTAL_WIDTH / 2 + 0.05);
    rimMesh.rotation.x = -0.22; // Slightly tilted upward toward camera
    scene.add(rimMesh);

    // ── Lighting ──
    const amb = new THREE.AmbientLight(0xfff5ea, 0.95);
    scene.add(amb);

    const key = new THREE.DirectionalLight(0xfffaee, 1.55);
    key.position.set(6, 18, 8);
    key.castShadow = true;
    key.shadow.mapSize.width = 2048;
    key.shadow.mapSize.height = 2048;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 35;
    const d = 9.0;
    key.shadow.camera.left = -d;
    key.shadow.camera.right = d;
    key.shadow.camera.top = d;
    key.shadow.camera.bottom = -d;
    key.shadow.bias = -0.0005;
    key.shadow.radius = 2.2;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xdbe9ff, 0.90);
    fill.position.set(-8, 12, 8);
    scene.add(fill);

    const blackKey = new THREE.DirectionalLight(0xfffaec, 1.25);
    blackKey.position.set(0, 14, -7);
    scene.add(blackKey);

    const rimLight = new THREE.DirectionalLight(0xe4f2ff, 2.8);
    rimLight.position.set(0, 11, -14);
    scene.add(rimLight);

    // Camera framed so board occupies ~85% vertical and leaves generous margins on left & right
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 14.8, 11.2);
    camera.lookAt(0, -0.2, 0.2);

    // Load pieces
    const loader = new GLTFLoader();
    const modelCache = {};
    const pieceTypes = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king', 'nur'];

    for (const t of pieceTypes) {
      await new Promise(r => {
        loader.load('/public/models/' + t + '.glb', (gltf) => {
          modelCache[t] = gltf;
          r();
        });
      });
    }

    const whiteMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xf6eee2),
      roughness: 0.16,
      metalness: 0.04
    });
    const blackMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x181615),
      roughness: 0.18,
      metalness: 0.18
    });

    const scales = {
      pawn: 1.00,
      rook: 1.18,
      knight: 1.24,
      bishop: 1.34,
      nur: 1.40,
      queen: 1.50,
      king: 1.62
    };

    function spawnPiece(type, file, rank, isWhite) {
      const gltf = modelCache[type];
      if (!gltf) return;
      const model = gltf.scene.clone(true);
      const mat = isWhite ? whiteMat : blackMat;
      model.traverse(ch => {
        if (ch.isMesh) {
          ch.material = mat;
          ch.castShadow = true;
          ch.receiveShadow = true;
        }
      });

      const box = new THREE.Box3().setFromObject(model);
      const sz = new THREE.Vector3(); box.getSize(sz);
      const targetHeight = scales[type] || 1.0;
      const s = targetHeight / sz.y;
      model.scale.set(s, s, s);

      const center = new THREE.Vector3(); box.getCenter(center);
      const px = (file - 4.5) * SQ_SIZE;
      const pz = (4.5 - rank) * SQ_SIZE;

      model.position.x = px - center.x * s;
      model.position.y = -box.min.y * s + 0.038;
      model.position.z = pz - center.z * s;

      let rot = isWhite ? 0 : Math.PI;
      if (type === 'knight') {
        rot = isWhite ? 0.35 : Math.PI - 0.35;
      }
      model.rotation.y = rot;

      scene.add(model);
    }

    const backRow = ['rook', 'knight', 'bishop', 'nur', 'king', 'queen', 'nur', 'bishop', 'knight', 'rook'];

    for (let f = 0; f < 10; f++) {
      spawnPiece(backRow[f], f, 0, true);
      spawnPiece('pawn', f, 1, true);
    }

    for (let f = 0; f < 10; f++) {
      spawnPiece('pawn', f, 8, false);
      spawnPiece(backRow[f], f, 9, false);
    }

    renderer.render(scene, camera);

    setTimeout(() => {
      fetch('/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'real_3d_board_preview.png': canvas.toDataURL('image/png') })
      });
    }, 700);
  </script>
</body>
</html>`);
    return;
  }

  if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const data = JSON.parse(body);
      for (const [filename, dataUrl] of Object.entries(data)) {
        const buf = Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');
        fs.writeFileSync(path.join(ROOT, 'public', filename), buf);
        console.log('Saved 3D canvas render:', filename);
      }
      res.end('ok');
      setTimeout(() => { server.close(); process.exit(0); }, 500);
    });
    return;
  }

  const filePath = path.join(ROOT, safePath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
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
  console.log('Wide 3D test server running on http://localhost:' + PORT);
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const cmd = `"${edgePath}" --headless --disable-gpu=false --use-gl=angle --remote-debugging-port=0 http://localhost:${PORT}/test`;
  exec(cmd, (err) => {
    if (err) console.error('Edge err:', err);
  });
});
