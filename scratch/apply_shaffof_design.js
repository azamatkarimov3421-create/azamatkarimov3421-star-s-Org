import fs from 'fs';

console.log('--- Applying Shaffof (Glassmorphism) Design ---');

// 1. src/index.css: Add glassmorphism classes
let indexCss = fs.readFileSync('src/index.css', 'utf8');
if (!indexCss.includes('.glass-card')) {
  const glassStyles = `
/* ── SHAFFOF (GLASSMORPHISM) MAXSUS STIL QOIDALARI ── */
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

.glass-card-hover {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.glass-card-hover:hover {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.5);
  transform: translateY(-2px);
}

.glass-modal {
  background: rgba(12, 14, 13, 0.75);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 24px 64px 0 rgba(0, 0, 0, 0.85);
}

.glass-btn {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.glass-btn:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.28);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.45);
}
`;
  indexCss += '\n' + glassStyles;
  fs.writeFileSync('src/index.css', indexCss, 'utf8');
  console.log('1. src/index.css updated with glassmorphism classes');
}

// 2. src/App.tsx: add ambient chess wallpaper to root container
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');
const oldAppBg = "min-h-screen ${isLight ? 'bg-[#f4f1ea] text-[#1f1d1a]' : 'bg-[#181614] text-[#f1f1f1]'} flex flex-col font-sans select-none transition-colors duration-200";
const newAppBg = "min-h-screen ${isLight ? 'bg-[#f4f1ea] bg-[url(\"/desktop-bg-light.jpg\")] text-[#1f1d1a]' : 'bg-[#0a0e0c] bg-[url(\"/desktop-bg.jpg\")] text-[#f1f1f1]'} bg-cover bg-center bg-fixed flex flex-col font-sans select-none relative transition-colors duration-200";

