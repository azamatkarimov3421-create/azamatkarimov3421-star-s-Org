import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface HeroPieces3DProps {
  colorChoice: 'white' | 'random' | 'black';
  isLight: boolean;
}

const heroModelCache: { nur?: any; king?: any } = {};

function createCrown(goldMat: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.108, 0.116, 0.038, 24), goldMat);
  band.position.y = 0.925;
  g.add(band);

  const ringGeo = new THREE.TorusGeometry(0.114, 0.01, 10, 24);
  ringGeo.rotateX(Math.PI / 2);
  const ring = new THREE.Mesh(ringGeo, goldMat);
  ring.position.y = 0.91;
  g.add(ring);

  const spikeGeo = new THREE.ConeGeometry(0.018, 0.075, 10);
  const pearlGeo = new THREE.SphereGeometry(0.013, 12, 12);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const sx = Math.cos(angle) * 0.108;
    const sz = Math.sin(angle) * 0.108;
    const spike = new THREE.Mesh(spikeGeo, goldMat);
    spike.position.set(sx, 0.965, sz);
    spike.rotation.y = -angle;
    spike.rotation.z = Math.cos(angle) * 0.16;
    spike.rotation.x = -Math.sin(angle) * 0.16;
    g.add(spike);

    const pearl = new THREE.Mesh(pearlGeo, goldMat);
    pearl.position.set(sx * 1.06, 1.006, sz * 1.06);
    g.add(pearl);
  }

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.062, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    goldMat
  );
  dome.position.y = 0.942;
  g.add(dome);

  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.026, 14, 14), goldMat);
  orb.position.y = 1.018;
  g.add(orb);

  const vBar = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.072, 8), goldMat);
  vBar.position.y = 1.066;
  g.add(vBar);

  const hBarGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.048, 8);
  hBarGeo.rotateZ(Math.PI / 2);
  const hBar = new THREE.Mesh(hBarGeo, goldMat);
  hBar.position.y = 1.076;
  g.add(hBar);

  const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 10), goldMat);
  jewel.position.y = 1.076;
  g.add(jewel);
  return g;
}

function createCross(mat: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  g.position.set(0.017, 0, -0.0012);
  const v = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.028, 0.212), mat);
  v.position.y = 0.976;
  g.add(v);
  const h = new THREE.Mesh(new THREE.BoxGeometry(0.212, 0.028, 0.042), mat);
  h.position.y = 0.976;
  g.add(h);
  const core = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.05), mat);
  core.position.y = 0.977;
  g.add(core);
  return g;
}

