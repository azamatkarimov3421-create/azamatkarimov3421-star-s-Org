import fs from 'fs';

let content = fs.readFileSync('android/app/src/main/java/com/nurchess100/app/MainActivity.java', 'utf8');
const target = 'super.onCreate(savedInstanceState);';
const replacement = 'super.onCreate(savedInstanceState);\n        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);';

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('android/app/src/main/java/com/nurchess100/app/MainActivity.java', content, 'utf8');
  console.log('Added setRequestedOrientation in onCreate!');
} else {
  console.log('super.onCreate not found');
}
