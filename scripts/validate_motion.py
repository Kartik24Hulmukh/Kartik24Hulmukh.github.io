"""Structural guards for the optional motion layer; not a WCAG certification."""
from pathlib import Path
import re, hashlib, posixpath
R = Path(__file__).resolve().parents[1]
s = (R / 'docs/index.html').read_text()
expected = re.sub(r'(\b(?:href|src)=")(\.\.?/[^"]+)', lambda m: m[1] + './' + posixpath.normpath('docs/' + m[2]), s)
assert (R / 'index.html').read_text() == expected, 'Root mirror drift'
for f in ['experience.css', 'experience.js', 'motion-controller.js', 'motion-engine.js']:
    assert (R / 'docs' / f).stat().st_size > 100, f
assert 'attachment.js' not in s, 'Legacy and new engines must not run together'
for id_ in ['experience-controls','motion-toggle','sound-toggle','sound-volume']:
    assert len(re.findall(r'id="' + id_ + '"', s)) == 1, id_
assert 'id="loader"' not in s, 'No blocking loader'
assert 'Illustration only' in s and 'no action runs here' in s
assert 'autoplay' not in s.lower()
assert 'data-to="0">0<' in s, 'Published zero must be stable before JS'
engine = (R / 'docs/motion-engine.js').read_text()
assert 'getContext(' not in engine, 'No WebGL context creation'
assert 'window.__portfolioEngineReady = true' in engine
print('PASS: root/docs parity, motion controls, static evidence and no duplicate engine.')

assert 'class="play-mode"' in s, 'Atmosphere must be default-on before JS'
assert 'experience-panel' not in s and 'custom-audio' not in s, 'No setup panel on visitor arrival'
assert 'class="proj open"' in s, 'Lead project must be open'
print('PASS: automatic-first atmosphere, compact controls and immediately open lead project.')

# The optional hero owns exactly one canvas and imports only on intent/idle.
for f in ['hero3d.js', 'hero3d.css', 'vendor/hero-three.js', 'models/front-man.model.json', 'models/pink-soldier.model.json', 'models/unknown.model.json']:
    assert (R / 'docs' / f).is_file(), f
for id_ in ['hero-identity', 'portrait-reveal', 'hero-model-surface', 'identity-status']:
    assert len(re.findall(r'id="' + id_ + '"', s)) == 1, id_
hero = (R / 'docs/hero3d.js').read_text()
assert 'setAnimationLoop' not in hero
assert hero.count('new T.WebGLRenderer(') == 1
assert 'ticket===epoch' in hero and 'meshCache' in hero and 'valid(rec,ticket)' in hero
for id_ in ['work-guard', 'process-guard']:
    assert len(re.findall(r'id="' + id_ + '"', s)) == 1, id_
assert 'data-portrait="false"' in s
for poster in ['front-man.cover.svg', 'pink-soldier.full.svg', 'unknown.full.svg']:
    assert poster in s and (R / 'docs/models' / poster).is_file()
assert 'character-select' not in s
assert 'accordion-ready' in engine
assert 'focusin' not in (R / 'docs/experience.js').read_text()
print('PASS: three locations, mask-first identity, one renderer and atomic disclosures.')

# Restored contour background and readable interaction polish have independent fallbacks.
for f in ['atmosphere.js', 'atmosphere.css', 'interaction-polish.js', 'interaction-polish.css', 'assets/contour-field.svg']:
    assert (R / 'docs' / f).is_file(), f
    assert f in s or f == 'assets/contour-field.svg', f
field = (R / 'docs/atmosphere.js').read_text()
assert "cv.getContext('webgl'" in field and '24' in field
assert 'smoothstep(0.42,0.0' not in field and 'smoothstep(1.25,0.25' not in field
assert 'pointer-events:none' in (R / 'docs/atmosphere.css').read_text()
assert 'data:image/webp;base64,' in (R / 'docs/assets/contour-field.svg').read_text()
print('PASS: reference contour field, static poster and readable interaction modules.')
