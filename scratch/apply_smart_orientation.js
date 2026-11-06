import fs from 'fs';

// 1. AndroidManifest.xml: change to fullSensor so runtime setRequestedOrientation controls it dynamically
let manifest = fs.readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');
manifest = manifest.replace('android:screenOrientation="sensorLandscape"', 'android:screenOrientation="fullSensor"');
manifest = manifest.replace('android:screenOrientation="portrait"', 'android:screenOrientation="fullSensor"');
fs.writeFileSync('android/app/src/main/AndroidManifest.xml', manifest, 'utf8');
console.log('1. AndroidManifest updated: fullSensor');

// 2. MainActivity.java: start in portrait in onCreate, and setOrientation handles landscape/portrait
let mainAct = fs.readFileSync('android/app/src/main/java/com/nurchess100/app/MainActivity.java', 'utf8');
mainAct = mainAct.replace(
  'setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);',
  'setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT);'
);
fs.writeFileSync('android/app/src/main/java/com/nurchess100/app/MainActivity.java', mainAct, 'utf8');
console.log('2. MainActivity updated: starts in SENSOR_PORTRAIT');

// 3. public/manifest.json
let pwaManifest = fs.readFileSync('public/manifest.json', 'utf8');
pwaManifest = pwaManifest.replace('"orientation": "landscape"', '"orientation": "any"');
pwaManifest = pwaManifest.replace('"orientation": "portrait"', '"orientation": "any"');
fs.writeFileSync('public/manifest.json', pwaManifest, 'utf8');
console.log('3. public/manifest.json updated: orientation any');

// 4. src/App.tsx: add dynamic orientation controller
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');
if (!appTsx.includes('Dinamik Ekran Yo\'nalishi')) {
  const marker = 'const [incomingInvite, setIncomingInvite] = useState<GameInvitePayload | null>(null);';
  const orientationCode = `const [incomingInvite, setIncomingInvite] = useState<GameInvitePayload | null>(null);

  // Dinamik Ekran Yo'nalishi:
  // Hamma joy (Bosh sahifa, Sozlamalar, Qoidalar, Profil, Peshqadamlar, Modallar) — TIK (PORTRAIT).
  // Faqat 3D o'yin tanlanganda va o'yin ichiga kirilganda — YONBOSH (LANDSCAPE 3D).
  useEffect(() => {
    const is3DGame = currentScreen === 'game' && state.is3D;
    const target = is3DGame ? 'landscape' : 'portrait';

    try {
      const bridge = (window as any).AndroidBridge || (window as any).Android;
      if (bridge?.setOrientation) {
        bridge.setOrientation(target);
      }
    } catch {}

    try {
      if (screen.orientation && (screen.orientation as any).lock) {
        (screen.orientation as any).lock(target).catch(() => {});
      }
    } catch {}
  }, [currentScreen, state.is3D]);`;

  appTsx = appTsx.replace(marker, orientationCode);
  fs.writeFileSync('src/App.tsx', appTsx, 'utf8');
  console.log('4. src/App.tsx updated: dynamic orientation hook added');
}

// 5. Version bumps
let homeScreen = fs.readFileSync('src/screens/HomeScreen.tsx', 'utf8');
homeScreen = homeScreen.replace(/V1\.\d+\.\d+ • OʻZBEK SHAXMATI \(10X10\)/g, 'V1.2.18 • OʻZBEK SHAXMATI (10X10)');
fs.writeFileSync('src/screens/HomeScreen.tsx', homeScreen, 'utf8');
console.log('5. src/screens/HomeScreen.tsx updated: V1.2.18');

let settingsScreen = fs.readFileSync('src/screens/SettingsScreen.tsx', 'utf8');
settingsScreen = settingsScreen.replace(/Nur Shaxmat 100 • v\d+\.\d+\.\d+/g, 'Nur Shaxmat 100 • v1.2.18');
fs.writeFileSync('src/screens/SettingsScreen.tsx', settingsScreen, 'utf8');
console.log('6. src/screens/SettingsScreen.tsx updated: v1.2.18');

let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.version = '1.2.18';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('7. package.json updated: 1.2.18');

let gradle = fs.readFileSync('android/app/build.gradle', 'utf8');
gradle = gradle.replace(/versionCode \d+/g, 'versionCode 39');
gradle = gradle.replace(/versionName "[^"]+"/g, 'versionName "1.2.18"');
fs.writeFileSync('android/app/build.gradle', gradle, 'utf8');
console.log('8. android/app/build.gradle updated: versionCode 39, versionName 1.2.18');
