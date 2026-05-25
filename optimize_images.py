from PIL import Image
import os

# (dosya, en büyük kenar px, webp üret mi)
specs = [
    ("hero-guitar.png", 1300, True),   # hero — webp + picture ile kullanılacak
    ("cat-guitars.png", 760, False),
    ("cat-keys.png",    760, False),
    ("cat-drums.png",   760, False),
    ("cat-strings.png", 760, False),
    ("cat-access.png",  760, False),
]
IMG = "images"

for name, maxdim, webp in specs:
    p = os.path.join(IMG, name)
    if not os.path.exists(p):
        print("YOK:", name); continue
    before = os.path.getsize(p)
    im = Image.open(p)
    w, h = im.size
    if im.mode not in ("RGBA", "RGB"):
        im = im.convert("RGBA")
    im.thumbnail((maxdim, maxdim), Image.LANCZOS)
    im.save(p, "PNG", optimize=True)
    after = os.path.getsize(p)
    line = f"{name}: {w}x{h} {before//1024}KB -> {im.size[0]}x{im.size[1]} PNG {after//1024}KB"
    if webp:
        wp = os.path.splitext(p)[0] + ".webp"
        im.save(wp, "WEBP", quality=82, method=6)
        line += f" | WEBP {os.path.getsize(wp)//1024}KB"
    print(line)

print("bitti")
