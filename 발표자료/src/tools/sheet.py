import json, sys, os
from PIL import Image
d = sys.argv[1]; out = sys.argv[2]; step = float(sys.argv[3]) if len(sys.argv) > 3 else 1.5
meta = json.load(open(os.path.join(d, 'frames.json'), encoding='utf-8'))
fr = meta['frames']; t0 = fr[0]['ts']
picks = []; nxt = 0
for f in fr:
    if f['ts'] - t0 >= nxt:
        picks.append(f); nxt += step
w, h = 195, 422
cols = 8; rows = (len(picks) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w, rows * (h + 18)), 'white')
from PIL import ImageDraw
dr = ImageDraw.Draw(sheet)
for i, f in enumerate(picks):
    im = Image.open(os.path.join(d, f['f'])).convert('RGB').resize((w, h))
    x, y = (i % cols) * w, (i // cols) * (h + 18)
    sheet.paste(im, (x, y + 18)); dr.text((x + 4, y + 2), f"{f['ts']-t0:.1f}s", fill='black')
sheet.save(out); print(len(picks), sheet.size)
