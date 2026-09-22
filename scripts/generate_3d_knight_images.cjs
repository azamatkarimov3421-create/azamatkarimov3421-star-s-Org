const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8765;
const ROOT = path.resolve(__dirname, '..');

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
          console.log('Saved:', pubPath, buffer.length, 'bytes');

          if (fs.existsSync(path.join(ROOT, 'dist'))) {
            fs.mkdirSync(path.dirname(distPath), { recursive: true });
            fs.writeFileSync(distPath, buffer);
            console.log('Saved to dist:', distPath);
          }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        console.log('All images saved successfully! Shutting down server...');
        setTimeout(() => {
          server.close();
          process.exit(0);
        }, 1000);
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
  <title>3D Knight Renderer</title>
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
  <script type="module">
    import * as THREE from 'three';
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

    const canvas = document.getElementById('c');
    const width = 512;
    const height = 512;

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
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const loader = new GLTFLoader();
    loader.load('/public/models/knight.glb', (gltf) => {
      const results = {};

      function renderPiece(isWhite, facingDeg) {
        const scene = new THREE.Scene();

        // Ambient Light
        const amb = new THREE.AmbientLight(0xffffff, isWhite ? 0.75 : 0.95);
        scene.add(amb);

        // Key Light (top front right, casting soft natural ground shadow)
        const key = new THREE.DirectionalLight(0xfff8ee, isWhite ? 2.2 : 2.6);
        key.position.set(1.2, 4.8, 2.6);
        key.castShadow = true;
        key.shadow.mapSize.width = 1024;
        key.shadow.mapSize.height = 1024;
        key.shadow.radius = 3.5;
        key.shadow.bias = -0.0005;
        scene.add(key);

        // Fill Light (left cool)
        const fill = new THREE.DirectionalLight(0xa5c9eb, isWhite ? 1.0 : 1.3);
        fill.position.set(-3.5, 2.2, 1.8);
        scene.add(fill);

        // Rim Light (sharp background edge light)
        const rim = new THREE.DirectionalLight(isWhite ? 0xfff0cb : 0x7eb5ff, isWhite ? 2.0 : 3.4);
        rim.position.set(0, 3.5, -4.0);
        scene.add(rim);

        // Soft floor reflection bounce
        const bounce = new THREE.DirectionalLight(0xffe8cc, 0.5);
        bounce.position.set(0, -2, 2);
        scene.add(bounce);

        // Clone scene
        const model = gltf.scene.clone(true);

        // Apply materials
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            const orig = Array.isArray(child.material) ? child.material[0] : child.material;
            const origNormal = orig?.normalMap || null;
            const origMap = orig?.map || null;

            if (isWhite) {
              child.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0xf2ece1),
                roughness: 0.36,
                metalness: 0.08,
                normalMap: origNormal,
                normalScale: new THREE.Vector2(2.2, 2.2)
              });
            } else {
              child.material = new THREE.MeshStandardMaterial({
                map: origMap,
                color: new THREE.Color(0x2f2d2b),
                roughness: 0.38,
                metalness: 0.32,
                normalMap: origNormal,
                normalScale: new THREE.Vector2(1.8, 1.8)
              });
            }
          }
        });

        // Center and scale model
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.66 / maxDim;
        model.scale.set(scale, scale, scale);

        model.position.x = -center.x * scale;
        model.position.y = -box.min.y * scale - 0.82;
        model.position.z = -center.z * scale;

        model.rotation.y = (facingDeg * Math.PI) / 180;
        scene.add(model);

        // Ground shadow plane
        const floorGeo = new THREE.PlaneGeometry(4, 4);
        const floorMat = new THREE.ShadowMaterial({ opacity: isWhite ? 0.38 : 0.48 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.82;
        floor.receiveShadow = true;
        scene.add(floor);

        // Camera: ~38° elevation matching top-down perspective
        const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
        camera.position.set(0, 1.75, 2.15);
        camera.lookAt(0, 0.05, 0);

        renderer.render(scene, camera);
        return canvas.toDataURL('image/png');
      }

      // Render angle variants to pick best angle
      results['3d_knight_white.png'] = renderPiece(true, 42);
      results['3d_knight_black.png'] = renderPiece(false, 42);
      results['test_white_28.png'] = renderPiece(true, 28);
      results['test_white_42.png'] = renderPiece(true, 42);
      results['test_white_55.png'] = renderPiece(true, 55);
      results['test_black_42.png'] = renderPiece(false, 42);

      console.log('Rendered both White and Black 3D Knights. Sending to server...');
      fetch('/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(results)
      }).then(r => r.json()).then(data => {
        document.body.innerHTML = '<h1 style="color: green">DONE</h1>';
      }).catch(err => {
        document.body.innerHTML = '<h1 style="color: red">' + err + '</h1>';
      });
    }, undefined, (err) => {
      console.error('GLB load error:', err);
      document.body.innerHTML = '<h1 style="color: red">' + err + '</h1>';
    });
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
  console.log('Render server running on http://localhost:' + PORT);
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const cmd = `"${edgePath}" --headless --disable-gpu=false --use-gl=angle --remote-debugging-port=0 http://localhost:${PORT}/render`;
  console.log('Launching Edge to render 3D pieces...');
  exec(cmd, (err) => {
    if (err) console.error('Edge exec notice:', err);
  });
});
