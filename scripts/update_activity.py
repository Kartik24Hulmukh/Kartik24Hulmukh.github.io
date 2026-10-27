#!/usr/bin/env python3
"""Update a narrow public-repository snapshot. Fail without changing files on error."""
import datetime,json,os,pathlib,urllib.request,html,re
ROOT=pathlib.Path(__file__).resolve().parents[1]
NAMES=('jittest','Axiom-Grid','AccessDoc','project-xray')
headers={'Accept':'application/vnd.github+json','User-Agent':'kartik-portfolio-snapshot','X-GitHub-Api-Version':'2022-11-28'}
if os.environ.get('GH_TOKEN'):headers['Authorization']='Bearer '+os.environ['GH_TOKEN']
rows=[]
for name in NAMES:
    req=urllib.request.Request('https://api.github.com/repos/Kartik24Hulmukh/'+name,headers=headers)
    with urllib.request.urlopen(req,timeout=30) as response:data=json.load(response)
    if data.get('private') is not False or data.get('full_name','').lower()!=('Kartik24Hulmukh/'+name).lower():
        raise RuntimeError('Unexpected repository identity; keeping the previous snapshot')
    if not isinstance(data.get('pushed_at'),str):raise RuntimeError('Incomplete snapshot')
    rows.append({'name':name,'pushed_at':data['pushed_at'],'language':data.get('language')})
rows.sort(key=lambda x:x['pushed_at'],reverse=True)
now=datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z')
snapshot={'generated_at':now,'source':'GitHub public repository API; last pushed is not impact or adoption','repositories':rows}
readme_path=ROOT/'README.md'
readme=readme_path.read_text()
start='<!-- ACTIVITY:START -->';end='<!-- ACTIVITY:END -->'
if readme.count(start)!=1 or readme.count(end)!=1:raise RuntimeError('Expected exactly one activity region')
table='| Repository | Last pushed (UTC) |\n| :-- | :-- |\n'
for row in rows:table+=f"| [{row['name']}](https://github.com/Kartik24Hulmukh/{row['name']}) | {row['pushed_at'][:10]} |\n"
block=start+'\n'+table+'\n<sub>Public repository metadata checked '+now[:10]+'. Push dates are not adoption or impact metrics.</sub>\n'
head,tail=readme.split(start,1);_,tail=tail.split(end,1)
updated=head+block+end+tail
site_path=ROOT/'docs/index.html'
site=site_path.read_text()
if site.count('id="snapshot-asof"')!=1 or site.count('id="repo-snapshot"')!=1:raise RuntimeError('Expected static snapshot targets')
static_rows=''.join('<a class="l-item" href="https://github.com/Kartik24Hulmukh/'+row['name']+'"><span class="mono d">'+row['pushed_at'][:10]+'</span><span class="mono repo">'+row['name']+'</span><span class="t">Repository metadata · '+html.escape(row['language'] or 'Source repository')+'</span><span class="arr" aria-hidden="true">↗</span></a>' for row in rows)
site=re.sub(r'(<p[^>]*id="snapshot-asof"[^>]*>).*?(</p>)',lambda m:m[1]+'Metadata checked '+now[:10]+' · push dates are not impact'+m[2],site,flags=re.S)
site=re.sub(r'(<div[^>]*id="repo-snapshot"[^>]*>).*?(</div>)',lambda m:m[1]+static_rows+m[2],site,flags=re.S)
# No files are written until every request and validation succeeds.
(ROOT/'docs/activity.json').write_text(json.dumps(snapshot,indent=2)+'\n')
readme_path.write_text(updated)
site_path.write_text(site)
print('Updated four allowlisted public repositories. No stars, followers, or invented counters.')
