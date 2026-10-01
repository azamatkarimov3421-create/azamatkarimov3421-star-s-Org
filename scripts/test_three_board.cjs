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
  <title>Real 3D Chess Board Test</title>
  <script type="importmap">
    {
      "imports": {
        "three": "/node_modules/three/build/three.module.js",
        "three/addons/": "/node_modules/three/examples/jsm/"
      }
    }
  </script>
  <style>
    body { margin: 0; background: #120904; overflow: hidden; }
    canvas { width: 100vw; height: 100vh; display: block; }
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <script type="module">
    import * as THREE from 'three';
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

    const canvas = document.getElementById('c');
    const width = 1280;
    const height = 960;
    canvas.width = width;
    canvas.height = height;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.10;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();

    // ── Dark Espresso Wood Planks Table Background ──
    const textureLoader = new THREE.TextureLoader();
    const tableTex = textureLoader.load('/public/textures/wood_table_bg.jpg');
    tableTex.wrapS = THREE.RepeatWrapping;
    tableTex.wrapT = THREE.RepeatWrapping;
    tableTex.repeat.set(1.5, 1.0);
    const tableGeo = new THREE.PlaneGeometry(42, 34);
    // Tinted dark espresso brown to match screenshot
    const tableMat = new THREE.MeshStandardMaterial({
      map: tableTex,
      color: 0x3d2516,
      roughness: 0.88,
      metalness: 0.04
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.rotation.x = -Math.PI / 2;
    table.position.y = -0.42;
    table.receiveShadow = true;
    scene.add(table);

    // ── Board Dimensions (10x10) ──
    const SQ_SIZE = 1.0;
    const BOARD_WIDTH = 10 * SQ_SIZE;
    const FRAME_MARGIN = 0.52;
    const TOTAL_WIDTH = BOARD_WIDTH + FRAME_MARGIN * 2;
    const BOARD_THICKNESS = 0.40;

    // ── Warm Golden-Honey Wood Frame with Coordinates (A-J, 1-10) ──
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

          // Warm honey-amber glaze over frame
          ctx.fillStyle = 'rgba(165, 115, 60, 0.25)';
          ctx.fillRect(0, 0, 1024, 1024);

          // Inner dark groove border
          const marginPx = (FRAME_MARGIN / TOTAL_WIDTH) * 1024;
          const innerSize = 1024 - marginPx * 2;

          ctx.strokeStyle = '#221105';
          ctx.lineWidth = 4;
          ctx.strokeRect(marginPx, marginPx, innerSize, innerSize);

          // Subtle inner shadow / bevel line
          ctx.strokeStyle = '#85552a';
          ctx.lineWidth = 2;
          ctx.strokeRect(marginPx - 2, marginPx - 2, innerSize + 4, innerSize + 4);

          // File / Rank coordinates
          ctx.font = 'bold 24px system-ui, sans-serif';
          ctx.fillStyle = '#2b1608';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const files = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
          const sqPx = innerSize / 10;

          // Bottom letters & Top letters
          for (let f = 0; f < 10; f++) {
            const x = marginPx + (f + 0.5) * sqPx;
            ctx.fillText(files[f], x, 1024 - marginPx * 0.46);
            ctx.fillText(files[f], x, marginPx * 0.46);
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
          resolve(textureLoader.load('/public/textures/wood_frame.jpg'));
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
        const isLight = (r + f) % 2 !== 0; // matching 2D board
        const sq = new THREE.Mesh(sqGeo, isLight ? lightMat : darkMat);
        sq.position.x = (f - 4.5) * SQ_SIZE;
        sq.position.z = (4.5 - r) * SQ_SIZE;
        sq.position.y = 0.018;
        sq.receiveShadow = true;
        scene.add(sq);
      }
    }

    // ── Move indicator (G2 to G3) ──
    const greenLineMat = new THREE.LineBasicMaterial({ color: 0x22c55e, linewidth: 3 });
    const g2x = (6 - 4.5) * SQ_SIZE;
    const g2z = (4.5 - 1) * SQ_SIZE;
    const crossGeo = new THREE.BufferGeometry();
    const pts = [
      new THREE.Vector3(g2x, 0.045, g2z - 0.35), new THREE.Vector3(g2x, 0.045, g2z - 0.12),
      new THREE.Vector3(g2x, 0.045, g2z + 0.12), new THREE.Vector3(g2x, 0.045, g2z + 0.35),
      new THREE.Vector3(g2x - 0.35, 0.045, g2z), new THREE.Vector3(g2x - 0.12, 0.045, g2z),
      new THREE.Vector3(g2x + 0.12, 0.045, g2z), new THREE.Vector3(g2x + 0.35, 0.045, g2z),
    ];
    crossGeo.setFromPoints(pts);
    const crossLines = new THREE.LineSegments(crossGeo, greenLineMat);
    scene.add(crossLines);

    // Green square border on G3:
    const g3x = (6 - 4.5) * SQ_SIZE;
    const g3z = (4.5 - 2) * SQ_SIZE;
    const borderGeo = new THREE.BufferGeometry();
    const bPts = [
      new THREE.Vector3(g3x - 0.48, 0.045, g3z - 0.48),
      new THREE.Vector3(g3x + 0.48, 0.045, g3z - 0.48),
      new THREE.Vector3(g3x + 0.48, 0.045, g3z + 0.48),
      new THREE.Vector3(g3x - 0.48, 0.045, g3z + 0.48),
      new THREE.Vector3(g3x - 0.48, 0.045, g3z - 0.48),
    ];
    borderGeo.setFromPoints(bPts);
    const borderLine = new THREE.Line(borderGeo, greenLineMat);
    scene.add(borderLine);

    // ── Front Rim Text Plinth ──
    const rimCanvas = document.createElement('canvas');
    rimCanvas.width = 1024;
    rimCanvas.height = 64;
    const rimCtx = rimCanvas.getContext('2d');
    rimCtx.fillStyle = '#1c1007';
    rimCtx.fillRect(0, 0, 1024, 64);
    rimCtx.fillStyle = '#f5ede0';
    rimCtx.font = 'bold 28px system-ui, sans-serif';
    rimCtx.textAlign = 'left';
    rimCtx.textBaseline = 'middle';
    rimCtx.fillText('КАНДИДАТ В МАСТЕРА', 45, 32);
    rimCtx.font = 'italic 26px system-ui, sans-serif';
    rimCtx.textAlign = 'right';
    rimCtx.fillText('1. Ход черных', 979, 32);

    const rimTex = new THREE.CanvasTexture(rimCanvas);
    const rimGeo = new THREE.BoxGeometry(TOTAL_WIDTH, 0.36, 0.08);
    const rimMat = new THREE.MeshStandardMaterial({ map: rimTex, roughness: 0.45 });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.set(0, -BOARD_THICKNESS / 2, TOTAL_WIDTH / 2 + 0.04);
    scene.add(rimMesh);

    // ── Lighting ──
    const amb = new THREE.AmbientLight(0xfff5ea, 0.92);
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

    // Camera tuned: Elevation ~51°, nicely framing pieces with plinth at bottom
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 12.8, 10.4);
    camera.lookAt(0, -0.2, 0.3);

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

    // High fidelity PBR Materials matching screenshot
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

    // Proportional tournament heights relative to 1.0 unit square
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

    const backRow = ['rook', 'knight', 'bishop', 'nur', 'queen', 'king', 'nur', 'bishop', 'knight', 'rook'];

    for (let f = 0; f < 10; f++) {
      spawnPiece(backRow[f], f, 0, true);
      if (f === 6) {
        spawnPiece('pawn', 6, 2, true);
      } else {
        spawnPiece('pawn', f, 1, true);
      }
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
  console.log('Real 3D test server running on http://localhost:' + PORT);
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const cmd = `"${edgePath}" --headless --disable-gpu=false --use-gl=angle --remote-debugging-port=0 http://localhost:${PORT}/test`;
  exec(cmd, (err) => {
    if (err) console.error('Edge err:', err);
  });
});
