"""연수 기간 날짜별 화면을 폰 프레임에 합성 (상단 시계를 그 시각으로)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import frames as F
S = sys.argv[1]
for n, clock in [('d1', '15:20'), ('d2', '09:30'), ('d3', '13:42'), ('d4', '12:50'), ('d5', '10:20')]:
    F.composite(F.phone_frame(clock), os.path.join(S, 'stills', f'm-{n}.png'), os.path.join(S, 'media', f'phone-{n}.png'))
print('ok')
