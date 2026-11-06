import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\5cc1e400-cf8b-48fc-acb3-fe7ff4c64517';
const tempProfile = path.join(outDir, 'scratch', 'chrome_temp_v1217');

function capture(name, windowSize, urlSuffix) {
  return new Promise((resolve) => {
    const outPath = path.join(outDir, `${name}.png`);
    const args = [
      '--headless',
      `--user-data-dir=${tempProfile}`,
      '--disk-cache-size=1',
      '--use-gl=angle',
      '--use-angle=d3d11',
      '--enable-webgl',
      `--screenshot=${outPath}`,
      `--window-size=${windowSize}`,
      '--hide-scrollbars',
      '--virtual-time-budget=2500',
      `http://127.0.0.1:5174/${urlSuffix}&nocache=${Date.now()}`
    ];
    execFile(chromePath, args, (err) => {
      if (err) console.error(err);
      else if (fs.existsSync(outPath)) console.log(`Saved ${name}: ${fs.statSync(outPath).size} bytes`);
      resolve();
    });
  });
}

async function run() {
  await capture('screen_menu_landscape', '915,412', '?screen=game&modal=menu');
  await capture('screen_menu_portrait', '412,915', '?screen=game&modal=menu');
  console.log('Capture menu complete!');
}

run();
