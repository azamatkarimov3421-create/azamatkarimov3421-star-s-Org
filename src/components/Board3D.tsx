// =====================================================
// NUR SHAXMAT 100 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Haqiqiy 3D Three.js Dosqa Komponenti
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

// Shoh (King) uchun hashamatli sarg'ish-tillarang Oliy Qirollik Toji (Gold Royal Crown)
function createKingCrown(goldCrownMat: THREE.Material, pieceId: string): THREE.Group {
  const crownGroup = new THREE.Group();
  crownGroup.name = 'kingCrown';

  // 1. Asosiy toj gardishi (Crown Band)
  const bandGeo = new THREE.CylinderGeometry(0.108, 0.116, 0.038, 24);
  const band = new THREE.Mesh(bandGeo, goldCrownMat);
  band.position.y = 0.925;
  band.castShadow = true;
  band.receiveShadow = true;
  band.userData = { isCrown: true, pieceId };
  crownGroup.add(band);

  // 2. Gardishning qabariq halqasi (Torus Bead Rim)
  const ringGeo = new THREE.TorusGeometry(0.114, 0.010, 10, 24);
  ringGeo.rotateX(Math.PI / 2);
  const ring = new THREE.Mesh(ringGeo, goldCrownMat);
  ring.position.y = 0.910;
  ring.castShadow = true;
  ring.receiveShadow = true;
  ring.userData = { isCrown: true, pieceId };
  crownGroup.add(ring);

  // 3. Tojning 8 ta sarg'ish-tillarang tishlari va marvaridlari
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
    spike.castShadow = true;
    spike.receiveShadow = true;
    spike.userData = { isCrown: true, pieceId };
    crownGroup.add(spike);

    const pearl = new THREE.Mesh(pearlGeo, goldCrownMat);
    pearl.position.set(sx * 1.06, 1.006, sz * 1.06);
    pearl.castShadow = true;
    pearl.receiveShadow = true;
    pearl.userData = { isCrown: true, pieceId };
    crownGroup.add(pearl);
  }

  // 4. Markaziy oltin gumbaz
  const domeGeo = new THREE.SphereGeometry(0.062, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeo, goldCrownMat);
  dome.position.y = 0.942;
  dome.castShadow = true;
  dome.receiveShadow = true;
  dome.userData = { isCrown: true, pieceId };
  crownGroup.add(dome);

  // 5. Markaziy saltanat globusi (Royal Orb)
  const orbGeo = new THREE.SphereGeometry(0.026, 14, 14);
  const orb = new THREE.Mesh(orbGeo, goldCrownMat);
  orb.position.y = 1.018;
  orb.castShadow = true;
  orb.receiveShadow = true;
  orb.userData = { isCrown: true, pieceId };
  crownGroup.add(orb);

  // 6. Markaziy Oliy Xoch
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

// Nur donasi uchun maxsus 3D kesilgan '+' (Cross) nishoni:
// Rasmiy fizik donadagidek: qasr tishlari orasidan o'tuvchi to'liq xoch
// Oq Nurda: To'q qora '+' xoch
// Qora Nurda: Yorqin oq '+' xoch
function createNurCross(isWhite: boolean, pieceId: string, crossMat: THREE.Material): THREE.Group {
  const nurGroup = new THREE.Group();
  nurGroup.name = 'nurCross';
  nurGroup.userData = { isNurEmblem: true, isCrown: true, pieceId };

  // nur.glb bosh tishlari markaziga tekislash (X = +0.0170, Z = -0.0012)
  nurGroup.position.set(0.017, 0, -0.0012);

  // 1. Vertikal xoch qanoti (Z o'qi bo'yicha tishlar orasidan o'tadi)
  const vCrossGeo = new THREE.BoxGeometry(0.040, 0.026, 0.208);
  const vCross = new THREE.Mesh(vCrossGeo, crossMat);
  vCross.position.y = 0.976;
  vCross.castShadow = true;
  vCross.receiveShadow = true;
  vCross.userData = { isNurEmblem: true, isCrown: true, pieceId };
  nurGroup.add(vCross);

  // 2. Gorizontal xoch qanoti (X o'qi bo'yicha tishlar orasidan o'tadi)
  const hCrossGeo = new THREE.BoxGeometry(0.208, 0.026, 0.040);
  const hCross = new THREE.Mesh(hCrossGeo, crossMat);
  hCross.position.y = 0.976;
  hCross.castShadow = true;
  hCross.receiveShadow = true;
  hCross.userData = { isNurEmblem: true, isCrown: true, pieceId };
  nurGroup.add(hCross);

  // 3. Markaziy kesishish kvadrati / qabariq fasetka
  const coreGeo = new THREE.BoxGeometry(0.048, 0.028, 0.048);
  const core = new THREE.Mesh(coreGeo, crossMat);
  core.position.y = 0.977;
  core.castShadow = true;
  core.receiveShadow = true;
  core.userData = { isNurEmblem: true, isCrown: true, pieceId };
  nurGroup.add(core);

  return nurGroup;
}

