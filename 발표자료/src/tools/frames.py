"""Device frames (phone/laptop) with transparent screen holes, plus static phone composites."""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

S = sys.argv[1]
MEDIA = os.path.join(S, 'media'); STILLS = os.path.join(S, 'stills')
SS = 3  # supersample for smooth corners
BOLD = r'C:\Windows\Fonts\malgunbd.ttf'

# ---- phone geometry (px at 1x) -------------------------------------------
B, SB, SW, VH = 30, 104, 780, 1688          # bezel, status bar, screen width, video height
W, H = SW + 2 * B, B + SB + VH + B
R_OUT, R_IN = 138, 108
PHONE = dict(W=W, H=H, hole_x=B, hole_y=B + SB, hole_w=SW, hole_h=VH, sb=SB, bezel=B)

def rr(draw, box, r, **kw):
    draw.rounded_rectangle([v * SS for v in box], r * SS, **kw)

def phone_frame(clock='13:42'):
    im = Image.new('RGBA', (W * SS, H * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    rr(d, (0, 0, W - 1, H - 1), R_OUT, fill=(46, 48, 54, 255))          # rim
    rr(d, (5, 5, W - 6, H - 6), R_OUT - 5, fill=(12, 12, 14, 255))      # body
    # screen hole
    hole = Image.new('L', im.size, 0)
    rr(ImageDraw.Draw(hole), (B, B, W - B - 1, H - B - 1), R_IN, fill=255)
    alpha = im.getchannel('A')
    alpha.paste(0, mask=hole); im.putalpha(alpha)
    # status bar (white, clipped to hole top)
    sb = Image.new('RGBA', im.size, (0, 0, 0, 0))
    ds = ImageDraw.Draw(sb)
    ds.rectangle([B * SS, B * SS, (W - B) * SS, (B + SB) * SS], fill=(251, 251, 252, 255))
    f = ImageFont.truetype(BOLD, 36 * SS)
    ds.text(((B + 92) * SS, (B + SB / 2 + 4) * SS), clock, font=f, fill=(17, 17, 20, 255), anchor='mm')
    # dynamic island
    iw, ih = 236, 66
    ds.rounded_rectangle([((W - iw) / 2) * SS, (B + 20) * SS, ((W + iw) / 2) * SS, (B + 20 + ih) * SS], ih / 2 * SS, fill=(0, 0, 0, 255))
    # signal bars, wifi-ish dots, battery
    cy = B + SB / 2 + 4; x = W - B - 188
    for i in range(4):
        h = 10 + i * 6
        ds.rounded_rectangle([(x + i * 12) * SS, (cy + 13 - h) * SS, (x + i * 12 + 8) * SS, (cy + 13) * SS], 2 * SS, fill=(17, 17, 20, 255))
    x += 62
    for k, rad in enumerate((22, 15, 8)):
        ds.pieslice([(x + 16 - rad) * SS, (cy + 12 - rad) * SS, (x + 16 + rad) * SS, (cy + 12 + rad) * SS], 225, 315, fill=(17, 17, 20, 255) if k % 2 == 0 else (251, 251, 252, 255))
    x += 50
    ds.rounded_rectangle([x * SS, (cy - 12) * SS, (x + 50) * SS, (cy + 12) * SS], 7 * SS, outline=(17, 17, 20, 160), width=3 * SS)
    ds.rounded_rectangle([(x + 4) * SS, (cy - 8) * SS, (x + 38) * SS, (cy + 8) * SS], 4 * SS, fill=(17, 17, 20, 255))
    ds.rounded_rectangle([(x + 53) * SS, (cy - 5) * SS, (x + 57) * SS, (cy + 5) * SS], 2 * SS, fill=(17, 17, 20, 160))
    clip = Image.new('L', im.size, 0)
    rr(ImageDraw.Draw(clip), (B, B, W - B - 1, H - B - 1), R_IN, fill=255)
    sb.putalpha(Image.composite(sb.getchannel('A'), Image.new('L', im.size, 0), clip))
    im = Image.alpha_composite(im, sb)
    return im.resize((W, H), Image.LANCZOS)

def composite(frame, screen_png, out):
    scr = Image.open(screen_png).convert('RGBA').resize((SW, VH), Image.LANCZOS)
    base = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    base.paste(scr, (B, B + SB))
    # clip screen to the rounded hole so nothing leaks past the bezel corners
    clip = Image.new('L', (W * SS, H * SS), 0)
    rr(ImageDraw.Draw(clip), (B, B, W - B - 1, H - B - 1), R_IN, fill=255)
    clip = clip.resize((W, H), Image.LANCZOS)
    base.putalpha(Image.composite(base.getchannel('A'), Image.new('L', (W, H), 0), clip))
    Image.alpha_composite(base, frame).save(out)

# ---- laptop geometry -------------------------------------------------------
LB, LT, LBOT, LW, LH = 34, 40, 44, 1440, 900
LIDW, LIDH = LW + 2 * LB, LH + LT + LBOT
BASE_EXT, BASE_H = 96, 46
LTW, LTH = LIDW + 2 * BASE_EXT, LIDH + BASE_H
LAPTOP = dict(W=LTW, H=LTH, hole_x=BASE_EXT + LB, hole_y=LT, hole_w=LW, hole_h=LH)

def laptop_frame():
    im = Image.new('RGBA', (LTW * SS, LTH * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    x0 = BASE_EXT
    rr(d, (x0, 0, x0 + LIDW - 1, LIDH + 6), 34, fill=(52, 54, 60, 255))
    rr(d, (x0 + 4, 4, x0 + LIDW - 5, LIDH + 2), 30, fill=(14, 14, 16, 255))
    d.ellipse([(x0 + LIDW / 2 - 6) * SS, 15 * SS, (x0 + LIDW / 2 + 6) * SS, 27 * SS], fill=(40, 42, 48, 255))
    # base
    d.rounded_rectangle([0, (LIDH) * SS, LTW * SS - 1, (LIDH + BASE_H - 8) * SS], 6 * SS, fill=(196, 199, 206, 255))
    d.rounded_rectangle([12 * SS, (LIDH + BASE_H - 14) * SS, (LTW - 12) * SS, (LIDH + BASE_H) * SS], 14 * SS, fill=(150, 153, 161, 255))
    d.rounded_rectangle([(LTW / 2 - 120) * SS, LIDH * SS, (LTW / 2 + 120) * SS, (LIDH + 14) * SS], 8 * SS, fill=(170, 173, 181, 255))
    hole = Image.new('L', im.size, 0)
    rr(ImageDraw.Draw(hole), (x0 + LB, LT, x0 + LB + LW - 1, LT + LH - 1), 6, fill=255)
    a = im.getchannel('A'); a.paste(0, mask=hole); im.putalpha(a)
    return im.resize((LTW, LTH), Image.LANCZOS)

if __name__ == '__main__':
    os.makedirs(MEDIA, exist_ok=True)
    pf = phone_frame(); pf.save(os.path.join(MEDIA, 'phone-frame.png'))
    lf = laptop_frame(); lf.save(os.path.join(MEDIA, 'laptop-frame.png'))
    for n in ('today', 'sheet', 'orgs', 'sos', 'memo', 'lodging', 'more'):
        composite(pf, os.path.join(STILLS, f's-{n}.png'), os.path.join(MEDIA, f'phone-{n}.png'))
    json.dump({'phone': PHONE, 'laptop': LAPTOP}, open(os.path.join(MEDIA, 'geom.json'), 'w'))
    print(PHONE, LAPTOP)
