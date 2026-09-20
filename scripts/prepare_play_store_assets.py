import os
import shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out_dir = os.path.join(base_dir, "play_store_assets")
os.makedirs(out_dir, exist_ok=True)

# 1. Generate 512x512 Google Play Store Icon
logo_path = os.path.join(base_dir, "public", "nur-chess-logo.png")
icon_512_path = os.path.join(out_dir, "play_store_icon_512x512.png")

if os.path.exists(logo_path):
    logo = Image.open(logo_path).convert("RGBA")
    # Google Play Store requires an opaque background (no transparency)
    icon_bg = Image.new("RGB", (512, 512), (22, 27, 34))
    
    # Scale logo cleanly to fit nicely inside 512x512 with safe padding (approx 440x440)
    target_size = 460
    logo_resized = logo.resize((target_size, target_size), Image.Resampling.LANCZOS)
    offset = ((512 - target_size) // 2, (512 - target_size) // 2)
    icon_bg.paste(logo_resized, offset, logo_resized)
    icon_bg.save(icon_512_path, "PNG", quality=100)
    print(f"[OK] Generated: {icon_512_path}")
else:
    print("[WARN] logo_path not found for 512 icon")

# 2. Generate 1024x500 Feature Graphic (Promo Banner)
feature_path = os.path.join(out_dir, "feature_graphic_1024x500.png")
feat_img = Image.new("RGB", (1024, 500), (15, 23, 42))
draw = ImageDraw.Draw(feat_img)

# Gradient background
for y in range(500):
    r = int(15 + (y / 500.0) * (30 - 15))
    g = int(23 + (y / 500.0) * (41 - 23))
    b = int(42 + (y / 500.0) * (59 - 42))
    draw.line([(0, y), (1024, y)], fill=(r, g, b))

# Decorative chess board pattern subtle grid on left/right
grid_size = 35
for gx in range(0, 1024, grid_size):
    for gy in range(0, 500, grid_size):
        if ((gx // grid_size) + (gy // grid_size)) % 2 == 0:
            # subtle overlay
            pass

# Place logo on the left or center
if os.path.exists(logo_path):
    logo = Image.open(logo_path).convert("RGBA")
    logo_size = 340
    logo_thumb = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    feat_img.paste(logo_thumb, (60, 80), logo_thumb)

# Load fonts (system fonts on Windows)
try:
    font_title = ImageFont.truetype("arialbd.ttf", 54)
    font_sub = ImageFont.truetype("arial.ttf", 26)
    font_badge = ImageFont.truetype("arialbd.ttf", 20)
    font_chips = ImageFont.truetype("arial.ttf", 18)
except Exception:
    font_title = ImageFont.load_default()
    font_sub = font_title
    font_badge = font_title
    font_chips = font_title

# Draw badge
draw.rounded_rectangle([(440, 100), (660, 136)], radius=8, fill=(245, 158, 11, 40), outline=(245, 158, 11), width=1)
draw.text((455, 106), "O'ZBEK SHAXMATI 10x10", fill=(245, 158, 11), font=font_badge)

# Draw Title
draw.text((440, 155), "NUR CHESS 100", fill=(255, 255, 255), font=font_title)

# Draw Subtitle
draw.text((440, 230), "Yangi donalar • 100 katak • 3D grafika", fill=(148, 163, 184), font=font_sub)

# Draw Chips (Feature highlights)
chips = [
    "★ Maxsus 'Nur' donasi",
    "★ 3 xil rokirovka",
    "★ Jonli onlayn & Botlar",
    "★ 2D / 3D interaktiv doska"
]
chip_y = 290
for chip in chips:
    draw.text((445, chip_y), chip, fill=(226, 232, 240), font=font_chips)
    chip_y += 32

feat_img.save(feature_path, "PNG", quality=95)
print(f"[OK] Generated: {feature_path}")

# 3. Copy binaries to play_store_assets and root
aab_src = os.path.join(base_dir, "android", "app", "build", "outputs", "bundle", "release", "app-release.aab")
apk_src = os.path.join(base_dir, "android", "app", "build", "outputs", "apk", "release", "app-release.apk")
keystore_src = os.path.join(base_dir, "android", "app", "nurchess100.keystore")

if os.path.exists(aab_src):
    shutil.copy2(aab_src, os.path.join(out_dir, "NurChess100.aab"))
    shutil.copy2(aab_src, os.path.join(base_dir, "NurChess100.aab"))
    print(f"[OK] Copied AAB ({os.path.getsize(aab_src)} bytes) to output and root")

if os.path.exists(apk_src):
    shutil.copy2(apk_src, os.path.join(out_dir, "NurChess100.apk"))
    shutil.copy2(apk_src, os.path.join(base_dir, "NurChess100.apk"))
    print(f"[OK] Copied APK ({os.path.getsize(apk_src)} bytes) to output and root")

if os.path.exists(keystore_src):
    shutil.copy2(keystore_src, os.path.join(out_dir, "nurchess100.keystore"))
    print(f"[OK] Copied keystore to {out_dir}")

print("Play Store assets preparation completed successfully!")
