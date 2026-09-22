// =====================================================
// NUR SHAXMAT 100 — 3D GLB Ot (Knight) Modeli
// Three.js orqali GLB faylni PBR materiallar, fizik yorug'lik
// va normal-map relyefi bilan yuqori sifatda render qilish
// =====================================================

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Color } from '../engine/types';

interface GLBKnightProps {
  color: Color;
  size?: number | string;
  className?: string;
  isSelected?: boolean;
}

// Global render kesh (qayta-qayta Three.js hisoblamaslik va batareyani tejash uchun)
const renderCache: Record<string, string> = {};
let gltfPromise: Promise<THREE.Group> | null = null;

function loadKnightGLTF(): Promise<THREE.Group> {
  if (gltfPromise) return gltfPromise;

  gltfPromise = new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      '/models/knight.glb',
      (gltf) => {
        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial;
            mesh.userData.origMaterial = mat;
            mesh.userData.origMap = mat?.map || null;
            mesh.userData.origNormalMap = mat?.normalMap || null;
          }
        });
        resolve(gltf.scene);
      },
      undefined,
      (error) => {
        console.error('Knight GLB yuklashda xatolik:', error);
        reject(error);
      }
    );
  });

  return gltfPromise;
}

/**
 * Three.js orqali GLB modelni offscreen canvas-da chiroyli qilib rasmga oladi
 */
async function renderKnightToDataUrl(
  color: Color,
  isSelected: boolean,
  facingAngleDeg: number = 25
): Promise<string> {
  const cacheKey = `${color}_${isSelected ? 'sel' : 'norm'}_${facingAngleDeg}`;
  if (renderCache[cacheKey]) {
    return renderCache[cacheKey];
  }

  const sceneGroup = await loadKnightGLTF();
  const width = 384;
  const height = 384;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();

  // Model nusxasi
  const model = sceneGroup.clone(true);

  // Model materialini Oq yoki Qoraga moslash
  const isWhite = color === 'white';
  model.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const origNormal = mesh.userData.origNormalMap;
      const origMap = mesh.userData.origMap;

      if (isWhite) {
        // Oq Marmar / Fil suyagi materiali
        mesh.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0xf6f3eb),
          roughness: 0.32,
          metalness: 0.08,
          normalMap: origNormal,
          normalScale: new THREE.Vector2(1.2, 1.2),
        });
      } else {
        // Qora Obsidian / Cho'yan materiali
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

  // Bounding box hisoblash va modelni markazlashtirish
  const box = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);

  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 1.6 / maxDim;
  model.scale.set(scale, scale, scale);

  // Markazga va Y=0 taglikka keltirish
  model.position.x = -center.x * scale;
  model.position.y = -box.min.y * scale - 0.75;
  model.position.z = -center.z * scale;

  // Qaysi tomonga qarash burchagi (Oqlar oldinga-o'ngga, Qoralar qarama-qarshi)
  const baseRot = isWhite ? (facingAngleDeg * Math.PI) / 180 : ((180 + facingAngleDeg) * Math.PI) / 180;
  model.rotation.y = baseRot;

  scene.add(model);

  // Yoritish (Studio Lighting)
  const ambientLight = new THREE.AmbientLight(0xffffff, isWhite ? 1.0 : 0.85);
  scene.add(ambientLight);

  // Asosiy quyosh nuri (Key Light)
  const keyLight = new THREE.DirectionalLight(0xfff7e6, isWhite ? 2.8 : 2.4);
  keyLight.position.set(2, 4, 3);
  keyLight.castShadow = true;
  scene.add(keyLight);

  // To'ldiruvchi sovuq nur (Fill Light)
  const fillLight = new THREE.DirectionalLight(0xb4d0ff, 1.2);
  fillLight.position.set(-3, 2, 1);
  scene.add(fillLight);

  // Orqa kontur nuri (Rim Light) - ayniqsa qora donani yaqqol ko'rsatadi
  const rimLight = new THREE.DirectionalLight(
    isSelected ? 0xf59e0b : isWhite ? 0xfff0c2 : 0x60a5fa,
    isSelected ? 3.5 : 2.0
  );
  rimLight.position.set(0, 3, -3.5);
  scene.add(rimLight);

  // Kamera
  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
  camera.position.set(0, 0.45, 2.7);
  camera.lookAt(0, 0, 0);

  // Render qilish
  renderer.render(scene, camera);

  const dataUrl = canvas.toDataURL('image/png');
  renderCache[cacheKey] = dataUrl;

  // Xotirani tozalash
  renderer.dispose();

  return dataUrl;
}

export default function GLBKnight({
  color,
  size = '100%',
  className = '',
  isSelected = false,
}: GLBKnightProps) {
  const imgSrc = color === 'white' ? '/pieces/3d_knight_white.png' : '/pieces/3d_knight_black.png';

  const containerStyle: React.CSSProperties = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
  };

  return (
    <div
      style={containerStyle}
      className={`relative flex items-end justify-center pointer-events-none select-none ${className}`}
      title={`3D Ot (Knight) — ${color === 'white' ? 'Oq' : 'Qora'}`}
    >
      <img
        src={imgSrc}
        alt={`3D ${color} Knight`}
        className={`w-full h-full object-contain object-bottom pointer-events-none select-none transition-transform duration-150 ${
          isSelected
            ? 'scale-110 -translate-y-2 drop-shadow-[0_12px_16px_rgba(245,158,11,0.75)]'
            : 'drop-shadow-[0_3px_5px_rgba(0,0,0,0.45)]'
        }`}
        draggable={false}
      />
    </div>
  );
}
