const {chromium}=require('playwright');
const base=process.env.QA_URL||'http://127.0.0.1:8798';
(async()=>{let b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/local/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']}), n=0,fail=[];function ck(name,ok,detail=''){n++;if(!ok)fail.push(name);console.log((ok?'PASS ':'FAIL ')+name+' '+detail)}
try{for(const route of ['/','/docs/'])for(const width of [320,390,768,1440])for(const js of [true,false]){
 let c=await b.newContext({viewport:{width,height:844},javaScriptEnabled:js,reducedMotion:'reduce'}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**',r=>r.abort());await p.goto(base+route,{waitUntil:'domcontentloaded'});if(js)await p.waitForFunction(()=>document.documentElement.classList.contains('accordion-ready'),null,{timeout:30000});
 let projects=p.locator('.proj');ck(`${route} ${width} js=${js} routes`,await p.locator('.project-route').count()===7);
 let first=projects.nth(0),next=first.locator('.project-next');await next.scrollIntoViewIfNeeded();let box=await next.boundingBox();ck(`${route} ${width} js=${js} touch target`,box.width>=44&&box.height>=44);
 await next.focus();await p.keyboard.press('Enter');await p.waitForTimeout(200);let target=projects.nth(1);ck(`${route} ${width} js=${js} next opens target`,new URL(p.url()).hash==='#project-axiom-grid'&&await target.locator('.proj-body').isVisible()&&(!js||await target.locator('.proj-head').getAttribute('aria-expanded')==='true'));
 let back=target.locator('.project-return');await back.scrollIntoViewIfNeeded();await back.focus();await p.keyboard.press('Enter');await p.waitForTimeout(200);ck(`${route} ${width} js=${js} return`,new URL(p.url()).hash==='#dossier-index'&&await p.locator('#dossier-index').isVisible());
 ck(`${route} ${width} js=${js} no overflow/errors`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)&&errors.length===0,errors.join(','));await c.close();
}
}finally{await b.close()}console.log(JSON.stringify({checks:n,failures:fail}));process.exit(fail.length?1:0)})().catch(e=>{console.error(e);process.exit(1)});
