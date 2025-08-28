from PIL import Image, ImageDraw, ImageFont
import os

SIZES = [16, 32, 48, 128]
BG = (18, 18, 18, 255)           # near-black for contrast
ACCENT = (234, 88, 12, 255)      # orange accent (matches priority high)
FG = (255, 255, 255, 255)

# Simple 'A11y' badge icon: rounded square + stylized 'A' and a small dot (i)

def draw_icon(size: int) -> Image.Image:
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = max(3, size // 8)
    # rounded rect background
    d.rounded_rectangle([(0,0),(size-1,size-1)], radius=r, fill=BG)

    # Draw stylized 'A' using two strokes and a cross bar
    pad = size * 0.18
    top_y = size * 0.28
    bottom_y = size * 0.78
    mid_x = size * 0.40
    bar_y = size * 0.55

    # Left stroke
    d.line([(pad, bottom_y), (mid_x, top_y)], fill=FG, width=max(2, size//10))
    # Right stroke (accent)
    d.line([(size - pad, bottom_y), (mid_x, top_y)], fill=ACCENT, width=max(2, size//10))
    # Cross bar
    d.line([(pad*1.15, bar_y), (size - pad*1.15, bar_y)], fill=FG, width=max(2, size//14))

    # Small dot to suggest "i" for information/accessibility
    dot_r = max(1, size//16)
    dot_x = size * 0.70
    dot_y = size * 0.30
    d.ellipse([(dot_x - dot_r, dot_y - dot_r), (dot_x + dot_r, dot_y + dot_r)], fill=ACCENT)

    return img


def main():
    out_dir = os.path.join(os.path.dirname(__file__), '..', 'icons')
    out_dir = os.path.abspath(out_dir)
    os.makedirs(out_dir, exist_ok=True)
    for s in SIZES:
        img = draw_icon(s)
        path = os.path.join(out_dir, f'icon-{s}.png')
        img.save(path, format='PNG')
        print('wrote', path)

if __name__ == '__main__':
    main()
