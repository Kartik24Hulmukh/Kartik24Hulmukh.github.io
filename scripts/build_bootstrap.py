#!/usr/bin/env python3
"""Mirror maintained docs/ HTML for a default-branch GitHub user site."""
from pathlib import Path
R=Path(__file__).resolve().parents[1]
s=(R/'docs/index.html').read_text()
for attr,name in [('href','styles.css'),('src','app.js'),('href','favicon.svg')]:
 s=s.replace(attr+'="./'+name+'"',attr+'="./docs/'+name+'"')
(R/'index.html').write_text(s)
for name in ['robots.txt','sitemap.xml']:
 (R/name).write_text((R/'docs'/name).read_text())
print('Mirrored maintained site HTML and crawler metadata for branch-based Pages.')
