// =====================================================
// NUR SHAXMAT 100 — Haqiqiy 3D Three.js Doska Komponenti
// Yuqori aniqlikdagi tiniq 3D donalar, 0% Idle GPU silliq render
// va En Passant / Drag uchun 100% aniq raycasting tizimi
// =====================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GameState, Move, Piece, Square, squaresEqual, FILES } from '../engine/types';
import { BoardTheme } from '../store/gameStore';

interface Board3DProps {
  game: GameState;
  selectedSquare: Square | null;
  legalMoves: Move[];
  hintMove: Move | null;
  dispatch: React.Dispatch<any>;
  isFlipped: boolean;
  gameMode: string;
  onlinePlayerColor: 'white' | 'black' | null;
  aiColor: 'white' | 'black';
  aiThinking: boolean;
  frontRimTitle?: string;
  frontRimMoveText?: string;
  boardTheme?: BoardTheme;
  cinemaMode?: boolean;
}

// Module-level GLTF model kesh (ilova ochilganda bir marta yuklanadi va qayta yuklanmaydi)
const modelCache: Record<string, any> = {};
let modelsLoadingPromise: Promise<void> | null = null;

const PIECE_TYPES: string[] = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king', 'nur'];

function ensureModelsLoaded(): Promise<void> {
  if (modelsLoadingPromise) return modelsLoadingPromise;

  const loader = new GLTFLoader();
  modelsLoadingPromise = Promise.all(
    PIECE_TYPES.map(
      (type) =>
        new Promise<void>((resolve) => {
          if (modelCache[type]) {
            resolve();
            return;
          }
          loader.load(
            `/models/${type}.glb`,
            (gltf) => {
              modelCache[type] = gltf;
              resolve();
            },
            undefined,
            () => {
              console.error(`Failed to load 3D model for ${type}`);
              resolve();
            }
          );
        })
    )
  ).then(() => {});

  return modelsLoadingPromise;
}

const SQ_SIZE = 1.0;
const BOARD_WIDTH = 10 * SQ_SIZE;
const FRAME_MARGIN = 0.52;
const TOTAL_WIDTH = BOARD_WIDTH + FRAME_MARGIN * 2;
const BOARD_THICKNESS = 0.40;

// Xalqaro turnir nisbatlari (1.0 katak hajmiga nisbatan)
const SCALES: Record<string, number> = {
  pawn: 1.00,
  rook: 1.18,
  knight: 1.24,
  bishop: 1.34,
  nur: 1.40,
  queen: 1.50,
  king: 1.62,
};

interface SharedPieceMaterials {
  goldCrownMat: THREE.MeshStandardMaterial;
  whiteMat: THREE.MeshStandardMaterial;
  blackMat: THREE.MeshStandardMaterial;
  nurWhiteMat: THREE.MeshStandardMaterial;
  nurBlackMat: THREE.MeshStandardMaterial;
}

interface PieceGlideAnim {
  mesh: THREE.Group;
  fromX: number;
  fromZ: number;
  toX: number;
  toZ: number;
  baseY: number;
  jumpArc: number;
  startTime: number;
  duration: number;
}

function disposeHighlightGroup(group: THREE.Group) {
  while (group.children.length > 0) {
    const obj = group.children[0] as any;
    group.remove(obj);
    if (obj.geometry) {
      obj.geometry.dispose();
    }
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m: THREE.Material) => m.dispose());
      } else {
        obj.material.dispose();
      }
    }
  }
}

// Shoh (King) uchun hashamatli sarg'ish-tillarang Oliy Qirollik Toji (Gold Royal Crown)
function createKingCrown(goldCrownMat: THREE.Material, pieceId: string): THREE.Group {
  const crownGroup = new THREE.Group();
  crownGroup.name = 'kingCrown';

  const bandGeo = new THREE.CylinderGeometry(0.108, 0.116, 0.038, 24);
  const band = new THREE.Mesh(bandGeo, goldCrownMat);
  band.position.y = 0.925;
  band.castShadow = false;
  band.receiveShadow = true;
  band.userData = { isCrown: true, pieceId };
  crownGroup.add(band);

  const ringGeo = new THREE.TorusGeometry(0.114, 0.010, 10, 24);
  ringGeo.rotateX(Math.PI / 2);
  const ring = new THREE.Mesh(ringGeo, goldCrownMat);
  ring.position.y = 0.910;
  ring.castShadow = false;
  ring.receiveShadow = true;
  ring.userData = { isCrown: true, pieceId };
  crownGroup.add(ring);

  const numSpikes = 8;
  const spikeGeo = new THREE.ConeGeometry(0.018, 0.075, 10);
  const pearlGeo = new THREE.SphereGeometry(0.013, 12, 12);

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
    spike.castShadow = false;
    spike.receiveShadow = true;
    spike.userData = { isCrown: true, pieceId };
    crownGroup.add(spike);

    const pearl = new THREE.Mesh(pearlGeo, goldCrownMat);
    pearl.position.set(sx * 1.06, 1.006, sz * 1.06);
    pearl.castShadow = false;
    pearl.receiveShadow = true;
    pearl.userData = { isCrown: true, pieceId };
    crownGroup.add(pearl);
  }

  const domeGeo = new THREE.SphereGeometry(0.062, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeo, goldCrownMat);
  dome.position.y = 0.942;
  dome.castShadow = true;
  dome.receiveShadow = true;
  dome.userData = { isCrown: true, pieceId };
  crownGroup.add(dome);

  const orbGeo = new THREE.SphereGeometry(0.026, 14, 14);
  const orb = new THREE.Mesh(orbGeo, goldCrownMat);
  orb.position.y = 1.018;
  orb.castShadow = true;
  orb.receiveShadow = true;
  orb.userData = { isCrown: true, pieceId };
  crownGroup.add(orb);

  const vBarGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.072, 8);
  const vBar = new THREE.Mesh(vBarGeo, goldCrownMat);
  vBar.position.y = 1.066;
  vBar.castShadow = true;
  vBar.receiveShadow = true;
  vBar.userData = { isCrown: true, pieceId };
  crownGroup.add(vBar);

  const hBarGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.048, 8);
  hBarGeo.rotateZ(Math.PI / 2);
  const hBar = new THREE.Mesh(hBarGeo, goldCrownMat);
  hBar.position.y = 1.076;
  hBar.castShadow = true;
  hBar.receiveShadow = true;
  hBar.userData = { isCrown: true, pieceId };
  crownGroup.add(hBar);

  const jewelGeo = new THREE.SphereGeometry(0.012, 10, 10);
  const jewel = new THREE.Mesh(jewelGeo, goldCrownMat);
  jewel.position.y = 1.076;
  jewel.castShadow = true;
  jewel.receiveShadow = true;
  jewel.userData = { isCrown: true, pieceId };
  crownGroup.add(jewel);

  return crownGroup;
}