if (appTsx.includes(oldAppBg)) {
  appTsx = appTsx.replace(oldAppBg, newAppBg);
  // Also add vignette overlay right after
  appTsx = appTsx.replace(
    /\{\/\* ── 1\. ASOSIY EKRAN ROUTER/m,
    `{/* Shaffoflik uchun mayin fon vinetkasi */}\n      <div className={\`fixed inset-0 pointer-events-none z-0 \${isLight ? 'bg-gradient-to-b from-white/75 via-white/55 to-white/80' : 'bg-gradient-to-b from-black/65 via-black/45 to-black/80'}\`} />\n\n      {/* ── 1. ASOSIY EKRAN ROUTER`
  );
  fs.writeFileSync('src/App.tsx', appTsx, 'utf8');
  console.log('2. src/App.tsx updated with background and vignette overlay');
}

// 3. src/screens/HomeScreen.tsx: make cards transparent/frosted glass
let homeScreen = fs.readFileSync('src/screens/HomeScreen.tsx', 'utf8');

// Replace main container background to transparent
homeScreen = homeScreen.replace(
  /\$\{isLight \? 'bg-\[#f6f3ed\] md:bg-\[url\("\/desktop-bg-light\.jpg"\)\] text-\[#1a1917\]' : 'bg-\[#121614\] md:bg-\[url\("\/desktop-bg\.jpg"\)\] text-\[#f1f1f1\]'\} bg-cover bg-center bg-fixed/g,
  "${isLight ? 'bg-transparent text-[#1a1917]' : 'bg-transparent text-[#f1f1f1]'}"
);

// Header floating navbar
homeScreen = homeScreen.replace(
  /isLight\s*\?\s*'bg-white\/95 border-\[#e2ddd3\] shadow-\[0_4px_20px_rgba\(0,0,0,0\.05\)\]'\s*:\s*'bg-\[#141b17\]\/90 border-\[#27372d\] shadow-2xl'/g,
  "isLight ? 'bg-white/80 border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-2xl' : 'bg-white/[0.06] border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl'"
);

// Left Hero card ("Yangi O'yin Boshlash")
homeScreen = homeScreen.replace(
  /isLight\s*\?\s*'bg-white\/95 border-\[#e2ddd3\] shadow-\[0_8px_30px_rgba\(0,0,0,0\.06\)\]'\s*:\s*'bg-\[#141b17\]\/95 border-\[#27372d\] shadow-2xl'/g,
  "isLight ? 'bg-white/80 border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-2xl' : 'bg-white/[0.05] border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl'"
);

// 3D & 2D cards inactive states
homeScreen = homeScreen.replace(
  /: isLight\s*\?\s*'border-\[#e2ddd3\] bg-zinc-50 hover:border-zinc-300'\s*:\s*'border-\[#27372d\] bg-\[#141b17\] hover:border-\[#384f3f\]'/g,
  ": isLight ? 'border-white/40 bg-white/40 hover:bg-white/70' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20'"
);

// Color chips inactive states
homeScreen = homeScreen.replace(
  /: isLight\s*\?\s*'bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300'\s*:\s*'bg-\[#141b17\] border-\[#27372d\] text-zinc-400 hover:border-\[#384f3f\]'/g,
  ": isLight ? 'bg-white/50 border-white/60 text-zinc-600 hover:bg-white/80' : 'bg-white/[0.04] border-white/10 text-zinc-300 hover:bg-white/[0.08] hover:border-white/20'"
);

// Game modes right list cards
homeScreen = homeScreen.replace(
  /isLight\s*\?\s*'bg-white\/95 hover:bg-zinc-50 border-\[#e2ddd3\] hover:border-emerald-500\/60 shadow-\[0_4px_16px_rgba\(0,0,0,0\.04\)\]'\s*:\s*'bg-\[#141b17\]\/95 hover:bg-\[#18221c\] border-\[#27372d\] hover:border-\[#22c55e\]\/50 shadow-xl'/g,
  "isLight ? 'bg-white/75 hover:bg-white/95 border-white/60 hover:border-emerald-500/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-xl' : 'bg-white/[0.05] hover:bg-white/[0.09] border-white/10 hover:border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl'"
);

// Version bump to 1.2.19
homeScreen = homeScreen.replace(/V1\.\d+\.\d+ • OʻZBEK SHAXMATI \(10X10\)/g, 'V1.2.19 • OʻZBEK SHAXMATI (10X10)');
fs.writeFileSync('src/screens/HomeScreen.tsx', homeScreen, 'utf8');
console.log('3. src/screens/HomeScreen.tsx updated to shaffof glassmorphism');

// 4. src/components/BottomNavBar.tsx: frosted glass bar
let bottomNav = fs.readFileSync('src/components/BottomNavBar.tsx', 'utf8');
bottomNav = bottomNav.replace(
  /isLight\s*\?\s*'bg-white\/95 border-t border-\[#e2ddd3\] shadow-\[0_-4px_20px_rgba\(0,0,0,0\.06\)\]'\s*:\s*'bg-\[#21201d\]\/95 border-t border-\[#383531\] shadow-\[0_-4px_20px_rgba\(0,0,0,0\.5\)\]'/g,
  "isLight ? 'bg-white/80 border-t border-white/60 shadow-[0_-8px_32px_rgba(0,0,0,0.08)] backdrop-blur-2xl' : 'bg-black/45 border-t border-white/15 shadow-[0_-12px_40px_rgba(0,0,0,0.65)] backdrop-blur-2xl'"
);
fs.writeFileSync('src/components/BottomNavBar.tsx', bottomNav, 'utf8');
console.log('4. src/components/BottomNavBar.tsx updated to shaffof glass');

// 5. src/screens/GameScreen.tsx: floating buttons and menu modal glassmorphism
let gameScreen = fs.readFileSync('src/screens/GameScreen.tsx', 'utf8');

// Replace floating button backgrounds
gameScreen = gameScreen.replace(
  /bg-black\/65 hover:bg-black\/85 active:scale-95 border border-white\/20/g,
  'bg-white/[0.08] hover:bg-white/[0.18] active:scale-95 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-2xl'
);
gameScreen = gameScreen.replace(
  /bg-black\/65 hover:bg-black\/85 active:scale-95 border border-amber-500\/40 text-amber-300/g,
  'bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 border border-amber-400/40 text-amber-300 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-2xl'
);

// In-game menu modal background
gameScreen = gameScreen.replace(
  /bg-\[#1e1b18\]\/95 border border-\[#3e342a\] rounded-3xl p-3\.5 sm:p-5 landscape:p-3 shadow-2xl/g,
  'bg-black/60 backdrop-blur-3xl border border-white/15 rounded-3xl p-3.5 sm:p-5 landscape:p-3 shadow-[0_24px_70px_rgba(0,0,0,0.85)]'
);
gameScreen = gameScreen.replace(
  /bg-\[#141210\] px-3\.5 py-2\.5 rounded-2xl border border-\[#2e261f\]/g,
  'bg-white/[0.05] backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10'
);
gameScreen = gameScreen.replace(
  /bg-\[#141210\] p-3 rounded-2xl border border-\[#2e261f\]/g,
  'bg-white/[0.05] backdrop-blur-md p-3 rounded-2xl border border-white/10'
);
fs.writeFileSync('src/screens/GameScreen.tsx', gameScreen, 'utf8');
console.log('5. src/screens/GameScreen.tsx updated with glass floating buttons and modal');

// 6. src/screens/SettingsScreen.tsx
let settingsScreen = fs.readFileSync('src/screens/SettingsScreen.tsx', 'utf8');
settingsScreen = settingsScreen.replace(
  /const cardBg = isLight\s*\?\s*'bg-white\/95 border-\[#e2ddd3\] shadow-\[0_2px_8px_rgba\(0,0,0,0\.04\)\]'\s*:\s*'bg-\[#21201d\] border-\[#383531\] shadow-md';/g,
  "const cardBg = isLight ? 'bg-white/80 border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-2xl' : 'bg-white/[0.05] border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl';"
);
settingsScreen = settingsScreen.replace(/Nur Shaxmat 100 • v\d+\.\d+\.\d+/g, 'Nur Shaxmat 100 • v1.2.19');
fs.writeFileSync('src/screens/SettingsScreen.tsx', settingsScreen, 'utf8');
console.log('6. src/screens/SettingsScreen.tsx updated to shaffof cardBg');

// 7. Bump package.json and build.gradle to 1.2.19 (code 40)
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.version = '1.2.19';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n', 'utf8');

let gradle = fs.readFileSync('android/app/build.gradle', 'utf8');
gradle = gradle.replace(/versionCode \d+/g, 'versionCode 40');
gradle = gradle.replace(/versionName "[^"]+"/g, 'versionName "1.2.19"');
fs.writeFileSync('android/app/build.gradle', gradle, 'utf8');
console.log('7. Bumped version to 1.2.19 (code 40)');
