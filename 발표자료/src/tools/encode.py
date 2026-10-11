"""Turn screencast frames (with real timestamps) into a constant-30fps H.264 MP4."""
import json, os, subprocess, sys
d, out = sys.argv[1], sys.argv[2]
start = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
meta = json.load(open(os.path.join(d, 'frames.json'), encoding='utf-8'))
fr = meta['frames']; t0 = fr[0]['ts'] + start
fr = [f for f in fr if f['ts'] >= t0 - 0.0001] or meta['frames'][-1:]
lines = []
for a, b in zip(fr, fr[1:] + [None]):
    dur = (b['ts'] - a['ts']) if b else 1.0
    lines.append(f"file '{a['f']}'\nduration {max(dur, 0.001):.4f}")
lines.append(f"file '{fr[-1]['f']}'")
lst = os.path.join(d, 'list.txt')
open(lst, 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst,
       '-vf', 'fps=30,scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p',
       '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-movflags', '+faststart', '-an', out]
subprocess.run(cmd, check=True, cwd=d)
print('ok', out, os.path.getsize(out) // 1024, 'KB')