// Nur donasi uchun maxsus 3D kesilgan '+' (Cross) nishoni
function createNurCross(_isWhite: boolean, pieceId: string, crossMat: THREE.Material): THREE.Group {
  const nurGroup = new THREE.Group();
  nurGroup.name = 'nurCross';
  nurGroup.userData = { isNurEmblem: true, isCrown: true, pieceId };

  nurGroup.position.set(0.017, 0, -0.0012);

  const vCrossGeo = new THREE.BoxGeometry(0.042, 0.028, 0.212);
  const vCross = new THREE.Mesh(vCrossGeo, crossMat);
  vCross.position.y = 0.976;
  vCross.castShadow = false;
  vCross.receiveShadow = true;
  vCross.userData = { isNurEmblem: true, isCrown: true, pieceId };
  nurGroup.add(vCross);

  const hCrossGeo = new THREE.BoxGeometry(0.212, 0.028, 0.042);
  const hCross = new THREE.Mesh(hCrossGeo, crossMat);
  hCross.position.y = 0.976;
  hCross.castShadow = false;
  hCross.receiveShadow = true;
  hCross.userData = { isNurEmblem: true, isCrown: true, pieceId };
  nurGroup.add(hCross);

  const coreGeo = new THREE.BoxGeometry(0.050, 0.030, 0.050);
  const core = new THREE.Mesh(coreGeo, crossMat);
  core.position.y = 0.977;
  core.castShadow = false;
  core.receiveShadow = true;
  core.userData = { isNurEmblem: true, isCrown: true, pieceId };
  nurGroup.add(core);

  return nurGroup;
}

// Vazir (Queen / Farzin) donasi uchun maxsus 4 qirrali piramida romb nishoni
function createQueenDiamond(_isWhite: boolean, pieceId: string, nurWhiteMat: THREE.Material, nurBlackMat: THREE.Material): THREE.Group {
  const queenGroup = new THREE.Group();
  queenGroup.name = 'queenDiamond';
  queenGroup.userData = { isQueenDiamond: true, isCrown: true, pieceId };

  const baseY = 0.970;
  const apexY = 1.036;
  const h = apexY - baseY;
  const r = 0.076;

  const baseBorderGeo = new THREE.CylinderGeometry(r * 1.05, r * 1.10, 0.010, 4);
  baseBorderGeo.rotateY(Math.PI / 4);
  const baseBorder = new THREE.Mesh(baseBorderGeo, nurBlackMat);
  baseBorder.position.y = baseY;
  baseBorder.castShadow = false;
  baseBorder.receiveShadow = true;
  baseBorder.userData = { isQueenDiamond: true, isCrown: true, pieceId };
  queenGroup.add(baseBorder);

  const pyrGeo = new THREE.ConeGeometry(r, h, 4);
  pyrGeo.rotateY(Math.PI / 4);
  const pyr = new THREE.Mesh(pyrGeo, nurWhiteMat);
  pyr.position.y = baseY + h / 2;
  pyr.castShadow = false;
  pyr.receiveShadow = true;
  pyr.userData = { isQueenDiamond: true, isCrown: true, pieceId };
  queenGroup.add(pyr);

  const armLen = Math.sqrt(r * r + h * h);

  for (let i = 0; i < 4; i++) {
    const angle = (Math.PI / 4) + i * (Math.PI / 2);
    const ribGeo = new THREE.CylinderGeometry(0.0022, 0.0052, armLen, 6);
    const rib = new THREE.Mesh(ribGeo, nurBlackMat);

    const dir = new THREE.Vector3(-r * Math.cos(angle), h, -r * Math.sin(angle)).normalize();
    rib.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

    rib.position.set(r * 0.5 * Math.cos(angle), baseY + h * 0.5, r * 0.5 * Math.sin(angle));
    rib.castShadow = false;
    rib.receiveShadow = true;
    rib.userData = { isQueenDiamond: true, isCrown: true, pieceId };
    queenGroup.add(rib);
  }

  const apexGeo = new THREE.ConeGeometry(0.008, 0.010, 4);
  apexGeo.rotateY(Math.PI / 4);
  const apexMesh = new THREE.Mesh(apexGeo, nurBlackMat);
  apexMesh.position.y = apexY - 0.001;
  apexMesh.castShadow = false;
  apexMesh.receiveShadow = true;
  apexMesh.userData = { isQueenDiamond: true, isCrown: true, pieceId };
  queenGroup.add(apexMesh);

  return queenGroup;
}

