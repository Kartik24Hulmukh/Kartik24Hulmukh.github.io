#!/usr/bin/env python3
"""Dependency-free integrity checks, not a substitute for browser testing."""
from pathlib import Path
from html.parser import HTMLParser
import re,json
R=Path(__file__).resolve().parents[1];D=R/'docs'
class Page(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.hrefs=[];self.srcs=[];self.details=0;self.h1=0
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if 'id'in a:self.ids.append(a['id'])
  if t=='a':self.hrefs.append(a.get('href',''))
  if t in ('script','img') and 'src'in a:self.srcs.append(a['src'])
  if t=='details':self.details+=1
  if t=='h1':self.h1+=1
s=(D/'index.html').read_text();p=Page();p.feed(s)
assert p.h1==1 and p.details==7
assert len(p.ids)==len(set(p.ids))
for a in p.hrefs:
 if a.startswith('#'):assert a[1:] in p.ids,a
for a in p.srcs:
 if a.startswith('./'):assert (D/a).is_file(),a
assert 'data-to=' not in s and 'id="loader"' not in s
assert 'SNAPSHOT:' not in s
for asset in ['hero-dark.svg','hero-light.svg']:assert (R/'assets'/asset).exists()
snapshot=json.loads((D/'activity.json').read_text());assert len(snapshot['repositories'])==4
assert {x['name'] for x in snapshot['repositories']}=={'jittest','Axiom-Grid','AccessDoc','project-xray'}
for row in snapshot['repositories']:
 assert re.fullmatch(r'\d{4}-\d{2}-\d{2}T.*',row['pushed_at'])
 assert row['name'] in s and row['pushed_at'][:10] in s
secret=re.compile(r'(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16})')
for file in R.rglob('*'):
 if file.is_file() and file.suffix in ('.md','.html','.js','.css','.json','.svg','.py','.yml','.txt'):
  text=file.read_text();assert not secret.search(text),'Potential credential in '+str(file)
assert 'webglcontextlost' in (D/'app.js').read_text()
print('PASS: seven native disclosures, source anchors, local assets, no counters/loader, snapshot allowlist and credential patterns.')