// Vazir (Queen / Farzin) donasi uchun maxsus 4 qirrali piramida romb nishoni:
// Rasmiy fizik donadagidek:
// - Uchida qoracha (black apex cap)
// - 4 tarafdan yorqin oq fasetkalar (4 gleaming white triangular facets)
// - Qirralar bo'ylab uchidan pastga ingichka boshlanib, qalinlashib ketgan ko'paytiruv 'X' qovurg'alari
// - Pastki perimetrida qora romb gardishi
function createQueenDiamond(isWhite: boolean, pieceId: string, nurWhiteMat: THREE.Material, nurBlackMat: THREE.Material): THREE.Group {
  const queenGroup = new THREE.Group();
  queenGroup.name = 'queenDiamond';
  queenGroup.userData = { isQueenDiamond: true, isCrown: true, pieceId };

  // Queen head collar level in queen.glb is Y ~ 0.970
  const baseY = 0.970;
  const apexY = 1.036;
  const h = apexY - baseY;
  const r = 0.076;

  // 1. Qora ostki romb gardishi (Black outer base border framing the diamond)
  const baseBorderGeo = new THREE.CylinderGeometry(r * 1.05, r * 1.10, 0.010, 4);
  baseBorderGeo.rotateY(Math.PI / 4);
  const baseBorder = new THREE.Mesh(baseBorderGeo, nurBlackMat);
  baseBorder.position.y = baseY;
  baseBorder.castShadow = true;
  baseBorder.receiveShadow = true;
  baseBorder.userData = { isQueenDiamond: true, isCrown: true, pieceId };
  queenGroup.add(baseBorder);

  // 2. 4 ta yorqin oq fasetka (Pyramid body with 4 white faces)
  const pyrGeo = new THREE.ConeGeometry(r, h, 4);
  pyrGeo.rotateY(Math.PI / 4);
  const pyr = new THREE.Mesh(pyrGeo, nurWhiteMat);
  pyr.position.y = baseY + h / 2;
  pyr.castShadow = true;
  pyr.receiveShadow = true;
  pyr.userData = { isQueenDiamond: true, isCrown: true, pieceId };
  queenGroup.add(pyr);

  // 3. Ko'paytiruv 'X' qovurg'alari (Ingichkadan qalinlashib boruvchi 4 qora qirra)
  // 4 ta burchak: θ = π/4, 3π/4, 5π/4, 7π/4
  const armLen = Math.sqrt(r * r + h * h);

  for (let i = 0; i < 4; i++) {
    const angle = (Math.PI / 4) + i * (Math.PI / 2);
    // Tapered cylinder: uchida ingichka (radius 0.0035), pastda qalinlashgan (radius 0.009)
    const ribGeo = new THREE.CylinderGeometry(0.0020, 0.0050, armLen, 6);
    const rib = new THREE.Mesh(ribGeo, nurBlackMat);

    // Burchakdan uchiga tomon yo'naltirish
    const dir = new THREE.Vector3(-r * Math.cos(angle), h, -r * Math.sin(angle)).normalize();
    rib.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

    // O'rtadagi nuqta
    rib.position.set(r * 0.5 * Math.cos(angle), baseY + h * 0.5, r * 0.5 * Math.sin(angle));
    rib.castShadow = true;
    rib.receiveShadow = true;
    rib.userData = { isQueenDiamond: true, isCrown: true, pieceId };
    queenGroup.add(rib);
  }

  // 4. Cho'qqidagi qoracha nuqta (Uchida qoracha apex cap)
  const apexGeo = new THREE.ConeGeometry(0.008, 0.010, 4);
  apexGeo.rotateY(Math.PI / 4);
  const apexMesh = new THREE.Mesh(apexGeo, nurBlackMat);
  apexMesh.position.y = apexY - 0.001;
  apexMesh.castShadow = true;
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
  const createFrameTexture = useCallback((flipped: boolean, currentTheme: BoardTheme = 'classic'): Promise<THREE.CanvasTexture> => {
    const cv = document.createElement('canvas');
    cv.width = 1024;
    cv.height = 1024;
    const ctx = cv.getContext('2d')!;

    const marginPx = (FRAME_MARGIN / TOTAL_WIDTH) * 1024;
    const innerSize = 1024 - marginPx * 2;

    if (currentTheme === 'wood') {
      const img = new Image();
      img.src = '/textures/wood_frame.jpg';

      return new Promise((resolve) => {
        const renderCoords = () => {
          ctx.fillStyle = 'rgba(165, 115, 60, 0.25)';
          ctx.fillRect(0, 0, 1024, 1024);

          ctx.strokeStyle = '#221105';
          ctx.lineWidth = 4;
          ctx.strokeRect(marginPx, marginPx, innerSize, innerSize);

          ctx.strokeStyle = '#85552a';
          ctx.lineWidth = 2;
          ctx.strokeRect(marginPx - 2, marginPx - 2, innerSize + 4, innerSize + 4);

          ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
          ctx.fillStyle = '#2b1608';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const rawFiles = [...FILES];
          const files = flipped ? [...rawFiles].reverse() : rawFiles;
          const sqPx = innerSize / 10;

          for (let f = 0; f < 10; f++) {
            const x = marginPx + (f + 0.5) * sqPx;
            ctx.fillText(files[f], x, 1024 - marginPx * 0.48);
            ctx.fillText(files[f], x, marginPx * 0.48);
          }

          for (let r = 0; r < 10; r++) {
            const num = flipped ? 10 - r : r + 1;
            const y = marginPx + (9 - r + 0.5) * sqPx;
            ctx.fillText(String(num), marginPx * 0.48, y);
            ctx.fillText(String(num), 1024 - marginPx * 0.48, y);
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
    }

    // Classic (Rasmiy Nur Doskasi - Foydalanuvchi fotosurati bilan 1 ga 1)
    return new Promise((resolve) => {
      // 1. Toza oq ramka
      ctx.fillStyle = currentTheme === 'emerald' ? '#122012' : currentTheme === 'azure' ? '#0f1b2b' : currentTheme === 'marble' ? '#1a1d24' : '#ffffff';
      ctx.fillRect(0, 0, 1024, 1024);

      // 2. Kataklarni o'rab turuvchi boy shokolad-jigarrang hoshiya chizig'i
      const borderCol = currentTheme === 'emerald' ? '#386632' : currentTheme === 'azure' ? '#325884' : currentTheme === 'marble' ? '#4b5563' : '#853613';
      ctx.strokeStyle = borderCol;
      ctx.lineWidth = 6;
      ctx.strokeRect(marginPx - 3, marginPx - 3, innerSize + 6, innerSize + 6);

      // 3. Nozik tashqi chet chizig'i
      ctx.strokeStyle = currentTheme === 'classic' ? '#dcdad4' : 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 2;
      ctx.strokeRect(3, 3, 1018, 1018);

      // 4. Aniq, qop-qora, o'qilishi oson koordinatalar
      ctx.font = '900 30px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = currentTheme === 'emerald' ? '#9ae6b4' : currentTheme === 'azure' ? '#90cdf4' : currentTheme === 'marble' ? '#e2e8f0' : '#111111';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const rawFiles = [...FILES];
      const files = flipped ? [...rawFiles].reverse() : rawFiles;
      const sqPx = innerSize / 10;

      // Yuqori va pastki harflar (A, B, C, N, E, D, M, F, G, H)
      for (let f = 0; f < 10; f++) {
        const x = marginPx + (f + 0.5) * sqPx;
        ctx.fillText(files[f], x, 1024 - marginPx * 0.50);
        ctx.fillText(files[f], x, marginPx * 0.50);
      }

      // Chap va o'ng raqamlar (1 pastda, 10 tepada)
      for (let r = 0; r < 10; r++) {
        const num = flipped ? 10 - r : r + 1;
        const y = marginPx + (9 - r + 0.5) * sqPx;
        ctx.fillText(String(num), marginPx * 0.50, y);
        ctx.fillText(String(num), 1024 - marginPx * 0.50, y);
      }

      const tex = new THREE.CanvasTexture(cv);
      tex.needsUpdate = true;
      resolve(tex);
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
      alpha: true, // Shaffof fon ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â orqa fonga tabiiy qo'shiladi!
      powerPreference: 'high-performance',
    });
    const isMobile = typeof navigator !== 'undefined' && (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 768);
    renderer.setSize(width, height, false);
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 2));
    renderer.setClearColor(0x000000, 0); // 100% shaffof fon
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = isMobile ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Kamera: Responsive ko'rish masofasi va kengligi
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    cameraRef.current = camera;

    const updateCameraForAspect = (w: number, h: number) => {
      if (!cameraRef.current) return;
      const aspect = w / h;
      cameraRef.current.aspect = aspect;

      // Responsive masofa va balandlik: telefonning tor vertikal ekranida (aspect < 0.94)
      // doskaning 10 ta ustuni va 1-10 raqamlari har doim to'liq ekranga sig'adi!
      // Qulay, keng va professional 61 darajali ko'rish burchagi
      // Responsive masofa va burchak:
      // Foydalanuvchi chizgan binafsha chiziqlar bo'yicha doska maksimal katta qilib o'rnatiladi!
      // Cinema Mode (Kino ko'rish rejimi) yoqilganda esa doska butun ekranni 98% to'ldiradi!
      const isCinema = !!cinemaModeRef.current;
      const isLandscape = aspect > 1.05;

      let baseDist: number;
      let lookAtZ: number;

      if (isLandscape) {
        // Gorizontal ko'rinish: foydalanuvchi chizgan binafsha chiziqqacha (ekran bo'yicha 95% vertikal)
        baseDist = isCinema ? 14.2 : 15.6;
        lookAtZ = 0.75;
      } else {
        // Vertikal telefon: barcha 10 ta ustun (A-H) va raqamlar (1-10) to'liq va maksimal keng
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
    if (typeof window !== 'undefined') {
      (window as any).__BOARD3D = {
        camera,
        scene,
        squareMeshesRef,
        pieceMeshesMapRef,
        getSquareFromPointer,
        cameraRef
      };
    }

    // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ YORUG'LIK (Yumshoq, ko'zni qamashtirmaydigan va yaltiramaydigan yoritish) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
    const amb = new THREE.AmbientLight(0xfff8ee, 0.56);
    scene.add(amb);

    const key = new THREE.DirectionalLight(0xfffae8, 0.68);
    key.position.set(5, 22, 6);
    key.castShadow = true;
    key.shadow.mapSize.width = 1024;
    key.shadow.mapSize.height = 1024;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 40;
    const d = 9.0;
    key.shadow.camera.left = -d;
    key.shadow.camera.right = d;
    key.shadow.camera.top = d;
    key.shadow.camera.bottom = -d;
    key.shadow.bias = -0.0005;
    key.shadow.radius = 2.5;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xfff6ec, 0.18);
    fill.position.set(-8, 14, 6);
    scene.add(fill);

    // Qora donalarning orqa siluetini ko'rsatish uchun yumshoq yorug'lik (doskada yaltirash hosil qilmaydi)
    const blackKey = new THREE.DirectionalLight(0xfff5ea, 0.24);
    blackKey.position.set(0, 20, -5);
    scene.add(blackKey);

    const rimLight = new THREE.DirectionalLight(0xfff5ec, 0.16);
    rimLight.position.set(0, 15, -12);
    scene.add(rimLight);

    // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ SHAFQATSIZ YUMSHOQ SOYA PLANETASI (ShadowMaterial) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
    // Orqa fondagi yog'och stol ustiga faqat realistik 3D soya tushadi, hech qanday qora to'rtburchak yo'q!
    const shadowGeo = new THREE.PlaneGeometry(60, 60);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.58 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.40;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ DOSQA RAMKASI (Koordinatali asal-eman yog'ochi) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
    const currentTheme = boardTheme || 'classic';
    createFrameTexture(isFlipped, currentTheme).then((frameTex) => {
      if (destroyed) return;
      const frameGeo = new THREE.BoxGeometry(TOTAL_WIDTH, BOARD_THICKNESS, TOTAL_WIDTH);
      
      // Ustki yuza: oq turnir hoshiyasi va koordinatalar
      const topMat = new THREE.MeshStandardMaterial({
        map: frameTex,
        roughness: 0.28,
        metalness: 0.0,
        color: 0xffffff,
      });
      // 4 ta yon tomon va osti: sayqallangan to'q mahogani yog'och plitasi
      const sideMat = new THREE.MeshStandardMaterial({
        color: 0x3d1808,
        roughness: 0.42,
        metalness: 0.05,
      });

      // BoxGeometry 6 ta yuzasi: [+X, -X, +Y (tepa), -Y (osti), +Z, -Z]
      const materials = [sideMat, sideMat, topMat, sideMat, sideMat, sideMat];
      const frameMesh = new THREE.Mesh(frameGeo, materials);
      frameMesh.position.y = -BOARD_THICKNESS / 2;
      frameMesh.castShadow = true;
      frameMesh.receiveShadow = true;
      scene.add(frameMesh);
      frameMeshRef.current = frameMesh;
    });

    // ── 10x10 KVADRATLAR ──
    const textureLoader = new THREE.TextureLoader();
    let initLightTex = '/textures/classic_light_square.jpg';
    let initDarkTex = '/textures/classic_dark_square.jpg';
    if (currentTheme === 'wood') {
      initLightTex = '/textures/wood_light_square.jpg';
      initDarkTex = '/textures/wood_dark_square.jpg';
    }

    const lightTex = textureLoader.load(initLightTex);
    lightTex.colorSpace = THREE.SRGBColorSpace;
    const darkTex = textureLoader.load(initDarkTex);
    darkTex.colorSpace = THREE.SRGBColorSpace;

    const lightMat = new THREE.MeshStandardMaterial({
      map: lightTex,
      roughness: 0.30,
      metalness: 0.02,
      color: 0xffffff,
    });
    const darkMat = new THREE.MeshStandardMaterial({
      map: darkTex,
      roughness: 0.28,
      metalness: 0.02,
      color: 0xffffff,
    });

    // Kataklar orasida 0.6% nozik mikrotirqish: haqiqiy yog'och plitka qirrasini beradi
    const sqGeo = new THREE.BoxGeometry(SQ_SIZE * 0.994, 0.035, SQ_SIZE * 0.994);
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

    // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 3D OLD QIRRA PLINTUSI (Doskaning old tomoniga biriktirilgan) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
    const initialRimTex = createRimTexture(frontRimTitle || 'NUR SHAXMAT 100', frontRimMoveText || '');
    const rimGeo = new THREE.BoxGeometry(TOTAL_WIDTH, 0.34, 0.10);
    const rimMat = new THREE.MeshStandardMaterial({ map: initialRimTex, roughness: 0.80, metalness: 0.0 });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.set(0, -BOARD_THICKNESS / 2 - 0.02, TOTAL_WIDTH / 2 + 0.05);
    rimMesh.rotation.x = -0.22; // Kameraga qarab sal burchak ostida qiya
    // rimMesh olib tashlandi: haqiqiy shaxmat doskasida oldida bufer plastinka bo'lmaydi
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
          updateCameraForAspect(w, h);
          rendererRef.current.setSize(w, h, false);
          if (canvasRef.current) {
            canvasRef.current.style.width = "100%";
            canvasRef.current.style.height = "100%";
          }
        }
      }
    });
    resizeObserver.observe(container);

    // Telifon ekrani burilganda (Samsung, Redmi, Honor va boshqalar) darhol kamerani tekislash
    const handleOrientationChange = () => {
      const recompute = () => {
        if (!container || !cameraRef.current || !rendererRef.current) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        if (w > 0 && h > 0) {
          updateCameraForAspect(w, h);
          rendererRef.current.setSize(w, h, false);
          if (canvasRef.current) {
            canvasRef.current.style.width = "100%";
            canvasRef.current.style.height = "100%";
          }
        }
      };
      recompute();
      setTimeout(recompute, 80);
      setTimeout(recompute, 280);
    };
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    // WebGL Context Lost / Restored boshqaruvi (Telifon ekrani o'chib-yoqilganda qotmasligi uchun)
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
    const handleContextRestored = () => {
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
      renderer.dispose();
      updateCameraRef.current = null;
    };
  }, [createFrameTexture, createRimTexture]);

  // Cinema Mode o'zgarganda darhol kamerani yangilash
  useEffect(() => {
    if (containerRef.current && updateCameraRef.current) {
      updateCameraRef.current(containerRef.current.clientWidth, containerRef.current.clientHeight);
    }
  }, [cinemaMode]);

  // isFlipped o'zgarganda ramka koordinata teksturasini yangilash
  useEffect(() => {
    if (!frameMeshRef.current) return;
    const currentTheme = boardTheme || 'classic';
    createFrameTexture(isFlipped, currentTheme).then((newTex) => {
      if (frameMeshRef.current) {
        const mat = frameMeshRef.current.material;
        if (Array.isArray(mat)) {
          // mat[2] is the +Y top face
          (mat[2] as THREE.MeshStandardMaterial).map = newTex;
          (mat[2] as THREE.MeshStandardMaterial).needsUpdate = true;
        } else {
          (mat as THREE.MeshStandardMaterial).map = newTex;
          (mat as THREE.MeshStandardMaterial).needsUpdate = true;
        }
      }
    });

    const textureLoader = new THREE.TextureLoader();
    let newLightMat: THREE.Material;
    let newDarkMat: THREE.Material;

    if (currentTheme === 'classic') {
      const lightTex = textureLoader.load('/textures/classic_light_square.jpg');
      lightTex.colorSpace = THREE.SRGBColorSpace;
      const darkTex = textureLoader.load('/textures/classic_dark_square.jpg');
      darkTex.colorSpace = THREE.SRGBColorSpace;
      newLightMat = new THREE.MeshStandardMaterial({ map: lightTex, roughness: 0.35, metalness: 0.05 });
      newDarkMat = new THREE.MeshStandardMaterial({ map: darkTex, roughness: 0.35, metalness: 0.05 });
    } else if (currentTheme === 'wood') {
      const lightTex = textureLoader.load('/textures/wood_light_square.jpg');
      lightTex.colorSpace = THREE.SRGBColorSpace;
      const darkTex = textureLoader.load('/textures/wood_dark_square.jpg');
      darkTex.colorSpace = THREE.SRGBColorSpace;
      newLightMat = new THREE.MeshStandardMaterial({ map: lightTex, roughness: 0.35, metalness: 0.05 });
      newDarkMat = new THREE.MeshStandardMaterial({ map: darkTex, roughness: 0.35, metalness: 0.05 });
    } else if (currentTheme === 'emerald') {
      newLightMat = new THREE.MeshStandardMaterial({ color: 0xdce6cd, roughness: 0.35, metalness: 0.05 });
      newDarkMat = new THREE.MeshStandardMaterial({ color: 0x557d38, roughness: 0.35, metalness: 0.05 });
    } else if (currentTheme === 'azure') {
      newLightMat = new THREE.MeshStandardMaterial({ color: 0xd0e0f2, roughness: 0.35, metalness: 0.05 });
      newDarkMat = new THREE.MeshStandardMaterial({ color: 0x385c88, roughness: 0.35, metalness: 0.05 });
    } else {
      newLightMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.35, metalness: 0.05 });
      newDarkMat = new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.35, metalness: 0.05 });
    }

    squareMeshesRef.current.forEach((sq, idx) => {
      const r = Math.floor(idx / 10);
      const f = idx % 10;
      const isLight = (r + f) % 2 !== 0;
      sq.material = isLight ? newLightMat : newDarkMat;
    });
  }, [isFlipped, boardTheme, createFrameTexture]);

  // Old qirra plintusi matnini yangilash
  useEffect(() => {
    if (!rimMeshRef.current) return;
    const newTex = createRimTexture(frontRimTitle || 'NUR SHAXMAT 100', frontRimMoveText || '');
    (rimMeshRef.current.material as THREE.MeshStandardMaterial).map = newTex;
    (rimMeshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true;
  }, [frontRimTitle, frontRimMoveText, createRimTexture]);

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ DONALAR VA BELGILARNI YANGILASH (Game State o'zgarganda) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !isLoaded) return;

    const board = game.board;
    const flipped = isFlipped;
    const pieceMeshesMap = pieceMeshesMapRef.current;
    const currentPieceIds = new Set<string>();

    // Shohlar uchun 2 tarafga ham hashamatli sarg'ish-tillarang toj materiali
    const goldCrownMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xf8be1a),
      roughness: 0.20,
      metalness: 0.88,
    });

    // Oq donalar: toza, yorqin va och fil suyagi oqi (luminous ivory white)
    const whiteMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xfcfaf7),
      roughness: 0.12,
      metalness: 0.02,
    });
    // Qora donalar: ochroq to'q grafit/ebonit (tafsilotlari aniq ko'rinishi uchun),
    // va sal yaltiroq laklangan silliq jilo (roughness: 0.08)
    const blackMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x383432),
      roughness: 0.08,
      metalness: 0.06,
    });

    // Nur donasi uchun maxsus mustaqil kontrast materiallar (o'yin boshlanganda yo'qolib ketmaydi)
    const nurWhiteMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xfefefe),
      roughness: 0.10,
      metalness: 0.05,
    });
    const nurBlackMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x111113),
      roughness: 0.12,
      metalness: 0.15,
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

          // Shohga 2 tarafga ham sarg'ish-tillarang Oliy Toj taqish (White & Black Kings)
          if (typeKey === 'king') {
            const crown = createKingCrown(goldCrownMat, piece.id);
            meshGroup.add(crown);
          }

          // Vazirga (Queen) 4 qirrali piramida romb (4 ta oq fasetka, qora ko'paytiruv 'X' qirralar, uchida qoracha)
          if (typeKey === 'queen') {
            const queenDiamond = createQueenDiamond(isWhite, piece.id, nurWhiteMat, nurBlackMat);
            meshGroup.add(queenDiamond);
          }

          // Nur figurasiga tepasidagi kesilgan '+' (Oq Nurda qora +, Qora Nurda oq +)
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

          // Material yangilanganligini kafolatlash
          const isWhite = piece.color === 'white';
          const mat = isWhite ? whiteMat : blackMat;
          meshGroup.traverse((ch: any) => {
            if (ch.isMesh && !ch.userData?.isCrown && !ch.userData?.isNurEmblem && !ch.userData?.isQueenDiamond && ch.material !== mat) {
              ch.material = mat;
            }
          });
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

    // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ HIGHLIGHTS: Tanlangan, So'nggi yurish va Mumkin bo'lgan harakatlar ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
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

      // 4. Shoh xavf ostida (Check) bo'lsa ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Shoh tagida qizil nurlanish
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

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ KVADRATNI ANIQLASH (3D Dona Mesh'lari va Kataklar bo'yicha 100% ANIQ) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
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

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ KVADRATNI BOSISH (Click-To-Move ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Mutlaqo Barqaror) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
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

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ FOYDALANUVCHI INTERAKTIV HARAKATLARI (Pointer Down / Move / Up) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
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
        className="w-full h-full block cursor-pointer select-none touch-none bg-transparent" style={{ width: "100%", height: "100%", display: "block" }}
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
