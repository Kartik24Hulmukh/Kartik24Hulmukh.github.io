#!/usr/bin/env python3
"""Mirror maintained docs/ HTML for the root GitHub Pages route."""
from pathlib import Path
import re, posixpath, hashlib
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode
R = Path(__file__).resolve().parents[1]
s = (R / 'docs/index.html').read_text()
# Content-versioned resources prevent mixed releases in returning browsers.
def version_resource(match):
    url = urlsplit(match[2])
    asset = R / 'docs' / url.path
    if asset.suffix not in {'.css', '.js'} or not asset.is_file():
        return match[0]
    query = [(k, v) for k, v in parse_qsl(url.query) if k != 'v']
    query.append(('v', hashlib.sha256(asset.read_bytes()).hexdigest()[:12]))
    return match[1] + urlunsplit(url._replace(query=urlencode(query)))
s = re.sub(r'(\b(?:href|src)=")(\.\.?/[^"]+)', version_resource, s)
(R / 'docs/index.html').write_text(s)
# Prefix all local resources, not navigation fragments or external links.
s = re.sub(r'(\b(?:href|src)=")(\.\.?/[^"]+)', lambda m: m[1] + './' + posixpath.normpath('docs/' + m[2]), s)
(R / 'index.html').write_text(s)
for name in ['robots.txt', 'sitemap.xml']:
    (R / name).write_text((R / 'docs' / name).read_text())
print('Mirrored maintained HTML, local resources and crawler metadata.')
