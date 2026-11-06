import fs from 'fs';

let content = fs.readFileSync('android/app/src/main/java/com/nurchess100/app/MainActivity.java', 'utf8');

const badBlock = `        @JavascriptInterface
        public void setOrientation(String orientation) {
            runOnUiThread(() -> {
                if ("landscape".equalsIgnoreCase(orientation)) {
                    setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
                } else if ("portrait".equalsIgnoreCase(orientation)) {
                    setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT);
                } else {
                    setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_USER);
                }
            });
        }

        @JavascriptInterface
        public void toggleOrientation() {
            runOnUiThread(() -> {
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
            });
        }
        }`;

const goodBlock = `        @JavascriptInterface
        public void setOrientation(String orientation) {
            runOnUiThread(() -> {
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
            });
        }

        @JavascriptInterface
        public void toggleOrientation() {
            runOnUiThread(() -> {
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
            });
        }`;

// Normalize line endings before replacing
const normContent = content.replace(/\r\n/g, '\n');
const normBad = badBlock.replace(/\r\n/g, '\n');
const normGood = goodBlock.replace(/\r\n/g, '\n');

if (normContent.includes(normBad)) {
  const result = normContent.replace(normBad, normGood);
  fs.writeFileSync('android/app/src/main/java/com/nurchess100/app/MainActivity.java', result, 'utf8');
  console.log('Successfully fixed MainActivity.java!');
} else {
  console.log('Target bad block not found in MainActivity.java');
}
