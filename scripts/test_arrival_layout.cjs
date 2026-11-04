const {chromium}=require('playwright');
const base=process.env.QA_URL||'http://127.0.0.1:8782', checks=[];
function check(name,ok,detail){checks.push({name,ok:!!ok,detail});console.log((ok?'PASS ':'FAIL ')+name,detail===undefined?'':JSON.stringify(detail));}
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/local/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{for(const route of ['/','/docs/']){
 for(const v of [{width:320,height:700},{width:390,height:844},{width:768,height:800},{width:1024,height:768},{width:1440,height:900}]){
  let c=await browser.newContext({viewport:v,reducedMotion:'reduce'}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base+route);await p.waitForTimeout(1500);
  let s=await p.evaluate(()=>{let r=x=>{let e=document.querySelector(x),q=e.getBoundingClientRect();return {top:q.top,bottom:q.bottom,left:q.left,right:q.right,width:q.width,height:q.height}};return {nav:r('.nav'),hero:r('.hero'),cta:r('.impact-primary'),aperture:r('#portrait-reveal'),prompt:r('.identity-prompt'),dock:r('.experience-dock'),horizontal:document.documentElement.scrollWidth>innerWidth,front:document.querySelector('#hero-identity').dataset.portrait,label:document.querySelector('#identity-label').textContent}});
  check(`${route} ${v.width} no horizontal overflow`,!s.horizontal,s.horizontal);check(`${route} ${v.width} mask first`,s.front==='false'&&/front man/i.test(s.label));check(`${route} ${v.width} header does not cover hero`,s.hero.top>=s.nav.bottom-1);check(`${route} ${v.width} main action visible`,s.cta.bottom<=v.height&&s.cta.top>=0,s.cta);
  if(v.width===390)check(`${route} mobile reveal prompt fully in view`,s.prompt.top>=0&&s.prompt.bottom<=v.height,s.prompt);
  if(v.width===1440)check(`${route} desktop controls fully in view`,s.dock.top>=0&&s.dock.bottom<=v.height,s.dock);
  check(`${route} ${v.width} no errors`,errors.length===0,errors);await c.close();
 }
 let c=await browser.newContext({viewport:{width:1440,height:900}}),p=await c.newPage();await p.goto(base+route);await p.waitForTimeout(1500);let b=p.locator('#portrait-reveal'),identity=p.locator('#hero-identity');
 await b.hover();await p.waitForTimeout(100);check(route+' hover reveals',await identity.getAttribute('data-portrait')==='true');await b.click();await p.mouse.move(5,5);check(route+' click keeps portrait',await b.getAttribute('aria-pressed')==='true'&&await identity.getAttribute('data-portrait')==='true');await p.keyboard.press('Escape');check(route+' Escape restores mask',await identity.getAttribute('data-portrait')==='false'&&await b.getAttribute('aria-pressed')==='false');await p.keyboard.press('Tab');
 await p.evaluate(()=>window.scrollTo(0,0));await p.mouse.move(4,4);await p.mouse.wheel(0,600);await p.waitForFunction(()=>scrollY>0,null,{timeout:10000}).catch(()=>{});check(route+' native wheel scrolls',await p.evaluate(()=>scrollY>0));await c.close();
 c=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});p=await c.newPage();await p.goto(base+route);await p.waitForTimeout(1500);b=p.locator('#portrait-reveal');identity=p.locator('#hero-identity');check(route+' touch wording visible',await p.locator('.prompt-touch').isVisible());await b.tap();check(route+' touch opens',await b.getAttribute('aria-pressed')==='true'&&await identity.getAttribute('data-portrait')==='true');await b.tap();check(route+' touch restores mask',await b.getAttribute('aria-pressed')==='false'&&await identity.getAttribute('data-portrait')==='false');await c.close();
 c=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});p=await c.newPage();await p.goto(base+route);check(route+' no-JS maker fallback',await p.locator('.identity-fallback-maker summary').isVisible());await c.close();
}
}finally{await browser.close()}let failures=checks.filter(x=>!x.ok);console.log(JSON.stringify({total:checks.length,failures}));process.exit(failures.length?1:0)
})().catch(e=>{console.error(e);process.exit(1)});
