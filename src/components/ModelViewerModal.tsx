// =====================================================
// NUR SHAXMAT 100 — 3D Model Ko'rish Modali (Interactive 3D Inspector)
// Tripo 3D-dan kiritilgan GLB modelini 360 gradusda aylantirib,
// yaqinlashtirib, oq va qora rangda tomosha qilish
// =====================================================

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface ModelViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModelViewerModal({ isOpen, onClose }: ModelViewerModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPiece, setSelectedPiece] = useState<'Knight' | 'Rook' | 'Queen'>('Queen');
  const [colorMode, setColorMode] = useState<'white' | 'black'>('white');
  const [autoRotate, setAutoRotate] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const reqIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    setIsLoading(true);
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 1.0, 2.8);
    camera.lookAt(0, 0.35, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 3. Grid & Pedestal Base Disk
    const pedestalGeo = new THREE.CylinderGeometry(0.7, 0.75, 0.05, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x1a1c1e,
      roughness: 0.6,
      metalness: 0.4,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.025;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    const grid = new THREE.GridHelper(4, 16, 0xf59e0b, 0x334155);
    grid.position.y = -0.05;
    scene.add(grid);

    // 4. Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.5);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.4);
    fillLight.position.set(-4, 3, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 2.0);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    // 5. Load GLB Model
    const modelPath =
      selectedPiece === 'Queen'
        ? '/models/queen.glb'
        : selectedPiece === 'Knight'
        ? '/models/knight.glb'
        : '/models/rook.glb';
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;

        // Bounding Box
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);

        const scale = 1.6 / Math.max(size.x, size.y, size.z);
        model.scale.set(scale, scale, scale);
        model.position.x = -center.x * scale;
        model.position.y = -box.min.y * scale;
        model.position.z = -center.z * scale;

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial;
            mesh.userData.origMap = mat?.map || null;
            mesh.userData.origNormalMap = mat?.normalMap || null;
          }
        });

        scene.add(model);
        setIsLoading(false);
      },
      undefined,
      (err) => {
        console.error('GLB yuklashda xatolik:', err);
        setIsLoading(false);
      }
    );

    // 6. Mouse / Touch Drag Rotation & Zoom Controls
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let rotationVelocityX = 0;
    let rotationVelocityY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
      rotationVelocityX = 0;
      rotationVelocityY = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || !modelRef.current) return;
      const deltaX = e.clientX - prevPointerX;
      const deltaY = e.clientY - prevPointerY;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;

      rotationVelocityX = deltaX * 0.008;
      rotationVelocityY = deltaY * 0.008;

      modelRef.current.rotation.y += rotationVelocityX;
      camera.position.y = Math.max(0.2, Math.min(2.5, camera.position.y - deltaY * 0.005));
      camera.lookAt(0, 0.35, 0);
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.002;
      camera.position.z = Math.max(1.2, Math.min(5.0, camera.position.z + zoomDelta));
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // 7. Animation Loop
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);

      if (modelRef.current) {
        if (!isDragging && autoRotate) {
          modelRef.current.rotation.y += 0.01;
        } else if (!isDragging && Math.abs(rotationVelocityX) > 0.0001) {
          modelRef.current.rotation.y += rotationVelocityX;
          rotationVelocityX *= 0.92;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isOpen, selectedPiece]);

  // Rangni o'zgartirish (Oq Marmar / Qora Obsidian)
  useEffect(() => {
    if (!modelRef.current) return;
    const isWhite = colorMode === 'white';

    modelRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const origNormal = mesh.userData.origNormalMap;
        const origMap = mesh.userData.origMap;

        if (isWhite) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xf6f3eb),
            roughness: 0.32,
            metalness: 0.08,
            normalMap: origNormal,
            normalScale: new THREE.Vector2(1.2, 1.2),
          });
        } else {
          mesh.material = new THREE.MeshStandardMaterial({
            map: origMap,
            color: new THREE.Color(0x353432),
            roughness: 0.42,
            metalness: 0.28,
            normalMap: origNormal,
            normalScale: new THREE.Vector2(1.1, 1.1),
          });
        }
      }
    });
  }, [colorMode]);

  if (!isOpen) return null;

  const pieceMeta = {
    Queen: {
      name: 'Farzin (Queen)',
      icon: '👑',
      size: '2.4 MB',
      desc: 'Tripo 3D relyefli, tojdor va zargarona Farzin modeli',
    },
    Knight: {
      name: 'Ot (Knight)',
      icon: '🐎',
      size: '2.3 MB',
      desc: 'Tripo 3D relyefli va PBR teksturali jangovar Ot modeli',
    },
    Rook: {
      name: 'Rux (Rook)',
      icon: '🏰',
      size: '2.4 MB',
      desc: 'Tripo 3D relyefli mustahkam qasr / qalʼa minorasi',
    },
  }[selectedPiece];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-[9999] p-3 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        {/* Yopish tugmasi */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-base flex items-center justify-center transition-all cursor-pointer z-20 shadow-md active:scale-95"
        >
          ✕
        </button>

        {/* Sarlavha & Dona tanlash tablari */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 shrink-0 pr-12">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
              {pieceMeta.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  3D {pieceMeta.name}
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  GLB • {pieceMeta.size}
                </span>
              </div>
              <p className="text-slate-400 text-xs">
                {pieceMeta.desc}
              </p>
            </div>
          </div>

          {/* Dona Tanlash (Farzin / Ot / Rux) Tablari */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-2xl border border-slate-700 shadow-inner">
            <button
              onClick={() => setSelectedPiece('Queen')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedPiece === 'Queen'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>👑</span>
              <span>Farzin</span>
            </button>
            <button
              onClick={() => setSelectedPiece('Knight')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedPiece === 'Knight'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>🐎</span>
              <span>Ot</span>
            </button>
            <button
              onClick={() => setSelectedPiece('Rook')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedPiece === 'Rook'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>🏰</span>
              <span>Rux</span>
            </button>
          </div>
        </div>

        {/* 3D WebGL Canvas Viewport */}
        <div
          ref={containerRef}
          className="relative w-full h-[360px] sm:h-[440px] bg-gradient-to-b from-slate-950 via-slate-900 to-black rounded-2xl border border-slate-800 overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none"
        >
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/80 z-10">
              <div className="w-10 h-10 rounded-full border-3 border-amber-400 border-t-transparent animate-spin" />
              <div className="text-xs text-amber-300 font-bold">3D Model yuklanmoqda...</div>
            </div>
          )}

          {/* Qo'llanma / maslahat */}
          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-medium pointer-events-none z-10 flex items-center gap-2">
            <span>🖱️ Aylantirish: Barmoq / Sichqoncha</span>
            <span>•</span>
            <span>🔍 Zoom: G'ildirakcha</span>
          </div>

          {/* Avto-aylanish tugmasi */}
          <button
            onClick={() => setAutoRotate((prev) => !prev)}
            className={`absolute top-3 left-3 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer z-10 backdrop-blur ${
              autoRotate
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-900/80 border-slate-700 text-slate-400'
            }`}
          >
            {autoRotate ? '⏸️ Aylanishni toʻxtatish' : '▶️ Avto-aylantirish'}
          </button>
        </div>

        {/* Pastki Rang & Boshqaruv Paneli */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold">Material:</span>
            <button
              onClick={() => setColorMode('white')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border ${
                colorMode === 'white'
                  ? 'bg-white text-slate-950 border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded-full bg-white border border-slate-300 shadow-sm" />
              <span>Oq Marmar</span>
            </button>

            <button
              onClick={() => setColorMode('black')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border ${
                colorMode === 'black'
                  ? 'bg-slate-800 text-amber-300 border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-amber-400/50 shadow-sm" />
              <span>Qora Obsidian</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              Doskaga qaytish ♟️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