export default function Board3D({
  game,
  selectedSquare,
  legalMoves,
  hintMove,
  dispatch,
  isFlipped,
  gameMode,
  onlinePlayerColor,
  aiColor,
  aiThinking,
  frontRimTitle,
  frontRimMoveText,
  boardTheme = 'classic',
  cinemaMode = false,
}: Board3DProps) {
  const cinemaModeRef = useRef(cinemaMode);
  cinemaModeRef.current = cinemaMode;
  const updateCameraRef = useRef<((w: number, h: number) => void) | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Three.js doimiy obyektlari
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const squareMeshesRef = useRef<THREE.Mesh[]>([]);
  const frameMeshRef = useRef<THREE.Mesh | null>(null);
  const rimMeshRef = useRef<THREE.Mesh | null>(null);
  const pieceMeshesMapRef = useRef<Map<string, THREE.Group>>(new Map());
  const sharedMaterialsRef = useRef<SharedPieceMaterials | null>(null);
  const pieceGlidesRef = useRef<Map<string, PieceGlideAnim>>(new Map());
  const prevFlippedRef = useRef<boolean>(isFlipped);
  const highlightsGroupRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const renderFramesRef = useRef<number>(60);

  const requestRender = useCallback((frames = 24) => {
    renderFramesRef.current = Math.max(renderFramesRef.current, frames);
  }, []);

  // Pointer & Drag kuzatuvi
  const pointerStartRef = useRef<{
    startX: number;
    startY: number;
    startTime: number;
    fromSq: Square | null;
    isDragging: boolean;
    piece: Piece | null;
    mesh: THREE.Group | null;
    originalPos: THREE.Vector3 | null;
    plane: THREE.Plane | null;
  } | null>(null);

  // State ref'lari (event listenerlar uchun eng yangi holat)
  const stateRef = useRef({
    game,
    selectedSquare,
    legalMoves,
    hintMove,
    isFlipped,
    gameMode,
    onlinePlayerColor,
    aiColor,
    aiThinking,
  });
  stateRef.current = {
    game,
    selectedSquare,
    legalMoves,
    hintMove,
    isFlipped,
    gameMode,
    onlinePlayerColor,
    aiColor,
    aiThinking,
  };

  // Kvadrat koordinatalarini hisoblash (isFlipped holatini hisobga olgan holda)
  const getSquareWorldPos = useCallback((file: number, rank: number, flipped: boolean) => {
    const f = flipped ? 9 - file : file;
    const r = flipped ? 9 - rank : rank;
    const x = (f - 4.5) * SQ_SIZE;
    const z = (4.5 - r) * SQ_SIZE;
    return { x, z };
  }, []);

  // Yuqori aniqlikdagi (2048x2048) koordinatali ramka teksturasi (A B C N E D M F G H, 1-10)
  const createFrameTexture = useCallback((flipped: boolean, currentTheme: BoardTheme = 'classic'): Promise<THREE.CanvasTexture> => {
    const RES = 2048;
    const cv = document.createElement('canvas');
    cv.width = RES;
    cv.height = RES;
    const ctx = cv.getContext('2d')!;

    const marginPx = (FRAME_MARGIN / TOTAL_WIDTH) * RES;
    const innerSize = RES - marginPx * 2;
    const maxAniso = rendererRef.current ? Math.min(rendererRef.current.capabilities.getMaxAnisotropy(), 8) : 4;

    if (currentTheme === 'wood') {
      const img = new Image();
      img.src = '/textures/wood_frame.jpg';

      return new Promise((resolve) => {
        const renderCoords = () => {
          ctx.fillStyle = 'rgba(165, 115, 60, 0.25)';
          ctx.fillRect(0, 0, RES, RES);

          ctx.strokeStyle = '#221105';
          ctx.lineWidth = 8;
          ctx.strokeRect(marginPx, marginPx, innerSize, innerSize);

          ctx.strokeStyle = '#85552a';
          ctx.lineWidth = 4;
          ctx.strokeRect(marginPx - 4, marginPx - 4, innerSize + 8, innerSize + 8);

          ctx.font = '900 54px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillStyle = '#241105';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const rawFiles = [...FILES];
          const files = flipped ? [...rawFiles].reverse() : rawFiles;
          const sqPx = innerSize / 10;

          for (let f = 0; f < 10; f++) {
            const x = marginPx + (f + 0.5) * sqPx;
            ctx.fillText(files[f], x, RES - marginPx * 0.48);
            ctx.fillText(files[f], x, marginPx * 0.48);
          }

          for (let r = 0; r < 10; r++) {
            const num = flipped ? 10 - r : r + 1;
            const y = marginPx + (9 - r + 0.5) * sqPx;
            ctx.fillText(String(num), marginPx * 0.48, y);
            ctx.fillText(String(num), RES - marginPx * 0.48, y);
          }

          const tex = new THREE.CanvasTexture(cv);
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = maxAniso;
          tex.needsUpdate = true;
          resolve(tex);
        };

        img.onload = () => {
          ctx.drawImage(img, 0, 0, RES, RES);
          renderCoords();
        };
        img.onerror = () => {
          ctx.fillStyle = '#d4a373';
          ctx.fillRect(0, 0, RES, RES);
          renderCoords();
        };
      });
    }

    return new Promise((resolve) => {
      ctx.fillStyle = currentTheme === 'emerald' ? '#122012' : currentTheme === 'azure' ? '#0f1b2b' : currentTheme === 'marble' ? '#1a1d24' : '#fffdf9';
      ctx.fillRect(0, 0, RES, RES);

      const borderCol = currentTheme === 'emerald' ? '#386632' : currentTheme === 'azure' ? '#325884' : currentTheme === 'marble' ? '#4b5563' : '#7c3110';
      ctx.strokeStyle = borderCol;
      ctx.lineWidth = 12;
      ctx.strokeRect(marginPx - 6, marginPx - 6, innerSize + 12, innerSize + 12);

      ctx.strokeStyle = currentTheme === 'classic' ? '#d8d3c8' : 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 4;
      ctx.strokeRect(6, 6, RES - 12, RES - 12);

      ctx.font = '900 58px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = currentTheme === 'emerald' ? '#9ae6b4' : currentTheme === 'azure' ? '#90cdf4' : currentTheme === 'marble' ? '#e2e8f0' : '#14110f';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const rawFiles = [...FILES];
      const files = flipped ? [...rawFiles].reverse() : rawFiles;
      const sqPx = innerSize / 10;

      for (let f = 0; f < 10; f++) {
        const x = marginPx + (f + 0.5) * sqPx;
        ctx.fillText(files[f], x, RES - marginPx * 0.50);
        ctx.fillText(files[f], x, marginPx * 0.50);
      }

      for (let r = 0; r < 10; r++) {
        const num = flipped ? 10 - r : r + 1;
        const y = marginPx + (9 - r + 0.5) * sqPx;
        ctx.fillText(String(num), marginPx * 0.50, y);
        ctx.fillText(String(num), RES - marginPx * 0.50, y);
      }

      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAniso;
      tex.needsUpdate = true;
      resolve(tex);
    });
  }, []);

  const createRimTexture = useCallback((title: string, moveText: string) => {
    const cv = document.createElement('canvas');
    cv.width = 1024;
    cv.height = 64;
    const ctx = cv.getContext('2d')!;

    ctx.fillStyle = '#1c1007';
    ctx.fillRect(0, 0, 1024, 64);

    ctx.strokeStyle = '#7a421f';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 1020, 60);

    ctx.fillStyle = '#f5ede0';
    ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(title || 'NUR SHAXMAT 100', 35, 32);

    ctx.font = 'italic 24px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(moveText || '', 989, 32);

    const tex = new THREE.CanvasTexture(cv);
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Three.js sahnasini ishga tushirish
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let destroyed = false;

    // Barcha donalar uchun yagona, qayta ishlatiladigan (memory-leak-free) materiallar
    sharedMaterialsRef.current = {
      goldCrownMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xfbbf24),
        roughness: 0.18,
        metalness: 0.88,
      }),
      // Oq donalar: tiniq fil suyagi oqi, relyef qirralari aniq ko'rinadi
      whiteMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xfffdf6),
        roughness: 0.20,
        metalness: 0.03,
      }),
      // Qora donalar: chuqur sayqallangan ebonit-obsidiyan, yorqin siluet jilosi bilan
      blackMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x1f1c19),
        roughness: 0.18,
        metalness: 0.12,
      }),
      nurWhiteMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xffffff),
        roughness: 0.12,
        metalness: 0.04,
      }),
      nurBlackMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x0f0f11),
        roughness: 0.14,
        metalness: 0.16,
      }),
    };

    ensureModelsLoaded().then(() => {
      if (destroyed) return;
      setIsLoaded(true);
      requestRender(45);
    });

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 800;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    const isMobile =
      typeof navigator !== 'undefined' &&
      (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
        Boolean((window as any).AndroidBridge) ||
        ('ontouchstart' in window && window.innerWidth < 1024) ||
        window.innerWidth < 768);

    renderer.setSize(width, height, false);
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    // Yuqori Retina aniqlik (Idle holatda 0% GPU ishlagani tufayli telefonni qizdirmaydi va xira ko'rinmaydi!)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 2.0 : 2.5));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = isMobile ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    const maxAniso = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    cameraRef.current = camera;

    const updateCameraForAspect = (w: number, h: number) => {
      if (!cameraRef.current) return;
      const aspect = w / h;
      cameraRef.current.aspect = aspect;

      const isCinema = !!cinemaModeRef.current;
      const isLandscape = aspect > 1.05;

      let baseDist: number;
      let lookAtZ: number;

      if (isLandscape) {
        baseDist = isCinema ? 14.2 : 15.6;
        lookAtZ = 0.75;
      } else {
        baseDist = isCinema ? 33.0 : 38.0;
        lookAtZ = 0.40;
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
    };

    updateCameraRef.current = updateCameraForAspect;
    updateCameraForAspect(width, height);

    // ── PROFESSIONAL 3-NUQTALI STUDIYA YORITISH TIZIMI (Donalar kristaldek tiniq chiqishi uchun) ──
    const hemi = new THREE.HemisphereLight(0xfffbf2, 0x3a2616, 0.64);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xfffaed, 1.02);
    key.position.set(5.5, 22, 7.5);
    key.castShadow = true;
    const shadowMapDim = isMobile ? 1024 : 2048;
    key.shadow.mapSize.width = shadowMapDim;
    key.shadow.mapSize.height = shadowMapDim;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 42;
    const d = 8.8;
    key.shadow.camera.left = -d;
    key.shadow.camera.right = d;
    key.shadow.camera.top = d;
    key.shadow.camera.bottom = -d;
    key.shadow.bias = -0.0004;
    key.shadow.radius = 2.0;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xf3f6ff, 0.34);
    fill.position.set(-8.5, 15, 6.5);
    scene.add(fill);

    // Qora donalar relyefi va qirralarini aniq ko'rsatuvchi kontur nuri
    const blackKey = new THREE.DirectionalLight(0xfff6ea, 0.38);
    blackKey.position.set(-2.5, 20, -6);
    scene.add(blackKey);

    const rimLight = new THREE.DirectionalLight(0xfff2db, 0.52);
    rimLight.position.set(0, 15, -13);
    scene.add(rimLight);

    // Stol usti yumshoq 3D soyasi
    const shadowGeo = new THREE.PlaneGeometry(60, 60);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.55 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.40;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Doska ramkasi
    const currentTheme = boardTheme || 'classic';
    createFrameTexture(isFlipped, currentTheme).then((frameTex) => {
      if (destroyed) return;
      const frameGeo = new THREE.BoxGeometry(TOTAL_WIDTH, BOARD_THICKNESS, TOTAL_WIDTH);
      const topMat = new THREE.MeshStandardMaterial({
        map: frameTex,
        roughness: 0.28,
        metalness: 0.0,
        color: 0xffffff,
      });
      const sideMat = new THREE.MeshStandardMaterial({
        color: 0x3d1808,
        roughness: 0.40,
        metalness: 0.05,
      });

      const materials = [sideMat, sideMat, topMat, sideMat, sideMat, sideMat];
      const frameMesh = new THREE.Mesh(frameGeo, materials);
      frameMesh.position.y = -BOARD_THICKNESS / 2;
      frameMesh.castShadow = true;
      frameMesh.receiveShadow = true;
      scene.add(frameMesh);
      frameMeshRef.current = frameMesh;
      requestRender(30);
    });

    // ── 10x10 KVADRATLAR ──
    const textureLoader = new THREE.TextureLoader();
    let initLightTex = '/textures/classic_light_square.jpg';
    let initDarkTex = '/textures/classic_dark_square.jpg';
    if (currentTheme === 'wood') {
      initLightTex = '/textures/wood_light_square.jpg';
      initDarkTex = '/textures/wood_dark_square.jpg';
    }

    const lightTex = textureLoader.load(initLightTex, () => requestRender(20));
    lightTex.colorSpace = THREE.SRGBColorSpace;
    lightTex.anisotropy = maxAniso;
    const darkTex = textureLoader.load(initDarkTex, () => requestRender(20));
    darkTex.colorSpace = THREE.SRGBColorSpace;
    darkTex.anisotropy = maxAniso;

    const lightMat = new THREE.MeshStandardMaterial({
      map: lightTex,
      roughness: 0.32,
      metalness: 0.02,
      color: 0xffffff,
    });
    const darkMat = new THREE.MeshStandardMaterial({
      map: darkTex,
      roughness: 0.30,
      metalness: 0.02,
      color: 0xffffff,
    });

    const sqGeo = new THREE.BoxGeometry(SQ_SIZE * 0.994, 0.035, SQ_SIZE * 0.994);
    const squareMeshes: THREE.Mesh[] = [];

    for (let r = 0; r < 10; r++) {
      for (let f = 0; f < 10; f++) {
        const isLight = (r + f) % 2 !== 0;
        const sq = new THREE.Mesh(sqGeo, isLight ? lightMat : darkMat);
        sq.position.x = (f - 4.5) * SQ_SIZE;
        sq.position.z = (4.5 - r) * SQ_SIZE;
        sq.position.y = 0.018;
        sq.receiveShadow = true;
        sq.userData = { file: f, rank: r };
        scene.add(sq);
        squareMeshes.push(sq);
      }
    }
    squareMeshesRef.current = squareMeshes;

    const initialRimTex = createRimTexture(frontRimTitle || 'NUR SHAXMAT 100', frontRimMoveText || '');
    const rimGeo = new THREE.BoxGeometry(TOTAL_WIDTH, 0.34, 0.10);
    const rimMat = new THREE.MeshStandardMaterial({ map: initialRimTex, roughness: 0.80, metalness: 0.0 });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.set(0, -BOARD_THICKNESS / 2 - 0.02, TOTAL_WIDTH / 2 + 0.05);
    rimMesh.rotation.x = -0.22;
    rimMeshRef.current = rimMesh;

    const highlightsGroup = new THREE.Group();
    scene.add(highlightsGroup);
    highlightsGroupRef.current = highlightsGroup;

    // ── AQLLI ON-DEMAND RENDER VA SILLIQ GLIDE ANIMATSIYASI (Idle holatda 0% GPU yuklama!) ──
    const renderLoop = () => {
      animFrameRef.current = requestAnimationFrame(renderLoop);

      let needsDraw = false;

      // 1. Silliq yurish animatsiyalarini yangilash (185ms cubic-out)
      if (pieceGlidesRef.current.size > 0) {
        const now = performance.now();
        for (const [id, anim] of pieceGlidesRef.current.entries()) {
          const rawT = Math.min(1, (now - anim.startTime) / anim.duration);
          const easeT = 1 - Math.pow(1 - rawT, 3);
          anim.mesh.position.x = anim.fromX + (anim.toX - anim.fromX) * easeT;
          anim.mesh.position.z = anim.fromZ + (anim.toZ - anim.fromZ) * easeT;
          anim.mesh.position.y = anim.baseY + Math.sin(rawT * Math.PI) * anim.jumpArc;
          if (rawT >= 1) {
            anim.mesh.position.set(anim.toX, anim.baseY, anim.toZ);
            pieceGlidesRef.current.delete(id);
          }
        }
        needsDraw = true;
      }

      // 2. Foydalanuvchi donani sudrayotgan bo'lsa
      if (pointerStartRef.current?.isDragging) {
        needsDraw = true;
      }

      // 3. O'zgarishdan keyingi bufer kadrlar
      if (renderFramesRef.current > 0) {
        renderFramesRef.current--;
        needsDraw = true;
      }

      if (needsDraw) {
        renderer.render(scene, camera);
      }
    };
    renderLoop();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          updateCameraForAspect(w, h);
          rendererRef.current.setSize(w, h, false);
          requestRender(25);
          if (canvasRef.current) {
            canvasRef.current.style.width = '100%';
            canvasRef.current.style.height = '100%';
          }
        }
      }
    });
    resizeObserver.observe(container);

    const handleOrientationChange = () => {
      const recompute = () => {
        if (!container || !cameraRef.current || !rendererRef.current) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        if (w > 0 && h > 0) {
          updateCameraForAspect(w, h);
          rendererRef.current.setSize(w, h, false);
          requestRender(25);
          if (canvasRef.current) {
            canvasRef.current.style.width = '100%';
            canvasRef.current.style.height = '100%';
          }
        }
      };
      recompute();
      setTimeout(recompute, 80);
      setTimeout(recompute, 280);
    };
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
    const handleContextRestored = () => {
      requestRender(45);
      renderLoop();
    };
    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    return () => {
      destroyed = true;
      resizeObserver.disconnect();
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (highlightsGroupRef.current) disposeHighlightGroup(highlightsGroupRef.current);
      if (sharedMaterialsRef.current) {
        Object.values(sharedMaterialsRef.current).forEach((m) => m.dispose());
        sharedMaterialsRef.current = null;
      }
      pieceMeshesMapRef.current.clear();
      pieceGlidesRef.current.clear();
      renderer.dispose();
      updateCameraRef.current = null;
    };
  }, [createFrameTexture, createRimTexture, requestRender]);

  // Cinema Mode o'zgarganda kamerani yangilash
  useEffect(() => {
    if (containerRef.current && updateCameraRef.current) {
      updateCameraRef.current(containerRef.current.clientWidth, containerRef.current.clientHeight);
      requestRender(30);
    }
  }, [cinemaMode, requestRender]);

  // isFlipped yoki boardTheme o'zgarganda ramka va katak materiallarini yangilash
  useEffect(() => {
    if (!frameMeshRef.current) return;
    const currentTheme = boardTheme || 'classic';
    const maxAniso = rendererRef.current ? Math.min(rendererRef.current.capabilities.getMaxAnisotropy(), 8) : 4;

    createFrameTexture(isFlipped, currentTheme).then((newTex) => {
      if (frameMeshRef.current) {
        const mat = frameMeshRef.current.material;
        if (Array.isArray(mat)) {
          const oldMap = (mat[2] as THREE.MeshStandardMaterial).map;
          if (oldMap && oldMap !== newTex) oldMap.dispose();
          (mat[2] as THREE.MeshStandardMaterial).map = newTex;
          (mat[2] as THREE.MeshStandardMaterial).needsUpdate = true;
        } else {
          const oldMap = (mat as THREE.MeshStandardMaterial).map;
          if (oldMap && oldMap !== newTex) oldMap.dispose();
          (mat as THREE.MeshStandardMaterial).map = newTex;
          (mat as THREE.MeshStandardMaterial).needsUpdate = true;
        }
        requestRender(25);
      }
    });

    const textureLoader = new THREE.TextureLoader();
    let newLightMat: THREE.Material;
    let newDarkMat: THREE.Material;

    if (currentTheme === 'classic') {
      const lightTex = textureLoader.load('/textures/classic_light_square.jpg', () => requestRender(20));
      lightTex.colorSpace = THREE.SRGBColorSpace;
      lightTex.anisotropy = maxAniso;
      const darkTex = textureLoader.load('/textures/classic_dark_square.jpg', () => requestRender(20));
      darkTex.colorSpace = THREE.SRGBColorSpace;
      darkTex.anisotropy = maxAniso;
      newLightMat = new THREE.MeshStandardMaterial({ map: lightTex, roughness: 0.32, metalness: 0.02 });
      newDarkMat = new THREE.MeshStandardMaterial({ map: darkTex, roughness: 0.30, metalness: 0.02 });
    } else if (currentTheme === 'wood') {
      const lightTex = textureLoader.load('/textures/wood_light_square.jpg', () => requestRender(20));
      lightTex.colorSpace = THREE.SRGBColorSpace;
      lightTex.anisotropy = maxAniso;
      const darkTex = textureLoader.load('/textures/wood_dark_square.jpg', () => requestRender(20));
      darkTex.colorSpace = THREE.SRGBColorSpace;
      darkTex.anisotropy = maxAniso;
      newLightMat = new THREE.MeshStandardMaterial({ map: lightTex, roughness: 0.32, metalness: 0.02 });
      newDarkMat = new THREE.MeshStandardMaterial({ map: darkTex, roughness: 0.30, metalness: 0.02 });
    } else if (currentTheme === 'emerald') {
      newLightMat = new THREE.MeshStandardMaterial({ color: 0xdce6cd, roughness: 0.35, metalness: 0.04 });
      newDarkMat = new THREE.MeshStandardMaterial({ color: 0x4b7740, roughness: 0.35, metalness: 0.04 });
    } else if (currentTheme === 'azure') {
      newLightMat = new THREE.MeshStandardMaterial({ color: 0xd0e0f2, roughness: 0.35, metalness: 0.04 });
      newDarkMat = new THREE.MeshStandardMaterial({ color: 0x385c88, roughness: 0.35, metalness: 0.04 });
    } else {
      newLightMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.35, metalness: 0.04 });
      newDarkMat = new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.35, metalness: 0.04 });
    }

    squareMeshesRef.current.forEach((sq, idx) => {
      const r = Math.floor(idx / 10);
      const f = idx % 10;
      const isLight = (r + f) % 2 !== 0;
      sq.material = isLight ? newLightMat : newDarkMat;
    });
    requestRender(30);
  }, [isFlipped, boardTheme, createFrameTexture, requestRender]);

  // Old qirra plintusi matnini yangilash
  useEffect(() => {
    if (!rimMeshRef.current) return;
    const newTex = createRimTexture(frontRimTitle || 'NUR SHAXMAT 100', frontRimMoveText || '');
    (rimMeshRef.current.material as THREE.MeshStandardMaterial).map = newTex;
    (rimMeshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true;
    requestRender(10);
  }, [frontRimTitle, frontRimMoveText, createRimTexture, requestRender]);

  // ── DONALAR VA BELGILARNI YANGILASH (Game State o'zgarganda) ──
  useEffect(() => {
    const scene = sceneRef.current;
    const mats = sharedMaterialsRef.current;
    if (!scene || !isLoaded || !mats) return;

    const board = game.board;
    const flipped = isFlipped;
    const flipJustChanged = prevFlippedRef.current !== flipped;
    prevFlippedRef.current = flipped;

    const pieceMeshesMap = pieceMeshesMapRef.current;
    const currentPieceIds = new Set<string>();
    const { goldCrownMat, whiteMat, blackMat, nurWhiteMat, nurBlackMat } = mats;

    for (let r = 0; r < 10; r++) {
      for (let f = 0; f < 10; f++) {
        const piece = board[r]?.[f];
        if (!piece) continue;

        currentPieceIds.add(piece.id);
        const { x, z } = getSquareWorldPos(f, r, flipped);
        const typeKey = piece.type.toLowerCase();
        let meshGroup = pieceMeshesMap.get(piece.id);

        // Agar piyoda marrada boshqa donaga aylangan bo'lsa (Promotion), eski piyoda 3D modelini almashtiramiz
        if (meshGroup && meshGroup.userData?.typeKey && meshGroup.userData.typeKey !== typeKey) {
          scene.remove(meshGroup);
          pieceMeshesMap.delete(piece.id);
          pieceGlidesRef.current.delete(piece.id);
          meshGroup = undefined;
        }

        if (!meshGroup) {
          const gltf = modelCache[typeKey];
          if (!gltf) continue;

          meshGroup = gltf.scene.clone(true) as THREE.Group;
          const isWhite = piece.color === 'white';
          const mat = isWhite ? whiteMat : blackMat;

          meshGroup.traverse((ch: any) => {
            if (ch.isMesh) {
              ch.material = mat;
              ch.castShadow = true;
              ch.receiveShadow = true;
              ch.userData = { pieceId: piece.id };
            }
          });

          if (typeKey === 'king') {
            const crown = createKingCrown(goldCrownMat, piece.id);
            meshGroup.add(crown);
          }

          if (typeKey === 'queen') {
            const queenDiamond = createQueenDiamond(isWhite, piece.id, nurWhiteMat, nurBlackMat);
            meshGroup.add(queenDiamond);
          }

          if (typeKey === 'nur') {
            const crossMat = isWhite ? nurBlackMat : nurWhiteMat;
            const nurCross = createNurCross(isWhite, piece.id, crossMat);
            meshGroup.add(nurCross);
          }

          const box = new THREE.Box3().setFromObject(meshGroup);
          const sz = new THREE.Vector3();
          box.getSize(sz);
          const targetHeight = SCALES[typeKey] || 1.0;
          const s = targetHeight / sz.y;
          meshGroup.scale.set(s, s, s);

          const center = new THREE.Vector3();
          box.getCenter(center);
          meshGroup.userData = {
            centerOffset: new THREE.Vector3(center.x * s, box.min.y * s, center.z * s),
            pieceId: piece.id,
            typeKey,
          };

          meshGroup.position.set(x - center.x * s, -box.min.y * s + 0.038, z - center.z * s);

          let rot = isWhite ? 0 : Math.PI;
          if (typeKey === 'knight') {
            rot = isWhite ? 0.35 : Math.PI - 0.35;
          }
          meshGroup.rotation.y = rot;

          scene.add(meshGroup);
          pieceMeshesMap.set(piece.id, meshGroup);
        } else {
          const offset = meshGroup.userData.centerOffset;
          const targetX = x - offset.x;
          const targetZ = z - offset.z;
          const baseY = -offset.y + 0.038;

          const dist = Math.hypot(meshGroup.position.x - targetX, meshGroup.position.z - targetZ);

          if (!flipJustChanged && dist > 0.06) {
            // Silliq 185ms yurish animatsiyasi (Ot va Nur sakrab o'tadi!)
            const jumpArc = typeKey === 'knight' || typeKey === 'nur' ? 0.42 : 0.10;
            pieceGlidesRef.current.set(piece.id, {
              mesh: meshGroup,
              fromX: meshGroup.position.x,
              fromZ: meshGroup.position.z,
              toX: targetX,
              toZ: targetZ,
              baseY,
              jumpArc,
              startTime: performance.now(),
              duration: 185,
            });
          } else {
            pieceGlidesRef.current.delete(piece.id);
            meshGroup.position.set(targetX, baseY, targetZ);
          }
        }
      }
    }

    // Urib olingan donalarni (shu jumladan En Passant orqali olingan piyodani!) sahnadan tozalash
    for (const [id, mesh] of pieceMeshesMap.entries()) {
      if (!currentPieceIds.has(id)) {
        scene.remove(mesh);
        pieceMeshesMap.delete(id);
        pieceGlidesRef.current.delete(id);
      }
    }

    // ── HIGHLIGHTS: Tanlangan, So'nggi yurish va Mumkin bo'lgan harakatlar ──
    const hlGroup = highlightsGroupRef.current;
    if (hlGroup) {
      disposeHighlightGroup(hlGroup);

      // 1. Tanlangan kvadrat (Oltin yorug'lik maydoni)
      if (selectedSquare) {
        const { x, z } = getSquareWorldPos(selectedSquare.file, selectedSquare.rank, flipped);
        const selGeo = new THREE.PlaneGeometry(SQ_SIZE * 0.96, SQ_SIZE * 0.96);
        const selMat = new THREE.MeshBasicMaterial({
          color: 0xeab308,
          transparent: true,
          opacity: 0.56,
          side: THREE.DoubleSide,
        });
        const selMesh = new THREE.Mesh(selGeo, selMat);
        selMesh.rotation.x = -Math.PI / 2;
        selMesh.position.set(x, 0.042, z);
        hlGroup.add(selMesh);
      }

      // 2. So'nggi harakat izi (Yashil krest va hoshiya)
      if (game.lastMove) {
        const greenMat = new THREE.LineBasicMaterial({ color: 0x22c55e, linewidth: 3 });

        const fromPos = getSquareWorldPos(game.lastMove.from.file, game.lastMove.from.rank, flipped);
        const crossGeo = new THREE.BufferGeometry();
        const pts = [
          new THREE.Vector3(fromPos.x, 0.045, fromPos.z - 0.35),
          new THREE.Vector3(fromPos.x, 0.045, fromPos.z - 0.12),
          new THREE.Vector3(fromPos.x, 0.045, fromPos.z + 0.12),
          new THREE.Vector3(fromPos.x, 0.045, fromPos.z + 0.35),
          new THREE.Vector3(fromPos.x - 0.35, 0.045, fromPos.z),
          new THREE.Vector3(fromPos.x - 0.12, 0.045, fromPos.z),
          new THREE.Vector3(fromPos.x + 0.12, 0.045, fromPos.z),
          new THREE.Vector3(fromPos.x + 0.35, 0.045, fromPos.z),
        ];
        crossGeo.setFromPoints(pts);
        const cross = new THREE.LineSegments(crossGeo, greenMat);
        hlGroup.add(cross);

        const toPos = getSquareWorldPos(game.lastMove.to.file, game.lastMove.to.rank, flipped);
        const borderGeo = new THREE.BufferGeometry();
        const bPts = [
          new THREE.Vector3(toPos.x - 0.48, 0.045, toPos.z - 0.48),
          new THREE.Vector3(toPos.x + 0.48, 0.045, toPos.z - 0.48),
          new THREE.Vector3(toPos.x + 0.48, 0.045, toPos.z + 0.48),
          new THREE.Vector3(toPos.x - 0.48, 0.045, toPos.z + 0.48),
          new THREE.Vector3(toPos.x - 0.48, 0.045, toPos.z - 0.48),
        ];
        borderGeo.setFromPoints(bPts);
        const border = new THREE.Line(borderGeo, greenMat);
        hlGroup.add(border);
      }

      // 3. Mumkin bo'lgan qonuniy harakatlar (Bo'sh kataklar -> yashil nuqta, Urish & En Passant -> qizil halqa!)
      if (selectedSquare && legalMoves.length > 0) {
        const highlightedEpPawns = new Set<string>();

        for (const m of legalMoves) {
          const { x, z } = getSquareWorldPos(m.to.file, m.to.rank, flipped);
          const isCapture = Boolean(board[m.to.rank]?.[m.to.file] || m.isEnPassant || m.capturedPiece);

          if (isCapture) {
            const ringGeo = new THREE.RingGeometry(0.36, 0.46, 32);
            const ringMat = new THREE.MeshBasicMaterial({
              color: 0xef4444,
              transparent: true,
              opacity: 0.92,
              side: THREE.DoubleSide,
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = -Math.PI / 2;
            ring.position.set(x, 0.047, z);
            hlGroup.add(ring);

            // Agar yo'l-yo'lakay urish (En Passant) bo'lsa, o'ртада bo'sh katakda ham aniq nishon va uriladigan raqib piyodasi tagida ogohlantiruvchi halqa ko'rsatamiz
            if (m.isEnPassant) {
              const epDotGeo = new THREE.CircleGeometry(0.14, 24);
              const epDotMat = new THREE.MeshBasicMaterial({
                color: 0xf87171,
                transparent: true,
                opacity: 0.88,
                side: THREE.DoubleSide,
              });
              const epDot = new THREE.Mesh(epDotGeo, epDotMat);
              epDot.rotation.x = -Math.PI / 2;
              epDot.position.set(x, 0.048, z);
              hlGroup.add(epDot);

              if (m.enPassantCaptureSquare) {
                const epKey = `${m.enPassantCaptureSquare.file},${m.enPassantCaptureSquare.rank}`;
                if (!highlightedEpPawns.has(epKey)) {
                  highlightedEpPawns.add(epKey);
                  const epVictimPos = getSquareWorldPos(
                    m.enPassantCaptureSquare.file,
                    m.enPassantCaptureSquare.rank,
                    flipped
                  );
                  const victimGeo = new THREE.PlaneGeometry(SQ_SIZE * 0.92, SQ_SIZE * 0.92);
                  const victimMat = new THREE.MeshBasicMaterial({
                    color: 0xf97316,
                    transparent: true,
                    opacity: 0.36,
                    side: THREE.DoubleSide,
                  });
                  const victimMesh = new THREE.Mesh(victimGeo, victimMat);
                  victimMesh.rotation.x = -Math.PI / 2;
                  victimMesh.position.set(epVictimPos.x, 0.044, epVictimPos.z);
                  hlGroup.add(victimMesh);
                }
              }
            }
          } else {
            const dotGeo = new THREE.CircleGeometry(0.18, 24);
            const dotMat = new THREE.MeshBasicMaterial({
              color: 0x10b981,
              transparent: true,
              opacity: 0.88,
              side: THREE.DoubleSide,
            });
            const dot = new THREE.Mesh(dotGeo, dotMat);
            dot.rotation.x = -Math.PI / 2;
            dot.position.set(x, 0.046, z);
            hlGroup.add(dot);
          }
        }
      }

      // 3.5 Maslahat harakati (Hint: Sariq Chiroq)
      if (hintMove) {
        const fromPos = getSquareWorldPos(hintMove.from.file, hintMove.from.rank, flipped);
        const hintRingGeo = new THREE.RingGeometry(0.30, 0.44, 32);
        const hintRingMat = new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          transparent: true,
          opacity: 0.95,
          side: THREE.DoubleSide,
        });
        const hintRing = new THREE.Mesh(hintRingGeo, hintRingMat);
        hintRing.rotation.x = -Math.PI / 2;
        hintRing.position.set(fromPos.x, 0.048, fromPos.z);
        hlGroup.add(hintRing);

        const toPos = getSquareWorldPos(hintMove.to.file, hintMove.to.rank, flipped);
        const toDiscGeo = new THREE.CircleGeometry(0.24, 32);
        const toDiscMat = new THREE.MeshBasicMaterial({
          color: 0xfbbf24,
          transparent: true,
          opacity: 0.90,
          side: THREE.DoubleSide,
        });
        const toDisc = new THREE.Mesh(toDiscGeo, toDiscMat);
        toDisc.rotation.x = -Math.PI / 2;
        toDisc.position.set(toPos.x, 0.048, toPos.z);
        hlGroup.add(toDisc);

        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(fromPos.x, 0.048, fromPos.z),
          new THREE.Vector3(toPos.x, 0.048, toPos.z),
        ]);
        const lineMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 3 });
        const hintLine = new THREE.Line(lineGeo, lineMat);
        hlGroup.add(hintLine);
      }

      // 4. Shoh xavf ostida (Check)
      if (game.isInCheck) {
        const kingColor = game.currentTurn;
        let kingSq: Square | null = null;
        for (let r = 0; r < 10; r++) {
          for (let f = 0; f < 10; f++) {
            const p = board[r]?.[f];
            if (p && p.type === 'King' && p.color === kingColor) {
              kingSq = { file: f, rank: r };
              break;
            }
          }
          if (kingSq) break;
        }

        if (kingSq) {
          const { x, z } = getSquareWorldPos(kingSq.file, kingSq.rank, flipped);
          const checkGeo = new THREE.PlaneGeometry(SQ_SIZE * 0.96, SQ_SIZE * 0.96);
          const checkMat = new THREE.MeshBasicMaterial({
            color: 0xdc2626,
            transparent: true,
            opacity: 0.65,
            side: THREE.DoubleSide,
          });
          const checkMesh = new THREE.Mesh(checkGeo, checkMat);
          checkMesh.rotation.x = -Math.PI / 2;
          checkMesh.position.set(x, 0.043, z);
          hlGroup.add(checkMesh);
        }
      }
    }

    requestRender(30);
  }, [
    isLoaded,
    game.board,
    game.lastMove,
    game.isInCheck,
    game.currentTurn,
    selectedSquare,
    legalMoves,
    hintMove,
    isFlipped,
    getSquareWorldPos,
    requestRender,
  ]);

  // ── KVADRATNI ANIQLASH (En Passant va Drag-and-Drop uchun 100% aniq Raycasting) ──
  const getSquareFromPointer = useCallback(
    (clientX: number, clientY: number, preferBoardSquare = false): Square | null => {
      const canvas = canvasRef.current;
      const camera = cameraRef.current;
      if (!canvas || !camera) return null;

      const rect = canvas.getBoundingClientRect();
      const mouseX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

      // Avval doska katagini aniqlaymiz
      let boardSq: Square | null = null;
      const sqHits = raycaster.intersectObjects(squareMeshesRef.current);
      if (sqHits.length > 0) {
        const hit = sqHits[0].object;
        const file = hit.userData.file as number;
        const rank = hit.userData.rank as number;
        const actualFile = stateRef.current.isFlipped ? 9 - file : file;
        const actualRank = stateRef.current.isFlipped ? 9 - rank : rank;
        boardSq = { file: actualFile, rank: actualRank };
      }

      // 1. Agar drag-drop yakunlanayotgan bo'lsa — sudralayotgan donaning o'z 3D mesh'i xalaqit bermasligi uchun to'g'ridan-to'g'ri katakni qaytaramiz!
      if (preferBoardSquare && boardSq) {
        return boardSq;
      }

      // 2. Agar o'yinchining donasi allaqachon tanlangan bo'lsa va bosilgan katak qonuniy yurish (shu jumladan En Passant 6->7 / 7->8 bo'sh katagi!) bo'lsa — oldindagi baland 3D dona to'sib qolmasligi uchun ustuvor ravishda shu katakni qaytaramiz!
      const { selectedSquare: sel, legalMoves: legals, game: g } = stateRef.current;
      if (sel && boardSq && legals.some((m) => squaresEqual(m.to, boardSq!))) {
        return boardSq;
      }

      // 3. Aks holda 3D donalar mesh'ini tekshiramiz (baland donaning boshiga bosganda ham oson tanlanishi uchun)
      const pieceMeshes: THREE.Object3D[] = [];
      pieceMeshesMapRef.current.forEach((group) => {
        group.traverse((ch) => {
          if ((ch as THREE.Mesh).isMesh) {
            pieceMeshes.push(ch);
          }
        });
      });

      const pieceHits = raycaster.intersectObjects(pieceMeshes, false);
      if (pieceHits.length > 0) {
        let obj: THREE.Object3D | null = pieceHits[0].object;
        while (obj && !obj.userData?.pieceId && obj.parent) {
          obj = obj.parent;
        }
        const hitPieceId = obj?.userData?.pieceId;
        if (hitPieceId) {
          const currentBoard = g.board;
          for (let r = 0; r < 10; r++) {
            for (let f = 0; f < 10; f++) {
              if (currentBoard[r]?.[f]?.id === hitPieceId) {
                return { file: f, rank: r };
              }
            }
          }
        }
      }

      return boardSq;
    },
    []
  );

  // Globallashgan test/debug obyekti
  useEffect(() => {
    if (typeof window !== 'undefined' && cameraRef.current && sceneRef.current) {
      (window as any).__BOARD3D = {
        camera: cameraRef.current,
        scene: sceneRef.current,
        squareMeshesRef,
        pieceMeshesMapRef,
        getSquareFromPointer,
        cameraRef,
      };
    }
  }, [isLoaded, getSquareFromPointer]);

  // ── KVADRATNI BOSISH (Click-To-Move) ──
  const handleSquareClick = useCallback(
    (sq: Square) => {
      const {
        game: g,
        gameMode: gm,
        aiColor: ac,
        aiThinking: at,
        onlinePlayerColor: opc,
        selectedSquare: sel,
        legalMoves: legals,
      } = stateRef.current;

      if (gm === 'aiVsAi') return;
      if (gm === 'vsAI' && (g.currentTurn === ac || at)) return;
      if (gm === 'online' && opc && g.currentTurn !== opc) return;

      if (sel) {
        const isLegal = legals.some((m) => squaresEqual(m.to, sq));
        if (isLegal) {
          dispatch({ type: 'SELECT_SQUARE', square: sq });
          return;
        }

        const clickedPiece = g.board[sq.rank]?.[sq.file];
        if (clickedPiece && clickedPiece.color === g.currentTurn) {
          dispatch({ type: 'SELECT_SQUARE', square: sq, forceSelect: true });
          return;
        }

        dispatch({ type: 'SELECT_SQUARE', square: sq });
        return;
      }

      const piece = g.board[sq.rank]?.[sq.file];
      if (piece && piece.color === g.currentTurn) {
        dispatch({ type: 'SELECT_SQUARE', square: sq, forceSelect: true });
      }
    },
    [dispatch]
  );

  // ── FOYDALANUVCHI INTERAKTIV HARAKATLARI (Pointer Down / Move / Up) ──
  const handlePointerDown = (e: React.PointerEvent) => {
    requestRender(20);
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const sq = getSquareFromPointer(e.clientX, e.clientY, false);
    const { game: g, gameMode: gm, aiColor: ac, aiThinking: at, onlinePlayerColor: opc } = stateRef.current;

    if (gm === 'aiVsAi') return;
    if (gm === 'vsAI' && (g.currentTurn === ac || at)) return;
    if (gm === 'online' && opc && g.currentTurn !== opc) return;

    let piece: Piece | null = null;
    let mesh: THREE.Group | null = null;
    let plane: THREE.Plane | null = null;

    if (sq) {
      const p = g.board[sq.rank]?.[sq.file];
      if (p && p.color === g.currentTurn) {
        piece = p;
        mesh = pieceMeshesMapRef.current.get(p.id) || null;
        plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.5);
      }
    }

    pointerStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startTime: Date.now(),
      fromSq: sq,
      isDragging: false,
      piece,
      mesh,
      originalPos: mesh ? mesh.position.clone() : null,
      plane,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const tracker = pointerStartRef.current;
    if (!tracker || !cameraRef.current || !canvasRef.current) return;

    const dx = e.clientX - tracker.startX;
    const dy = e.clientY - tracker.startY;
    const dist = Math.hypot(dx, dy);

    if (!tracker.isDragging && dist >= 14 && tracker.piece && tracker.mesh && tracker.fromSq) {
      tracker.isDragging = true;
      pieceGlidesRef.current.delete(tracker.piece.id);
      tracker.mesh.position.y += 0.35;
      dispatch({ type: 'SELECT_SQUARE', square: tracker.fromSq, forceSelect: true });
      requestRender(20);
    }

    if (tracker.isDragging && tracker.mesh && tracker.plane) {
      requestRender(8);
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

      const hitPoint = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(tracker.plane, hitPoint)) {
        const offset = tracker.mesh.userData.centerOffset;
        tracker.mesh.position.x = hitPoint.x - offset.x;
        tracker.mesh.position.z = hitPoint.z - offset.z;
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    requestRender(35);
    const tracker = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!tracker) return;

    if (tracker.isDragging && tracker.mesh && tracker.originalPos && tracker.fromSq) {
      const offset = tracker.mesh.userData.centerOffset;
      const baseY = -offset.y + 0.038;
      tracker.mesh.position.y = baseY;

      // preferBoardSquare = true -> sudralayotgan donaning 3D mesh'i katakni to'sib qo'ymaydi!
      const toSq = getSquareFromPointer(e.clientX, e.clientY, true);
      if (toSq && !squaresEqual(tracker.fromSq, toSq)) {
        const isLegal = stateRef.current.legalMoves.some((m) => squaresEqual(m.to, toSq));
        if (isLegal) {
          const { x, z } = getSquareWorldPos(toSq.file, toSq.rank, stateRef.current.isFlipped);
          tracker.mesh.position.set(x - offset.x, baseY, z - offset.z);
          dispatch({ type: 'SELECT_SQUARE', square: toSq });
        } else {
          tracker.mesh.position.copy(tracker.originalPos);
        }
      } else {
        tracker.mesh.position.copy(tracker.originalPos);
      }
      return;
    }

    const clickSq = getSquareFromPointer(e.clientX, e.clientY, false) || tracker.fromSq;
    if (clickSq) {
      handleSquareClick(clickSq);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-center select-none touch-none overflow-visible bg-transparent"
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full h-full block cursor-pointer select-none touch-none bg-transparent"
        style={{ width: '100%', height: '100%', display: 'block' }}
      />

      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 text-amber-200 backdrop-blur-sm rounded-2xl">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-sm font-bold tracking-wider">3D Shaxmat Donalari Yuklanmoqda...</span>
        </div>
      )}
    </div>
  );
}
