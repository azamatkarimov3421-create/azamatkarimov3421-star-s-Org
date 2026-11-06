import fs from 'fs';

let content = fs.readFileSync('android/app/src/main/java/com/nurchess100/app/MainActivity.java', 'utf8');

// Fix setOrientation
const badSetOrientation = `        @JavascriptInterface
        public void setOrientation(String orientation) {
            runOnUiThread(() -> {
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT);
            });
        }`;

const goodSetOrientation = `        @JavascriptInterface
        public void setOrientation(String orientation) {
            runOnUiThread(() -> {
                if ("landscape".equalsIgnoreCase(orientation)) {
                    setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
                } else {
                    setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT);
                }
            });
        }`;

content = content.replace(/\r\n/g, '\n');
content = content.replace(badSetOrientation.replace(/\r\n/g, '\n'), goodSetOrientation.replace(/\r\n/g, '\n'));

// Fix onCreate
const badOnCreate = `    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);`;

const goodOnCreate = `    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT);`;

content = content.replace(badOnCreate.replace(/\r\n/g, '\n'), goodOnCreate.replace(/\r\n/g, '\n'));

fs.writeFileSync('android/app/src/main/java/com/nurchess100/app/MainActivity.java', content, 'utf8');
console.log('Successfully fixed MainActivity setOrientation and onCreate!');
