const {chromium}=require('playwright');
const fs=require('fs');
const BASE=process.env.QA_URL||'http://127.0.0.1:8771',OUT=process.env.QA_OUT||'./test-output/scroll-review';fs.mkdirSync(OUT,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/local/bin/chromium',args:['--no-sandbox'],headless:true});
 let results=[];
 for(const route of ['/','/docs/']){
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 await context.addInitScript(()=>localStorage.setItem('kh-audio','off'));
 await context.route(/https:\/\//,r=>r.abort());
 const page=await context.newPage();let errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(BASE+route,{waitUntil:'domcontentloaded'});await page.waitForTimeout(500);
 function check(name,pass,detail){results.push({route,name,pass,detail}); console.log(`${pass?'PASS':'FAIL'} ${route} ${name}`)}
 let h=page.locator('.proj-head').nth(1);await h.scrollIntoViewIfNeeded();await page.waitForTimeout(200);
 let rect=await h.boundingBox();let x=rect.x+rect.width-15,y=rect.y+rect.height/2;
 await page.mouse.move(x,y);await page.waitForTimeout(350);
 let peek=await page.locator('#peek').boundingBox();
 check('preview measured, positioned by pointer and contained',peek.x>=9&&peek.x+peek.width<=1431&&peek.y>=9&&peek.y+peek.height<=991,peek);
 let before=await h.boundingBox();await page.mouse.move(x-100,y,{steps:8});await page.waitForTimeout(300);check('hover leaves button hit target stable',JSON.stringify(before)===JSON.stringify(await h.boundingBox()));
 await page.keyboard.press('Escape');check('Escape dismisses preview',!(await page.locator('#peek').evaluate(e=>e.classList.contains('on'))));
 await h.focus();await page.keyboard.press('Enter');check('keyboard opens project with available body',await h.getAttribute('aria-expanded')==='true'&&await h.evaluate(e=>!e.closest('.proj').querySelector('.proj-body').inert));
 await page.keyboard.press('Enter');
 // Audit reverse scroll selection as well as forward movement.
 let matched=true;for(const i of [0,2,3,2,1,0]){await page.locator('.step').nth(i).evaluate(e=>window.scrollTo(0,window.scrollY+e.getBoundingClientRect().top-innerHeight*.4));await page.waitForTimeout(80);matched&&=await page.evaluate(()=>{let es=[...document.querySelectorAll('.step')].filter(e=>{let r=e.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight});es.sort((a,b)=>{let ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();return Math.abs((ra.top+ra.bottom)/2-innerHeight*.45)-Math.abs((rb.top+rb.bottom)/2-innerHeight*.45)});return es[0].classList.contains('on')&&document.querySelectorAll('.step.on').length===1})}check('process emphasis tracks forward and reverse scrolling',matched);
 await page.locator('#words').evaluate(e=>scrollTo(0,scrollY+e.getBoundingClientRect().top-innerHeight*.7));await page.waitForFunction(()=>{let root=document.querySelector('#words'),r=root.getBoundingClientRect(),n=root.querySelectorAll('.w').length,p=Math.max(0,Math.min(1,(innerHeight*.82-r.top)/(r.height+innerHeight*.45)));return root.querySelectorAll('.scroll-lit').length===Math.round(p*n)});let w0=await page.locator('.scroll-lit').count();await page.mouse.wheel(0,250);await page.waitForFunction(n=>document.querySelectorAll('.scroll-lit').length>n,w0,{timeout:10000});check('native wheel advances emphasis',await page.locator('.scroll-lit').count()>w0);
 await page.screenshot({path:`${OUT}/scroll-${route==='/'?'root':'docs'}-words.png`});
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelectorAll('.scroll-lit').length===0&&document.documentElement.dataset.motion==='off');check('reduced motion clears word effects',await page.locator('.scroll-lit').count()===0&&await page.evaluate(()=>document.documentElement.dataset.motion)==='off');
 await page.setViewportSize({width:390,height:844});await page.goto(BASE+route,{waitUntil:'domcontentloaded'});await page.waitForTimeout(150);await page.locator('#work').scrollIntoViewIfNeeded();await page.screenshot({path:`${OUT}/scroll-${route==='/'?'root':'docs'}-mobile.png`});check('mobile no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 check('no runtime errors',errors.length===0,errors);await context.close();
 }
 await browser.close();fs.writeFileSync(OUT+'/results.json',JSON.stringify(results,null,2));console.log(JSON.stringify({total:results.length,failed:results.filter(x=>!x.pass)},null,2));if(results.some(x=>!x.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
