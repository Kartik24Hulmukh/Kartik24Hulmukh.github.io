#!/usr/bin/env python3
"""Mirror maintained docs/ HTML for the root GitHub Pages route."""
from pathlib import Path
import re, posixpath
R = Path(__file__).resolve().parents[1]
s = (R / 'docs/index.html').read_text()
# Prefix all local resources, not navigation fragments or external links.
s = re.sub(r'(\b(?:href|src)=")(\.\.?/[^"]+)', lambda m: m[1] + './' + posixpath.normpath('docs/' + m[2]), s)
(R / 'index.html').write_text(s)
for name in ['robots.txt', 'sitemap.xml']:
    (R / name).write_text((R / 'docs' / name).read_text())
print('Mirrored maintained HTML, local resources and crawler metadata.')
