const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8769;
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
        console.log('All King images saved successfully! Shutting down server...');
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
  <title>3D King Renderer</title>
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
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const loader = new GLTFLoader();
    loader.load('/public/models/king.glb', (gltf) => {
      const results = {};

      function renderPiece(isWhite, facingDeg) {
        const scene = new THREE.Scene();

        // Ambient Light
        const amb = new THREE.AmbientLight(0xffffff, isWhite ? 0.72 : 0.88);
        scene.add(amb);

        // Key Light (top front right, casting soft natural ground shadow)
        const key = new THREE.DirectionalLight(0xfffaed, isWhite ? 2.5 : 2.7);
        key.position.set(1.2, 4.8, 2.6);
        key.castShadow = true;
        key.shadow.mapSize.width = 1024;
        key.shadow.mapSize.height = 1024;
        key.shadow.radius = 3.5;
        key.shadow.bias = -0.0005;
        scene.add(key);

        // Fill Light (left cool)
        const fill = new THREE.DirectionalLight(0xb4d4ff, isWhite ? 1.0 : 1.3);
        fill.position.set(-3.5, 2.5, 1.8);
        scene.add(fill);

        // Rim Light (sharp background edge light)
        const rim = new THREE.DirectionalLight(isWhite ? 0xffeed0 : 0x7eb5ff, isWhite ? 2.0 : 3.8);
        rim.position.set(0, 3.8, -4.0);
        scene.add(rim);

        // Soft floor reflection bounce
        const bounce = new THREE.DirectionalLight(0xffe8cc, 0.45);
        bounce.position.set(0, -2, 2);
        scene.add(bounce);

        // Clone scene
        const model = gltf.scene.clone(true);

        // Apply materials & enable shadow casting
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            const orig = Array.isArray(child.material) ? child.material[0] : child.material;
            const origNormal = orig?.normalMap || null;
            const origMap = orig?.map || null;

            if (isWhite) {
              child.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0xfbf8f3),
                roughness: 0.30,
                metalness: 0.06,
                normalMap: origNormal,
                normalScale: new THREE.Vector2(2.0, 2.0)
              });
            } else {
              child.material = new THREE.MeshStandardMaterial({
                map: origMap,
                color: new THREE.Color(0x32302e),
                roughness: 0.40,
                metalness: 0.28,
                normalMap: origNormal,
                normalScale: new THREE.Vector2(1.8, 1.8)
              });
            }
          }
        });

        // Apply gold royal crown (shoxga 2 tarafga ham sarg'ish/tillarang toj)
        const goldCrownMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0xf8be1a), // Boy, iliq va jozibador sarg'ish-tillarang
          roughness: 0.20,
          metalness: 0.88,
        });

        const crownGroup = new THREE.Group();
        crownGroup.name = 'kingCrown';

        // 1. Asosiy toj gardishi (Crown Band)
        const bandGeo = new THREE.CylinderGeometry(0.108, 0.116, 0.038, 32);
        const band = new THREE.Mesh(bandGeo, goldCrownMat);
        band.position.y = 0.925;
        band.castShadow = true;
        band.receiveShadow = true;
        crownGroup.add(band);

        // 2. Gardishning qabariq halqasi (Torus Bead Rim)
        const ringGeo = new THREE.TorusGeometry(0.114, 0.010, 12, 32);
        ringGeo.rotateX(Math.PI / 2);
        const ring = new THREE.Mesh(ringGeo, goldCrownMat);
        ring.position.y = 0.910;
        ring.castShadow = true;
        ring.receiveShadow = true;
        crownGroup.add(ring);

        // 3. Tojning 8 ta sarg'ish-tillarang tishlari va marvaridlari
        const numSpikes = 8;
        const spikeGeo = new THREE.ConeGeometry(0.018, 0.075, 12);
        const pearlGeo = new THREE.SphereGeometry(0.013, 16, 16);

        for (let i = 0; i < numSpikes; i++) {
          const angle = (i / numSpikes) * Math.PI * 2;
          const r = 0.108;
          const sx = Math.cos(angle) * r;
          const sz = Math.sin(angle) * r;

          const spike = new THREE.Mesh(spikeGeo, goldCrownMat);
          spike.position.set(sx, 0.965, sz);
          spike.rotation.y = -angle;
          spike.rotation.z = Math.cos(angle) * 0.16;
          spike.rotation.x = -Math.sin(angle) * 0.16;
          spike.castShadow = true;
          spike.receiveShadow = true;
          crownGroup.add(spike);

          const pearl = new THREE.Mesh(pearlGeo, goldCrownMat);
          pearl.position.set(sx * 1.06, 1.006, sz * 1.06);
          pearl.castShadow = true;
          pearl.receiveShadow = true;
          crownGroup.add(pearl);
        }

        // 4. Markaziy oltin gumbaz
        const domeGeo = new THREE.SphereGeometry(0.062, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const dome = new THREE.Mesh(domeGeo, goldCrownMat);
        dome.position.y = 0.942;
        dome.castShadow = true;
        dome.receiveShadow = true;
        crownGroup.add(dome);

        // 5. Markaziy saltanat globusi (Royal Orb)
        const orbGeo = new THREE.SphereGeometry(0.026, 16, 16);
        const orb = new THREE.Mesh(orbGeo, goldCrownMat);
        orb.position.y = 1.018;
        orb.castShadow = true;
        orb.receiveShadow = true;
        crownGroup.add(orb);

        // 6. Markaziy Oliy Xoch
        const vBarGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.072, 12);
        const vBar = new THREE.Mesh(vBarGeo, goldCrownMat);
        vBar.position.y = 1.066;
        vBar.castShadow = true;
        vBar.receiveShadow = true;
        crownGroup.add(vBar);

        const hBarGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.048, 12);
        hBarGeo.rotateZ(Math.PI / 2);
        const hBar = new THREE.Mesh(hBarGeo, goldCrownMat);
        hBar.position.y = 1.076;
        hBar.castShadow = true;
        hBar.receiveShadow = true;
        crownGroup.add(hBar);

        const jewelGeo = new THREE.SphereGeometry(0.012, 12, 12);
        const jewel = new THREE.Mesh(jewelGeo, goldCrownMat);
        jewel.position.y = 1.076;
        jewel.castShadow = true;
        jewel.receiveShadow = true;
        crownGroup.add(jewel);

        model.add(crownGroup);

        // Center and scale model
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.68 / maxDim; // Shoh uchun ulug'vor va to'g'ri proporsiya
        model.scale.set(scale, scale, scale);

        model.position.x = -center.x * scale;
        model.position.y = -box.min.y * scale - 0.82;
        model.position.z = -center.z * scale;

        model.rotation.y = (facingDeg * Math.PI) / 180;
        scene.add(model);

        // Ground shadow plane (taglik ostida silliq soya)
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

      results['3d_king_white.png'] = renderPiece(true, 15);
      results['3d_king_black.png'] = renderPiece(false, 15);

      console.log('Rendered both White and Black 3D Kings. Sending to server...');
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
  console.log('King render server running on http://localhost:' + PORT);
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const cmd = `"${edgePath}" --headless --disable-gpu=false --use-gl=angle --remote-debugging-port=0 http://localhost:${PORT}/render`;
  console.log('Launching Edge to render 3D King pieces...');
  exec(cmd, (err) => {
    if (err) console.error('Edge exec notice:', err);
  });
});