export default function HeroPieces3D({ colorChoice, isLight }: HeroPieces3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let destroyed = false;
    let animId = 0;
    let renderer: THREE.WebGLRenderer | null = null;

    const w = container.clientWidth || 380;
    const h = container.clientHeight || 280;

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 30);
    camera.position.set(0, 1.48, 3.85);
    camera.lookAt(0, 0.72, 0);

    // Studio chiroqlari — ikkala dona bir xil burchakda yoritiladi
    scene.add(new THREE.HemisphereLight(0xfffdf8, 0x3b332b, 0.85));

    const key = new THREE.DirectionalLight(0xfff8ed, 1.55);
    key.position.set(3.2, 5.5, 4.2);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.bias = -0.0005;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xeef4ff, 0.55);
    fill.position.set(-4.0, 3.2, 2.8);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xfff2d6, 0.7);
    rim.position.set(0, 4.0, -4.5);
    scene.add(rim);

    // Yumshoq pol soyasi (doskasiz)
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.ShadowMaterial({ opacity: isLight ? 0.24 : 0.48 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf7f3e9, roughness: 0.28, metalness: 0.04 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x26262b, roughness: 0.30, metalness: 0.08 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xe6b447, roughness: 0.22, metalness: 0.78 });
    const crossDarkMat = new THREE.MeshStandardMaterial({ color: 0x1e1e22, roughness: 0.35 });
    const crossLightMat = new THREE.MeshStandardMaterial({ color: 0xfbf8f0, roughness: 0.25 });

    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    const loader = new GLTFLoader();
    const loadGltf = (keyName: 'nur' | 'king') =>
      new Promise<any>((resolve) => {
        if (heroModelCache[keyName]) return resolve(heroModelCache[keyName]);
        loader.load(
          `/models/${keyName}.glb`,
          (gltf) => {
            heroModelCache[keyName] = gltf;
            resolve(gltf);
          },
          undefined,
          () => resolve(null)
        );
      });

    Promise.all([loadGltf('nur'), loadGltf('king')]).then(([nurGltf, kingGltf]) => {
      if (destroyed || !nurGltf || !kingGltf) {
        if (!nurGltf || !kingGltf) setWebglFailed(true);
        return;
      }

      const nurIsWhite = colorChoice !== 'black';
      const kingIsWhite = colorChoice === 'white';

      const buildUnit = (gltf: any, type: 'nur' | 'king', isWhite: boolean, targetX: number, targetHeight: number) => {
        const mesh = gltf.scene.clone(true) as THREE.Group;
        const mat = isWhite ? whiteMat : blackMat;
        mesh.traverse((ch: any) => {
          if (ch.isMesh) {
            ch.material = mat;
            ch.castShadow = true;
            ch.receiveShadow = true;
          }
        });
        if (type === 'king') mesh.add(createCrown(goldMat));
        else mesh.add(createCross(isWhite ? crossDarkMat : crossLightMat));

        const box = new THREE.Box3().setFromObject(mesh);
        const sz = new THREE.Vector3();
        box.getSize(sz);
        const s = targetHeight / sz.y;
        mesh.scale.set(s, s, s);
        const center = new THREE.Vector3();
        box.getCenter(center);

        const pivot = new THREE.Group();
        mesh.position.set(-center.x * s, -box.min.y * s, -center.z * s);
        pivot.add(mesh);
        pivot.position.set(targetX, 0, 0);
        // Ikkalasi ham bir xil oldinga qarab turadi
        pivot.rotation.y = 0;
        stageGroup.add(pivot);
      };

      buildUnit(nurGltf, 'nur', nurIsWhite, -0.58, 1.38);
      buildUnit(kingGltf, 'king', kingIsWhite, 0.58, 1.56);

      const start = performance.now();
      const renderLoop = (now: number) => {
        if (destroyed || !renderer) return;
        const t = (now - start) * 0.001;
        // Sokin, bir xil burchakdagi sekin tebranish (3D chuqurlik darhol seziladi)
        stageGroup.rotation.y = Math.sin(t * 0.65) * 0.18;
        renderer.render(scene, camera);
        animId = requestAnimationFrame(renderLoop);
      };
      animId = requestAnimationFrame(renderLoop);
    });

    const onResize = () => {
      if (!container || !renderer) return;
      const nw = container.clientWidth || 380;
      const nh = container.clientHeight || 280;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      destroyed = true;
      cancelAnimationFrame(animId);
      ro.disconnect();
      whiteMat.dispose();
      blackMat.dispose();
      goldMat.dispose();
      crossDarkMat.dispose();
      crossLightMat.dispose();
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, [colorChoice, isLight]);

  if (webglFailed) {
    return (
      <div className="flex items-end justify-center gap-6 py-4">
        <img
          src={colorChoice === 'black' ? '/pieces/3d_nur_black.png' : '/pieces/3d_nur_white.png'}
          alt="3D Nur"
          className="h-44 sm:h-60 object-contain drop-shadow-[0_18px_22px_rgba(0,0,0,0.4)]"
        />
        <img
          src={colorChoice === 'white' ? '/pieces/3d_king_white.png' : '/pieces/3d_king_black.png'}
          alt="3D Shoh"
          className="h-48 sm:h-64 object-contain drop-shadow-[0_18px_22px_rgba(0,0,0,0.4)]"
        />
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="w-full h-[230px] sm:h-[300px] select-none pointer-events-none"
      aria-label="3D Nur va Shoh"
    />
  );
}
