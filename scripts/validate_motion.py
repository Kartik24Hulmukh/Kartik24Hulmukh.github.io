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
