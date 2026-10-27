#!/usr/bin/env python3
"""Original ink/paper/orange profile graphics. Pillow is build-time only."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import math
R=Path(__file__).resolve().parents[1];(R/'assets').mkdir(exist_ok=True);(R/'docs/assets').mkdir(exist_ok=True)
def ft(size,serif=False):
    names=['georgiai.ttf','DejaVuSerif-Italic.ttf','LiberationSerif-Italic.ttf'] if serif else ['arialbd.ttf','DejaVuSans-Bold.ttf','LiberationSans-Bold.ttf']
    for name in names:
        try:return ImageFont.truetype(name,size)
        except OSError:pass
    return ImageFont.load_default(size=size)
def svg(light=False):
    bg='#ece8df' if light else '#0d0d0c';fg='#0d0d0c' if light else '#ece8df';accent='#a52b08' if light else '#ff6338';muted='#5a554e' if light else '#aaa59c';line='#c4bfb5' if light else '#41403b'
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="440" viewBox="0 0 1200 440" role="img" aria-labelledby="t d"><title id="t">Kartik Hulmukh — Software that shows its work.</title><desc id="d">Verification tools, local-first systems, source-linked engineering. Original editorial profile graphic.</desc><rect width="1200" height="440" fill="{bg}"/><path d="M40 80H1160M40 370H1160" stroke="{line}"/><text x="40" y="52" font-family="Arial,sans-serif" font-size="20" font-weight="700" fill="{fg}">KARTIK HULMUKH</text><text x="1160" y="52" text-anchor="end" font-family="Consolas,monospace" font-size="14" fill="{muted}">MUMBAI / SELECTED WORK</text><text x="38" y="175" font-family="Arial,sans-serif" font-size="76" font-weight="900" letter-spacing="-4" fill="{fg}">SOFTWARE</text><text x="38" y="255" font-family="Arial,sans-serif" font-size="76" font-weight="900" letter-spacing="-4" fill="{fg}">THAT SHOWS</text><text x="40" y="332" font-family="Georgia,serif" font-style="italic" font-size="78" letter-spacing="-3" fill="{accent}">its work.</text><g transform="translate(860 225)" fill="none" stroke="{accent}"><rect x="-96" y="-96" width="192" height="192" transform="rotate(12)"/><rect x="-78" y="-78" width="156" height="156" transform="rotate(24)"/><rect x="-60" y="-60" width="120" height="120" transform="rotate(36)"/><circle r="4" fill="{accent}"/></g><text x="40" y="409" font-family="Consolas,monospace" font-size="14" fill="{muted}">VERIFICATION / LOCAL-FIRST SYSTEMS / SOURCE-LINKED ENGINEERING</text><text x="1160" y="409" text-anchor="end" font-family="Consolas,monospace" font-size="14" fill="{accent}">INSPECT THE WORK ↗</text></svg>'''
for mode in ['light','dark']:(R/f'assets/hero-{mode}.svg').write_text(svg(mode=='light'))
(R/'docs/assets/social.svg').write_text(svg())
# Short play-once orbit. No scripts or indefinite animation in the GitHub README.
frames=[]
for frame in range(40):
    im=Image.new('RGB',(1200,440),'#0d0d0c');d=ImageDraw.Draw(im)
    d.line((40,80,1160,80),fill='#41403b');d.line((40,370,1160,370),fill='#41403b')
    d.text((40,29),'KARTIK HULMUKH',font=ft(20),fill='#ece8df');d.text((876,31),'MUMBAI / SELECTED WORK',font=ft(14),fill='#aaa59c')
    d.text((38,99),'SOFTWARE',font=ft(76),fill='#ece8df');d.text((38,179),'THAT SHOWS',font=ft(76),fill='#ece8df');d.text((40,255),'its work.',font=ft(78,True),fill='#ff6338')
    for n in range(3):
        a=(12+n*12)*math.pi/180;size=96-n*18
        points=[(860+x*math.cos(a)-y*math.sin(a),225+x*math.sin(a)+y*math.cos(a)) for x,y in [(-size,-size),(size,-size),(size,size),(-size,size)]]
        d.line(points+[points[0]],fill='#ff6338',width=1)
    a=frame/39*math.tau;x=860+127*math.cos(a);y=225+127*math.sin(a);d.ellipse((x-4,y-4,x+4,y+4),fill='#ece8df')
    d.text((40,394),'VERIFICATION / LOCAL-FIRST SYSTEMS / SOURCE-LINKED ENGINEERING',font=ft(13),fill='#aaa59c');d.text((1010,394),'INSPECT THE WORK',font=ft(13),fill='#ff6338')
    frames.append(im)
frames[0].save(R/'docs/assets/hero-motion.gif',save_all=True,append_images=frames[1:],duration=80,optimize=True)
card=Image.new('RGB',(1200,630),'#0d0d0c');card.paste(frames[-1],(0,95));card.save(R/'docs/assets/social.png',optimize=True)
print('Rendered play-once GIF, static dark/light SVG, and social card.')
