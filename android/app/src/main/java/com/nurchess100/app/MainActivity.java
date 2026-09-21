package com.nurchess100.app;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.JsResult;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class MainActivity extends AppCompatActivity {

    private WebView webView;

    public class AndroidBridge {
        @JavascriptInterface
        public int getAppVersionCode() {
            int liveCode = getSharedPreferences("app_live_update", MODE_PRIVATE).getInt("version_code", -1);
            if (liveCode > 0) return liveCode;
            try {
                PackageInfo pInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
                return pInfo.versionCode;
            } catch (Exception e) {
                return 1;
            }
        }

        @JavascriptInterface
        public String getAppVersionName() {
            String liveName = getSharedPreferences("app_live_update", MODE_PRIVATE).getString("version_name", null);
            if (liveName != null && !liveName.isEmpty()) return liveName;
            try {
                PackageInfo pInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
                return pInfo.versionName;
            } catch (Exception e) {
                return "1.0.0";
            }
        }

        /**
         * Jonli Yangilanish (Live OTA Update):
         * Yangi loyiha fayllari to'liq yuklab olinadi va APK o'rnatmasdan turib
         * darhol butun ilova yangi dizayn va kodlarga yangilanadi!
         */
        @JavascriptInterface
        public void downloadAndApplyLiveUpdate(String zipUrl, String versionName, int versionCode) {
            new Thread(() -> {
                try {
                    runOnUiThread(() -> {
                        Toast.makeText(MainActivity.this, "Yangi versiya yuklanmoqda...", Toast.LENGTH_SHORT).show();
                    });

                    URL url = new URL(zipUrl);
                    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android 10; Mobile)");
                    conn.setRequestProperty("Accept-Encoding", "identity");
                    conn.setInstanceFollowRedirects(true);
                    conn.setConnectTimeout(15000);
                    conn.setReadTimeout(30000);
                    conn.connect();

                    int respCode = conn.getResponseCode();
                    if (respCode == HttpURLConnection.HTTP_MOVED_PERM || respCode == HttpURLConnection.HTTP_MOVED_TEMP) {
                        String newUrl = conn.getHeaderField("Location");
                        conn.disconnect();
                        url = new URL(newUrl);
                        conn = (HttpURLConnection) url.openConnection();
                        conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android 10; Mobile)");
                        conn.setRequestProperty("Accept-Encoding", "identity");
                        conn.setConnectTimeout(15000);
                        conn.setReadTimeout(30000);
                        conn.connect();
                    }

                    File tempZip = new File(getCacheDir(), "update_bundle.zip");
                    try (InputStream in = new BufferedInputStream(conn.getInputStream());
                         FileOutputStream out = new FileOutputStream(tempZip)) {
                        byte[] buf = new byte[8192];
                        int len;
                        while ((len = in.read(buf)) != -1) {
                            out.write(buf, 0, len);
                        }
                        out.flush();
                    } finally {
                        conn.disconnect();
                    }

                    File liveDirNew = new File(getFilesDir(), "live_web_new");
                    if (liveDirNew.exists()) {
                        deleteRecursive(liveDirNew);
                    }
                    liveDirNew.mkdirs();

                    unzip(tempZip, liveDirNew);
                    tempZip.delete();

                    File finalDir = new File(getFilesDir(), "live_web");
                    File targetIndex = new File(liveDirNew, "index.html");
                    if (!targetIndex.exists()) {
                        File[] sub = liveDirNew.listFiles();
                        if (sub != null && sub.length == 1 && sub[0].isDirectory()) {
                            deleteRecursive(finalDir);
                            sub[0].renameTo(finalDir);
                            deleteRecursive(liveDirNew);
                        }
                    } else {
                        deleteRecursive(finalDir);
                        liveDirNew.renameTo(finalDir);
                    }

                    getSharedPreferences("app_live_update", MODE_PRIVATE)
                        .edit()
                        .putString("version_name", versionName)
                        .putInt("version_code", versionCode)
                        .apply();

                    runOnUiThread(() -> {
                        Toast.makeText(MainActivity.this, "Yangilanish muvaffaqiyatli o'rnatildi! Qayta yuklanmoqda...", Toast.LENGTH_SHORT).show();
                        if (webView != null) {
                            webView.reload();
                        }
                    });
                } catch (Exception e) {
                    Log.e("NurChess", "Live update failed", e);
                    runOnUiThread(() -> {
                        Toast.makeText(MainActivity.this, "Jonli yangilanish o'rniga to'liq APK yuklanmoqda...", Toast.LENGTH_SHORT).show();
                        downloadAndInstallApk("https://files.catbox.moe/hcgs56.apk");
                    });
                }
            }).start();
        }

        @JavascriptInterface
        public void downloadAndInstallApk(String url) {
            try {
                android.app.DownloadManager.Request request = new android.app.DownloadManager.Request(Uri.parse(url));
                request.setTitle("Nur Chess 100 Yangilanishi");
                request.setDescription("Yangi versiya yuklab olinmoqda...");
                request.setNotificationVisibility(android.app.DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                request.setDestinationInExternalPublicDir(android.os.Environment.DIRECTORY_DOWNLOADS, "NurChess100.apk");
                request.setMimeType("application/vnd.android.package-archive");

                android.app.DownloadManager manager = (android.app.DownloadManager) getSystemService(android.content.Context.DOWNLOAD_SERVICE);
                if (manager != null) {
                    manager.enqueue(request);
                    runOnUiThread(() -> {
                        Toast.makeText(MainActivity.this, "Yangilanish yuklanmoqda... Bildirishnomalar panelini ko'ring", android.widget.Toast.LENGTH_LONG).show();
                    });
                    return;
                }
            } catch (Exception e) {
                Log.w("NurChess", "DownloadManager failed, falling back to browser intent", e);
            }
            try {
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(intent);
            } catch (Exception e) {
                Log.e("NurChess", "Failed to launch intent for url: " + url, e);
            }
        }
    }

    private static void unzip(File zipFile, File targetDirectory) throws IOException {
        try (ZipInputStream zis = new ZipInputStream(new BufferedInputStream(new FileInputStream(zipFile)))) {
            ZipEntry ze;
            byte[] buffer = new byte[8192];
            while ((ze = zis.getNextEntry()) != null) {
                File file = new File(targetDirectory, ze.getName());
                String canonicalDest = targetDirectory.getCanonicalPath();
                String canonicalPath = file.getCanonicalPath();
                if (!canonicalPath.startsWith(canonicalDest + File.separator) && !canonicalPath.equals(canonicalDest)) {
                    throw new SecurityException("Zip traversal error: " + ze.getName());
                }

                if (ze.isDirectory()) {
                    file.mkdirs();
                } else {
                    File parent = file.getParentFile();
                    if (parent != null) parent.mkdirs();
                    try (FileOutputStream fos = new FileOutputStream(file)) {
                        int count;
                        while ((count = zis.read(buffer)) != -1) {
                            fos.write(buffer, 0, count);
                        }
                    }
                }
            }
        }
    }

    private static void deleteRecursive(File f) {
        if (f.isDirectory()) {
            File[] children = f.listFiles();
            if (children != null) {
                for (File c : children) deleteRecursive(c);
            }
        }
        f.delete();
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // To'liq ekranli o'yin rejimi (Immersive Sticky - brauzerga o'xshamaydi, sof mobil o'yin)
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );
        getWindow().setFlags(
                android.view.WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
                android.view.WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED
        );

        // Agar yangi APK o'rnatilgan bo'lsa (apkCode >= liveCode), eski live_web keshini tozalash
        int apkCode = 1;
        try {
            PackageInfo pInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
            apkCode = pInfo.versionCode;
        } catch (Exception ignored) {}

        int liveCode = getSharedPreferences("app_live_update", MODE_PRIVATE).getInt("version_code", -1);
        if (apkCode >= liveCode) {
            File liveDir = new File(getFilesDir(), "live_web");
            if (liveDir.exists()) {
                deleteRecursive(liveDir);
            }
            getSharedPreferences("app_live_update", MODE_PRIVATE)
                .edit()
                .remove("version_code")
                .remove("version_name")
                .apply();
        }

        webView = new WebView(this);
        // GPU apparat tezlatkichini qat'iy yoqish (3D animatsiya va silliq harakat uchun)
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setOnLongClickListener(v -> true);
        webView.setHapticFeedbackEnabled(true);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Javascript Bridge ulash
        webView.addJavascriptInterface(new AndroidBridge(), "AndroidBridge");

        // Fayl yuklab olish (APK yoki boshqa fayllar)
        webView.setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
            try {
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(intent);
            } catch (Exception e) {
                Log.e("NurChess", "DownloadListener error", e);
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage cm) {
                Log.d("NurChess", cm.message() + " -- Line " + cm.lineNumber() + " of " + cm.sourceId());
                return true;
            }

            @Override
            public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
                result.confirm();
                return true;
            }

            @Override
            public boolean onJsConfirm(WebView view, String url, String message, JsResult result) {
                result.confirm();
                return true;
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.endsWith(".apk") || (!url.startsWith("https://appassets.androidplatform.net") && !url.contains("supabase.co/realtime"))) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, request.getUrl());
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        Log.e("NurChess", "Override url error", e);
                    }
                }
                return false;
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return handleRequest(request.getUrl());
            }

            @Override
            @SuppressWarnings("deprecation")
            public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
                return handleRequest(Uri.parse(url));
            }

            private WebResourceResponse handleRequest(Uri uri) {
                if (uri == null) return null;
                String path = uri.getPath();
                if (path == null || path.isEmpty() || path.equals("/")) {
                    path = "index.html";
                }
                while (path.startsWith("/")) {
                    path = path.substring(1);
                }

                InputStream is = null;
                // 1. Avval jonli yuklab olingan fayllardan (live_web) tekshirish
                File liveDir = new File(getFilesDir(), "live_web");
                File liveFile = new File(liveDir, path);
                if (liveFile.exists() && liveFile.isFile()) {
                    try {
                        is = new FileInputStream(liveFile);
                    } catch (Exception ignored) {}
                }

                // 2. Agar live_web'da bo'lmasa, APK assets'dan olish (avval web/, keyin ildiz)
                if (is == null) {
                    try {
                        is = getAssets().open("web/" + path);
                    } catch (IOException e1) {
                        try {
                            is = getAssets().open(path);
                        } catch (IOException e2) {
                            Log.w("NurChess", "Asset not found: " + path);
                            return null;
                        }
                    }
                }

                String mime = "application/octet-stream";
                if (path.endsWith(".html")) mime = "text/html";
                else if (path.endsWith(".js") || path.endsWith(".mjs")) mime = "application/javascript";
                else if (path.endsWith(".css")) mime = "text/css";
                else if (path.endsWith(".svg")) mime = "image/svg+xml";
                else if (path.endsWith(".png")) mime = "image/png";
                else if (path.endsWith(".jpg") || path.endsWith(".jpeg")) mime = "image/jpeg";
                else if (path.endsWith(".json")) mime = "application/json";
                else if (path.endsWith(".mp3")) mime = "audio/mpeg";
                else if (path.endsWith(".glb")) mime = "model/gltf-binary";
                else if (path.endsWith(".gltf")) mime = "model/gltf+json";
                else if (path.endsWith(".woff2")) mime = "font/woff2";
                else if (path.endsWith(".woff")) mime = "font/woff";

                Map<String, String> headers = new HashMap<>();
                headers.put("Access-Control-Allow-Origin", "*");
                headers.put("Cache-Control", "public, max-age=31536000, immutable");
                return new WebResourceResponse(mime, "UTF-8", 200, "OK", headers, is);
            }
        });

        // Boshlang'ich sahifani yuklash
        webView.loadUrl("https://appassets.androidplatform.net/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView != null) {
            webView.evaluateJavascript(
                    "(function() { if (window.__onAndroidBack) { return window.__onAndroidBack(); } return false; })()",
                    value -> {
                        if ("false".equals(value) || value == null || "null".equals(value)) {
                            MainActivity.super.onBackPressed();
                        }
                    }
            );
        } else {
            super.onBackPressed();
        }
    }
}
