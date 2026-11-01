"""Validate the user's restored attachment without rewriting its design."""
from pathlib import Path
import hashlib,re,json
from urllib.parse import urlsplit, parse_qs
R=Path(__file__).resolve().parents[1]
m=json.loads((R/'restoration-verification.json').read_text())
for name,key in [('attachment.css','css_sha256'),('attachment.js','javascript_sha256')]:
 p=R/'docs'/name
 assert hashlib.sha256(p.read_bytes()).hexdigest()==m[key],f'Original design asset changed: {name}'
for name in ['index.html','docs/index.html']:
 s=(R/name).read_text()
 assert len(re.findall(r'<article class="proj(?: open)?"',s))==7
 assert len(re.findall(r'<h1\b',s))==1
 assert 'data-to="1832"' not in s
 for value in re.findall(r'(?:href|src)="(\./[^"]+)"',s):
  url=urlsplit(value)
  asset=(R/name).parent/url.path
  assert asset.is_file(),value
  if asset.suffix in {'.css','.js'}:
   assert parse_qs(url.query).get('v') == [hashlib.sha256(asset.read_bytes()).hexdigest()[:12]],f'Stale asset version: {value}'
 assert not re.search(r'gh[pousr]_[A-Za-z0-9]{20,}',s),'Credential pattern detected'
print('PASS: original stylesheet and interactions unchanged; both published routes and assets valid.')
