// =====================================================
// NUR SHAXMAT 100 — Haqiqiy 3D Three.js Dosqa Komponenti
// =====================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GameState, Move, Piece, Square, squaresEqual, FILES } from '../engine/types';

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
}: Board3DProps) {
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
  const highlightsGroupRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);

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

  // Koordinatali yog'och hoshiya teksturasini yaratish (Nur Chess 100: A B C N E D M F G H, 1-10)
  const createFrameTexture = useCallback((flipped: boolean): Promise<THREE.CanvasTexture> => {
    const cv = document.createElement('canvas');
    cv.width = 1024;
    cv.height = 1024;
    const ctx = cv.getContext('2d')!;

    const img = new Image();
    img.src = '/textures/wood_frame.jpg';

    return new Promise((resolve) => {
      const renderCoords = () => {
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

        ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#2b1608';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const rawFiles = [...FILES];
        const files = flipped ? [...rawFiles].reverse() : rawFiles;
        const sqPx = innerSize / 10;

        // Quyi va yuqori harflar
        for (let f = 0; f < 10; f++) {
          const x = marginPx + (f + 0.5) * sqPx;
          ctx.fillText(files[f], x, 1024 - marginPx * 0.46);
          ctx.fillText(files[f], x, marginPx * 0.46);
        }

        // Chap va o'ng raqamlar (1 pastda, 10 tepada)
        for (let r = 0; r < 10; r++) {
          const num = flipped ? 10 - r : r + 1;
          const y = marginPx + (9 - r + 0.5) * sqPx;
          ctx.fillText(String(num), marginPx * 0.46, y);
          ctx.fillText(String(num), 1024 - marginPx * 0.46, y);
        }

        const tex = new THREE.CanvasTexture(cv);
        tex.needsUpdate = true;
        resolve(tex);
      };

      img.onload = () => {
        ctx.drawImage(img, 0, 0, 1024, 1024);
        renderCoords();
      };
      img.onerror = () => {
        ctx.fillStyle = '#d4a373';
        ctx.fillRect(0, 0, 1024, 1024);
        renderCoords();
      };
    });
  }, []);

  // 3D Old Qirra Plintusi uchun tekstura (Screenshotdagi 1 ga 1 plinth)
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

  // Three.js sahnasini ishga tushirish (Shaffof fon va yumshoq soyalar bilan)
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let destroyed = false;

    ensureModelsLoaded().then(() => {
      if (destroyed) return;
      setIsLoaded(true);
    });

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 800;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true, // Shaffof fon — orqa fonga tabiiy qo'shiladi!
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0); // 100% shaffof fon
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.10;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Kamera: Yon tomonlar (1-10 raqamlar) to'liq ko'rinishi uchun keng burchak va balandlik
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 14.8, 11.2);
    camera.lookAt(0, -0.2, 0.2);
    cameraRef.current = camera;

    // ── YORUG'LIK ──
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

    // ── SHAFQATSIZ YUMSHOQ SOYA PLANETASI (ShadowMaterial) ──
    // Orqa fondagi yog'och stol ustiga faqat realistik 3D soya tushadi, hech qanday qora to'rtburchak yo'q!
    const shadowGeo = new THREE.PlaneGeometry(60, 60);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.58 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.40;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // ── DOSQA RAMKASI (Koordinatali asal-eman yog'ochi) ──
    createFrameTexture(isFlipped).then((frameTex) => {
      if (destroyed) return;
      const frameGeo = new THREE.BoxGeometry(TOTAL_WIDTH, BOARD_THICKNESS, TOTAL_WIDTH);
      const frameMat = new THREE.MeshStandardMaterial({
        map: frameTex,
        roughness: 0.44,
        metalness: 0.04,
        color: 0xdeb887,
      });
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      frameMesh.position.y = -BOARD_THICKNESS / 2;
      frameMesh.castShadow = true;
      frameMesh.receiveShadow = true;
      scene.add(frameMesh);
      frameMeshRef.current = frameMesh;
    });

    // ── 10x10 KVADRATLAR ──
    const textureLoader = new THREE.TextureLoader();
    const lightTex = textureLoader.load('/textures/wood_light_square.jpg');
    const darkTex = textureLoader.load('/textures/wood_dark_square.jpg');

    const lightMat = new THREE.MeshStandardMaterial({
      map: lightTex,
      roughness: 0.42,
      metalness: 0.02,
      color: 0xffeedd,
    });
    const darkMat = new THREE.MeshStandardMaterial({
      map: darkTex,
      roughness: 0.38,
      metalness: 0.02,
      color: 0x824e2b,
    });

    const sqGeo = new THREE.BoxGeometry(SQ_SIZE, 0.035, SQ_SIZE);
    const squareMeshes: THREE.Mesh[] = [];

    for (let r = 0; r < 10; r++) {
      for (let f = 0; f < 10; f++) {
        const isLight = (r + f) % 2 !== 0; // 2D dosqa bilan 1 ga 1 mos (o'ng burchak oq)
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

    // ── 3D OLD QIRRA PLINTUSI (Doskaning old tomoniga biriktirilgan) ──
    const initialRimTex = createRimTexture(frontRimTitle || 'NUR SHAXMAT 100', frontRimMoveText || '');
    const rimGeo = new THREE.BoxGeometry(TOTAL_WIDTH, 0.34, 0.10);
    const rimMat = new THREE.MeshStandardMaterial({ map: initialRimTex, roughness: 0.45 });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.set(0, -BOARD_THICKNESS / 2 - 0.02, TOTAL_WIDTH / 2 + 0.05);
    rimMesh.rotation.x = -0.22; // Kameraga qarab sal burchak ostida qiya
    scene.add(rimMesh);
    rimMeshRef.current = rimMesh;

    // Belgilash guruhlari (Highlights)
    const highlightsGroup = new THREE.Group();
    scene.add(highlightsGroup);
    highlightsGroupRef.current = highlightsGroup;

    // Render sikli
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
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      destroyed = true;
      resizeObserver.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
    };
  }, [createFrameTexture, createRimTexture]);

  // isFlipped o'zgarganda ramka koordinata teksturasini yangilash
  useEffect(() => {
    if (!frameMeshRef.current) return;
    createFrameTexture(isFlipped).then((newTex) => {
      if (frameMeshRef.current) {
        (frameMeshRef.current.material as THREE.MeshStandardMaterial).map = newTex;
        (frameMeshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true;
      }
    });
  }, [isFlipped, createFrameTexture]);

  // Old qirra plintusi matnini yangilash
  useEffect(() => {
    if (!rimMeshRef.current) return;
    const newTex = createRimTexture(frontRimTitle || 'NUR SHAXMAT 100', frontRimMoveText || '');
    (rimMeshRef.current.material as THREE.MeshStandardMaterial).map = newTex;
    (rimMeshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true;
  }, [frontRimTitle, frontRimMoveText, createRimTexture]);

  // ── DONALAR VA BELGILARNI YANGILASH (Game State o'zgarganda) ──
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !isLoaded) return;

    const board = game.board;
    const flipped = isFlipped;
    const pieceMeshesMap = pieceMeshesMapRef.current;
    const currentPieceIds = new Set<string>();

    const whiteMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xf6eee2),
      roughness: 0.16,
      metalness: 0.04,
    });
    const blackMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x181615),
      roughness: 0.18,
      metalness: 0.18,
    });

    for (let r = 0; r < 10; r++) {
      for (let f = 0; f < 10; f++) {
        const piece = board[r]?.[f];
        if (!piece) continue;

        currentPieceIds.add(piece.id);
        const { x, z } = getSquareWorldPos(f, r, flipped);
        const typeKey = piece.type.toLowerCase();
        let meshGroup = pieceMeshesMap.get(piece.id);

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
          // Mavjud donaning manzilini yangilash
          const offset = meshGroup.userData.centerOffset;
          const targetX = x - offset.x;
          const targetZ = z - offset.z;

          meshGroup.position.x = targetX;
          meshGroup.position.z = targetZ;
          meshGroup.position.y = -offset.y + 0.038;
        }
      }
    }

    // Urib olingan donalarni sahnadan tozalash
    for (const [id, mesh] of pieceMeshesMap.entries()) {
      if (!currentPieceIds.has(id)) {
        scene.remove(mesh);
        pieceMeshesMap.delete(id);
      }
    }

    // ── HIGHLIGHTS: Tanlangan, So'nggi yurish va Mumkin bo'lgan harakatlar ──
    const hlGroup = highlightsGroupRef.current;
    if (hlGroup) {
      while (hlGroup.children.length > 0) {
        const obj = hlGroup.children[0];
        hlGroup.remove(obj);
      }

      // 1. Tanlangan kvadrat (Oltin yorug'lik maydoni)
      if (selectedSquare) {
        const { x, z } = getSquareWorldPos(selectedSquare.file, selectedSquare.rank, flipped);
        const selGeo = new THREE.PlaneGeometry(SQ_SIZE * 0.96, SQ_SIZE * 0.96);
        const selMat = new THREE.MeshBasicMaterial({
          color: 0xeab308,
          transparent: true,
          opacity: 0.55,
          side: THREE.DoubleSide,
        });
        const selMesh = new THREE.Mesh(selGeo, selMat);
        selMesh.rotation.x = -Math.PI / 2;
        selMesh.position.set(x, 0.042, z);
        hlGroup.add(selMesh);
      }

      // 2. So'nggi harakat izi (Screenshotdagi 1 ga 1 yashil krest va hoshiya)
      if (game.lastMove) {
        const greenMat = new THREE.LineBasicMaterial({ color: 0x22c55e, linewidth: 3 });

        // From: Yashil Krest (+)
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

        // To: Yashil Hoshiya Kvadrat ([ ])
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

      // 3. Mumkin bo'lgan qonuniy harakatlar (Bo'sh kataklar uchun yashil nishon, raqib uchun qizil halqa)
      if (selectedSquare && legalMoves.length > 0) {
        const dotGeo = new THREE.CircleGeometry(0.18, 24);
        const dotMat = new THREE.MeshBasicMaterial({
          color: 0x10b981,
          transparent: true,
          opacity: 0.85,
          side: THREE.DoubleSide,
        });

        const ringGeo = new THREE.RingGeometry(0.38, 0.46, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xef4444,
          transparent: true,
          opacity: 0.90,
          side: THREE.DoubleSide,
        });

        for (const m of legalMoves) {
          const { x, z } = getSquareWorldPos(m.to.file, m.to.rank, flipped);
          const hasPiece = !!board[m.to.rank]?.[m.to.file];
          if (hasPiece) {
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = -Math.PI / 2;
            ring.position.set(x, 0.046, z);
            hlGroup.add(ring);
          } else {
            const dot = new THREE.Mesh(dotGeo, dotMat);
            dot.rotation.x = -Math.PI / 2;
            dot.position.set(x, 0.046, z);
            hlGroup.add(dot);
          }
        }
      }

      // 4. Shoh xavf ostida (Check) bo'lsa — Shoh tagida qizil nurlanish
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
  }, [isLoaded, game.board, game.lastMove, game.isInCheck, game.currentTurn, selectedSquare, legalMoves, isFlipped, getSquareWorldPos]);

  // ── KVADRATNI ANIQLASH (3D Dona Mesh'lari va Kataklar bo'yicha 100% ANIQ) ──
  const getSquareFromPointer = useCallback(
    (clientX: number, clientY: number): Square | null => {
      const canvas = canvasRef.current;
      const camera = cameraRef.current;
      if (!canvas || !camera) return null;

      const rect = canvas.getBoundingClientRect();
      const mouseX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

      // 1. Dastlab 3D donalar ustiga bosilganligini tekshiramiz
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
          const currentBoard = stateRef.current.game.board;
          for (let r = 0; r < 10; r++) {
            for (let f = 0; f < 10; f++) {
              if (currentBoard[r]?.[f]?.id === hitPieceId) {
                return { file: f, rank: r };
              }
            }
          }
        }
      }

      // 2. Agar dona ustiga tushmagan bo'lsa, doska kataklarini tekshiramiz
      const sqHits = raycaster.intersectObjects(squareMeshesRef.current);
      if (sqHits.length > 0) {
        const hit = sqHits[0].object;
        const file = hit.userData.file as number;
        const rank = hit.userData.rank as number;
        const actualFile = stateRef.current.isFlipped ? 9 - file : file;
        const actualRank = stateRef.current.isFlipped ? 9 - rank : rank;
        return { file: actualFile, rank: actualRank };
      }

      return null;
    },
    []
  );

  // ── KVADRATNI BOSISH (Click-To-Move — Mutlaqo Barqaror) ──
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
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const sq = getSquareFromPointer(e.clientX, e.clientY);
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

    // Qasddan 14px dan ko'proq surilgandagina drag faollashadi
    if (!tracker.isDragging && dist >= 14 && tracker.piece && tracker.mesh && tracker.fromSq) {
      tracker.isDragging = true;
      tracker.mesh.position.y += 0.35;
      dispatch({ type: 'SELECT_SQUARE', square: tracker.fromSq, forceSelect: true });
    }

    // Drag jarayonida donaning qo'l bilan silliq harakatlanishi
    if (tracker.isDragging && tracker.mesh && tracker.plane) {
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
    const tracker = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!tracker) return;

    if (tracker.isDragging && tracker.mesh && tracker.originalPos && tracker.fromSq) {
      const offset = tracker.mesh.userData.centerOffset;
      tracker.mesh.position.y = -offset.y + 0.038;

      const toSq = getSquareFromPointer(e.clientX, e.clientY);
      if (toSq && !squaresEqual(tracker.fromSq, toSq)) {
        const isLegal = stateRef.current.legalMoves.some((m) => squaresEqual(m.to, toSq));
        if (isLegal) {
          tracker.mesh.position.copy(tracker.originalPos);
          dispatch({ type: 'SELECT_SQUARE', square: toSq });
        } else {
          tracker.mesh.position.copy(tracker.originalPos);
        }
      } else {
        tracker.mesh.position.copy(tracker.originalPos);
      }
      return;
    }

    // Oddiy bosish (Click / Tap)
    const clickSq = getSquareFromPointer(e.clientX, e.clientY) || tracker.fromSq;
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
      />

      {/* Yuklanish aylanasi */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 text-amber-200 backdrop-blur-sm rounded-2xl">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-sm font-bold tracking-wider">3D Shaxmat Donalari Yuklanmoqda...</span>
        </div>
      )}
    </div>
  );
}
