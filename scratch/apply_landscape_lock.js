import fs from 'fs';

// 1. AndroidManifest.xml
let manifest = fs.readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');
manifest = manifest.replace('android:screenOrientation="fullSensor"', 'android:screenOrientation="sensorLandscape"');
fs.writeFileSync('android/app/src/main/AndroidManifest.xml', manifest, 'utf8');
console.log('1. AndroidManifest updated: sensorLandscape');

// 2. MainActivity.java
let mainAct = fs.readFileSync('android/app/src/main/java/com/nurchess100/app/MainActivity.java', 'utf8');
if (!mainAct.includes('setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);')) {
  mainAct = mainAct.replace(
    'super.onCreate(savedInstanceState);',
    'super.onCreate(savedInstanceState);\n        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);'
  );
}
mainAct = mainAct.replace(
  /public void toggleOrientation\(\) \{[\s\S]*?\}\s*\}\);/m,
  'public void toggleOrientation() {\n            runOnUiThread(() -> {\n                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);\n            });\n        }'
);
fs.writeFileSync('android/app/src/main/java/com/nurchess100/app/MainActivity.java', mainAct, 'utf8');
console.log('2. MainActivity updated: setRequestedOrientation to sensorLandscape');

// 3. public/manifest.json
let pwaManifest = fs.readFileSync('public/manifest.json', 'utf8');
pwaManifest = pwaManifest.replace('"orientation": "portrait"', '"orientation": "landscape"');
fs.writeFileSync('public/manifest.json', pwaManifest, 'utf8');
console.log('3. public/manifest.json updated: orientation landscape');

// 4. src/store/gameStore.tsx
let gameStore = fs.readFileSync('src/store/gameStore.tsx', 'utf8');
gameStore = gameStore.replace(
  /const saved = localStorage\.getItem\('nur_chess_3d_v3'\);[\s\S]*?return false;\s*\}\s*\}\)\(\),/,
  `const saved = localStorage.getItem('nur_chess_3d_v4');
        if (saved !== null) {
          return saved === 'true';
        }
        localStorage.setItem('nur_chess_3d_v4', 'true');
        return true;
      } catch {
        return true;
      }
    })(),`
);
gameStore = gameStore.replace(
  /case 'TOGGLE_3D': \{[\s\S]*?return \{ \.\.\.state, is3D: next \};/m,
  `case 'TOGGLE_3D': {
      const next = !state.is3D;
      try {
        localStorage.setItem('nur_chess_3d_v4', String(next));
        localStorage.setItem('nur_chess_3d_v3', String(next));
        localStorage.setItem('nur_chess_3d', String(next));
      } catch {}
      return { ...state, is3D: next };`
);
gameStore = gameStore.replace(
  /case 'SET_3D': \{[\s\S]*?return \{ \.\.\.state, is3D: action\.enabled \};/m,
  `case 'SET_3D': {
      try {
        localStorage.setItem('nur_chess_3d_v4', String(action.enabled));
        localStorage.setItem('nur_chess_3d_v3', String(action.enabled));
        localStorage.setItem('nur_chess_3d', String(action.enabled));
      } catch {}
      return { ...state, is3D: action.enabled };`
);
fs.writeFileSync('src/store/gameStore.tsx', gameStore, 'utf8');
console.log('4. src/store/gameStore.tsx updated: default is3D is true');

// 5. src/screens/GameScreen.tsx
let gameScreen = fs.readFileSync('src/screens/GameScreen.tsx', 'utf8');
gameScreen = gameScreen.replace(
  /\/\/ Ekranni 90° burish[\s\S]*?setSideNotice\(null\), 2500\);\s*\}, \[\]\);/m,
  '// Orientation is strictly locked to landscape for all phones'
);
gameScreen = gameScreen.replace(
  /\{\/\* Ekranni burish \(Tik ⇄ Yonbosh \/ Orientation\) \*\/\}[\s\S]*?<\/button>\s*/m,
  ''
);
fs.writeFileSync('src/screens/GameScreen.tsx', gameScreen, 'utf8');
console.log('5. src/screens/GameScreen.tsx updated: removed YONBOSH toggle button');

// 6. src/screens/HomeScreen.tsx
let homeScreen = fs.readFileSync('src/screens/HomeScreen.tsx', 'utf8');
homeScreen = homeScreen.replace(/V1\.1\.3 • OʻZBEK SHAXMATI \(10X10\)/g, 'V1.2.17 • OʻZBEK SHAXMATI (10X10)');
fs.writeFileSync('src/screens/HomeScreen.tsx', homeScreen, 'utf8');
console.log('6. src/screens/HomeScreen.tsx updated: V1.2.17');

// 7. src/screens/SettingsScreen.tsx
let settingsScreen = fs.readFileSync('src/screens/SettingsScreen.tsx', 'utf8');
settingsScreen = settingsScreen.replace(/Nur Shaxmat 100 • v1\.1\.4/g, 'Nur Shaxmat 100 • v1.2.17');
fs.writeFileSync('src/screens/SettingsScreen.tsx', settingsScreen, 'utf8');
console.log('7. src/screens/SettingsScreen.tsx updated: v1.2.17');

// 8. package.json
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.version = '1.2.17';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('8. package.json updated: 1.2.17');

// 9. android/app/build.gradle
let gradle = fs.readFileSync('android/app/build.gradle', 'utf8');
gradle = gradle.replace(/versionCode \d+/g, 'versionCode 38');
gradle = gradle.replace(/versionName "[^"]+"/g, 'versionName "1.2.17"');
fs.writeFileSync('android/app/build.gradle', gradle, 'utf8');
console.log('9. android/app/build.gradle updated: versionCode 38, versionName 1.2.17');
