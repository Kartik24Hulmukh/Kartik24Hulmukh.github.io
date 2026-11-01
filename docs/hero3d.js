/* Real supplied meshes, one bounded renderer, no page-wide GPU loop. */
(function(){
 'use strict';
 var owner=document.getElementById('hero-identity');if(!owner)return;
 var base=new URL('.',document.currentScript.src),hero=owner.closest('.hero'),button=document.getElementById('portrait-reveal'),surface=document.getElementById('hero-model-surface');
 var status=document.getElementById('identity-status'),label=document.getElementById('identity-label'),retry=document.getElementById('model-retry');
 var M=window.PortfolioMotion,fine=matchMedia('(hover:hover) and (pointer:fine)'),selects=Array.from(owner.querySelectorAll('[data-character]'));
 var names={'front-man':'Front Man','pink-soldier':'Pink Soldier','unknown':'Unknown'};
 var poster=document.createElement('img');poster.className='model-poster';poster.alt='';poster.setAttribute('aria-hidden','true');surface.appendChild(poster);
 var fallbackActive=false,fallbackGeneration=0,failed=false;
 var removers=[];function on(target,type,fn,options){target.addEventListener(type,fn,options);removers.push(function(){target.removeEventListener(type,fn,options);});}
 var T=null,renderer=null,scene=null,camera=null,group=null,mesh=null,contextLost=false,loading=false,ready=false;
 var selected='front-man',loaded=null,hovered=false,focused=false,pinned=false,forcedPortrait=false,intro=false,introConsumed=false;
 var inView=false,suspended=false,disposed=false,generation=0,abort=null,runtimePromise=null,cache=new Map();
 var raf=0,staticRaf=0,idle=0,introTimer=0,timeout=0,unsubscribe=null,resizeObserver=null,observer=null;
 var targetX=0,targetY=0,angleX=0,angleY=0,lastTime=0,deadline=0,dirty=false,firstPaint=false,degraded=false;
 var stats={rendererCreations:0,renders:0,animationCallbacks:0,staticPaints:0,loads:0,triangles:0,drawCalls:0,maxFrameMs:0,steadyFrames:[]};
 function active(){return !!(M&&M.state().active);}
 function canPaint(){return !disposed&&!suspended&&!document.hidden&&inView&&renderer&&ready&&!contextLost;}
 function wantsReveal(){return !forcedPortrait&&(pinned||intro||(active()&&(hovered||focused)));}
 function message(t){if(!disposed)status.textContent=t;}
 function ui(){
  if(disposed)return;var show=!!(loaded===selected&&ready&&firstPaint&&!contextLost&&wantsReveal());owner.dataset.fallback=String(fallbackActive&&wantsReveal());owner.dataset.revealed=String(show);
  button.setAttribute('aria-pressed',String(pinned));button.setAttribute('aria-label',pinned?'Show Kartik portrait':'Reveal '+names[selected]+' 3D model');
  label.textContent=show?names[selected]+' · 3D study':(fallbackActive&&wantsReveal())?names[selected]+' · static preview':'Kartik Hulmukh';
  owner.querySelector('.identity-topline span:last-child').textContent=String(selects.findIndex(function(b){return b.dataset.character===selected;})+1).padStart(2,'0')+' / 03';
  selects.forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.character===selected));});
 }
 function cancelAnimation(){if(raf&&M)M.cancel(raf);raf=0;lastTime=0;}
 function cancelStatic(){if(staticRaf)cancelAnimationFrame(staticRaf);staticRaf=0;}
 function neutral(){targetX=targetY=angleX=angleY=0;button.style.setProperty('--card-x','0deg');button.style.setProperty('--card-y','0deg');if(group)group.rotation.set(0,0,0);}
 function paint(isStatic){
  if(!canPaint())return;var start=performance.now();group.rotation.set(angleX,angleY,0);renderer.render(scene,camera);
  var ms=performance.now()-start;stats.renders++;if(isStatic)stats.staticPaints++;stats.triangles=renderer.info.render.triangles;stats.drawCalls=renderer.info.render.calls;
  stats.maxFrameMs=Math.max(stats.maxFrameMs,ms);stats.steadyFrames.push(ms);if(stats.steadyFrames.length>90)stats.steadyFrames.shift();
  if(stats.renders>8&&ms>24&&!degraded){degraded=true;renderer.setPixelRatio(1);size();}
  dirty=false;firstPaint=true;ui();
 }
 function staticPaint(){dirty=true;if(!canPaint()||staticRaf)return;staticRaf=requestAnimationFrame(function(){staticRaf=0;if(canPaint())paint(true);});}
 function animate(time){
  raf=0;stats.animationCallbacks++;if(!canPaint()||!active()||!wantsReveal())return;
  var dt=lastTime?Math.min(.05,(time-lastTime)/1000):1/60;lastTime=time;var ease=1-Math.exp(-dt*10);
  angleX+=(targetX-angleX)*ease;angleY+=(targetY-angleY)*ease;paint(false);
  var unsettled=Math.abs(targetX-angleX)+Math.abs(targetY-angleY)>.001;
  if(unsettled&&performance.now()<deadline&&!degraded)raf=M.raf(animate);else{angleX=targetX;angleY=targetY;paint(false);}
 }
 function animateTo(x,y,duration){
  targetX=x;targetY=y;deadline=performance.now()+(duration||900);
  if(!canPaint())return;if(!active()){neutral();staticPaint();return;}
  if(!raf)raf=M.raf(animate);
 }
 function stopIntro(){clearTimeout(introTimer);introTimer=0;intro=false;}
 function refresh(){
  if(!active()||!inView||document.hidden||suspended){cancelAnimation();cancelStatic();stopIntro();neutral();}
  if(canPaint()&&wantsReveal()){if(active())animateTo(targetX,targetY);else staticPaint();}
  ui();
 }
 var lastWidth=0,lastHeight=0,lastDPR=0;
 function size(){
  if(disposed)return;dirty=true;
  if(!renderer||!camera||!inView||document.hidden||suspended||contextLost)return;
  var r=button.getBoundingClientRect();if(r.width<1||r.height<1)return;
  var dpr=degraded?1:Math.min(devicePixelRatio||1,fine.matches?1.5:1.25);
  if(r.width!==lastWidth||r.height!==lastHeight||dpr!==lastDPR){
   lastWidth=r.width;lastHeight=r.height;lastDPR=dpr;renderer.setPixelRatio(dpr);renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();
  }
  if(canPaint())staticPaint();
 }
 function disposeMesh(m){if(!m)return;m.geometry.dispose();if(m.material.map)m.material.map.dispose();m.material.dispose();}
 function bytes(text){var s=atob(text),a=new Uint8Array(s.length);for(var i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return a;}
 async function decode(data){
  if(data.format!=='squid-quantized-mesh-v1'||data.vertexCount>65000||data.triangleCount>80000)throw Error('Unsupported model format');
  var packed=JSON.parse(T.strFromU8(T.gunzipSync(bytes(data.geometry))));
  var p=new Int16Array(bytes(packed.positions).buffer),n=new Int8Array(bytes(packed.normals).buffer),uv=new Uint16Array(bytes(packed.uvs).buffer),ix=new Uint16Array(bytes(packed.indices).buffer);
  var lo=data.bounds.min,hi=data.bounds.max;
  if(p.length!==data.vertexCount*3||n.length!==p.length||uv.length!==data.vertexCount*2||ix.length!==data.triangleCount*3||!lo.concat(hi).every(Number.isFinite))throw Error('Invalid mesh buffers');
  for(var k=0;k<ix.length;k++)if(ix[k]>=data.vertexCount)throw Error('Invalid mesh index');
  var positions=new Float32Array(p.length);
  for(var i=0;i<p.length;i++){var c=i%3;positions[i]=lo[c]+(p[i]/32767+1)*.5*(hi[c]-lo[c]);}
  var geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('normal',new T.BufferAttribute(n,3,true));geometry.setAttribute('uv',new T.BufferAttribute(uv,2,true));geometry.setIndex(new T.BufferAttribute(ix,1));geometry.computeBoundingSphere();
  var texture=null;try{texture=await new T.TextureLoader().loadAsync(data.texture);texture.colorSpace=T.SRGBColorSpace;texture.flipY=data.textureFlipY;texture.anisotropy=1;
   var material=new T.MeshStandardMaterial({map:texture,roughness:data.material.roughness,metalness:data.material.metalness});return new T.Mesh(geometry,material);
  }catch(e){geometry.dispose();if(texture)texture.dispose();throw e;}
 }
 function createRenderer(){
  if(renderer)return;
  var canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');
  renderer=new T.WebGLRenderer({canvas:canvas,alpha:true,antialias:true,powerPreference:'low-power'});stats.rendererCreations++;
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,fine.matches?1.5:1.25));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  renderer.setClearColor(0x000000,0);scene=new T.Scene();camera=new T.PerspectiveCamera(28,1,.1,20);camera.position.set(0,.5,2.4);camera.lookAt(0,.5,0);
  scene.add(new T.HemisphereLight(0xe8efff,0x858099,2));
  [[0xffffff,4,3,4,5],[0xe65a89,2,-3,2,1],[0xb2d5ff,4,2,3,-4]].forEach(function(l){var light=new T.DirectionalLight(l[0],l[1]);light.position.set(l[2],l[3],l[4]);scene.add(light);});
  group=new T.Group();scene.add(group);surface.appendChild(canvas);
  on(canvas,'webglcontextlost',function(e){e.preventDefault();contextLost=true;failed=true;fallbackGeneration++;cancelAnimation();cancelStatic();stopIntro();ui();retry.hidden=false;message('3D paused by the browser. Your portrait remains available.');fallback();});
  on(canvas,'webglcontextrestored',function(){if(disposed)return;contextLost=false;failed=false;fallbackGeneration++;fallbackActive=false;firstPaint=false;neutral();size();if(canPaint())staticPaint();message('3D scene restored.');retry.hidden=true;});
  size();
 }
 async function loadModel(id){
  if(disposed||suspended)return;if(loaded===id&&ready&&!contextLost){ui();if(wantsReveal())staticPaint();return;}
  var ticket=++generation;if(abort)abort.abort();clearTimeout(timeout);loading=true;ready=false;firstPaint=false;fallbackActive=false;failed=false;fallbackGeneration++;ui();retry.hidden=true;message('Preparing '+names[id]+'… your portrait stays available.');
  timeout=setTimeout(function(){if(ticket!==generation)return;generation++;if(abort)abort.abort();loading=false;ready=false;failed=true;ui();retry.hidden=false;message('The 3D scene took too long. Try again; the portfolio is ready.');fallback();},15000);
  var next=null;
  try{
   if(!runtimePromise)runtimePromise=import(new URL('./vendor/hero-three.js',base).href).catch(function(e){runtimePromise=null;throw e;});
   T=await runtimePromise;if(ticket!==generation||disposed)return;
   var data=cache.get(id);if(!data){abort=new AbortController();stats.loads++;var response=await fetch(new URL('./models/'+id+'.model.json',base),{signal:abort.signal});if(!response.ok)throw Error('Model unavailable');data=await response.json();if(ticket!==generation||disposed||selected!==id)return;cache.set(id,data);}
   if(ticket!==generation||disposed)return;next=await decode(data);if(ticket!==generation||disposed||selected!==id){disposeMesh(next);return;}
   createRenderer();if(mesh){group.remove(mesh);disposeMesh(mesh);}mesh=next;next=null;group.add(mesh);loaded=id;ready=true;loading=false;clearTimeout(timeout);neutral();size();
   if(canPaint())paint(true);
   message(names[id]+' ready. Hover, focus or tap to reveal the real 3D model.');
   if(!introConsumed&&fine.matches&&active()&&inView&&!pinned&&!hovered&&!focused){introConsumed=true;intro=true;angleY=-.28;angleX=.04;animateTo(0,.07,1200);introTimer=setTimeout(function(){intro=false;ui();cancelAnimation();},2600);}
   else if(wantsReveal()){if(active()){angleY=-.18;animateTo(0,0,900);}else staticPaint();}
   ui();
  }catch(e){if(next)disposeMesh(next);if(ticket!==generation||disposed)return;clearTimeout(timeout);loading=false;ready=false;failed=true;cancelAnimation();ui();retry.hidden=false;message('3D is unavailable here. Your portrait and all project evidence still work.');fallback();}
 }
 async function fallback(){
  if(disposed||suspended||!wantsReveal()||(!failed&&!contextLost))return;
  var id=selected,ticket=++fallbackGeneration;
  try{var r=await fetch(new URL('./models/'+id+'.poster.json',base));if(!r.ok)return;var data=await r.json();
   var image=new Image();image.src=data.image;await image.decode();
   if(ticket!==fallbackGeneration||id!==selected||disposed||suspended||!wantsReveal()||(!failed&&!contextLost))return;
   poster.src=data.image;fallbackActive=true;ui();message(names[id]+' static preview. Interactive 3D is unavailable; your portfolio remains usable.');
  }catch(e){}
 }
 function ensure(){if(disposed||suspended)return;if(contextLost){fallback();return;}if(!loading&&(!ready||loaded!==selected))loadModel(selected);else if(ready&&wantsReveal()){if(!firstPaint)staticPaint();ui();}}
 function reveal(origin){if(disposed||forcedPortrait)return;ensure();if(ready&&active()){angleY=origin==='hover'?-.12:angleY;animateTo(0,0,800);}else if(ready)staticPaint();ui();}
 function cancelWarm(){if(!idle)return;if(window.cancelIdleCallback)cancelIdleCallback(idle);else clearTimeout(idle);idle=0;}
 function warm(){if(idle||disposed||loading||ready||!inView||!fine.matches||!active()||(navigator.connection&&navigator.connection.saveData))return;var run=function(){idle=0;if(!disposed&&!loading&&!ready&&inView&&fine.matches&&active())ensure();};idle=window.requestIdleCallback?requestIdleCallback(run,{timeout:1000}):setTimeout(run,200);}
 on(button,'pointerenter',function(e){if(e.pointerType==='touch')return;hovered=true;forcedPortrait=false;stopIntro();if(active())reveal('hover');});
 on(button,'pointerleave',function(){hovered=false;targetX=targetY=0;button.style.setProperty('--card-x','0deg');button.style.setProperty('--card-y','0deg');if(!pinned&&!focused){cancelAnimation();ui();}else if(active())animateTo(0,0);});
 on(button,'pointermove',function(e){if(!active()||!fine.matches||e.pointerType==='touch'||!inView)return;var r=button.getBoundingClientRect(),x=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1)),y=Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1));button.style.setProperty('--card-x',(-y*4)+'deg');button.style.setProperty('--card-y',(x*6)+'deg');if(ready&&wantsReveal())animateTo(-y*.08,x*.22,700);});
 on(button,'focus',function(){focused=true;forcedPortrait=false;stopIntro();if(active())reveal('focus');});
 on(button,'blur',function(){focused=false;if(!pinned&&!hovered){cancelAnimation();ui();}});
 on(button,'click',function(){
  if(disposed)return;stopIntro();fallbackGeneration++;fallbackActive=false;pinned=!pinned;forcedPortrait=!pinned;
  if(pinned)reveal('click');else cancelAnimation();ui();
 });
 on(owner,'keydown',function(e){if(e.key==='Escape'){pinned=false;forcedPortrait=true;fallbackGeneration++;fallbackActive=false;stopIntro();cancelAnimation();ui();message('Kartik portrait restored.');}});
 selects.forEach(function(b){on(b,'click',function(){
  if(disposed)return;stopIntro();fallbackGeneration++;fallbackActive=false;selected=b.dataset.character;pinned=true;forcedPortrait=false;
  if(loaded===selected&&ready&&!contextLost){ui();staticPaint();}else loadModel(selected);
 });});
 on(retry,'click',function(){if(contextLost){message('The graphics context is unavailable. Reload the page to retry.');return;}pinned=true;forcedPortrait=false;loadModel(selected);});
 function visibility(){if(document.hidden){cancelAnimation();cancelStatic();stopIntro();neutral();}else{refresh();if(inView)warm();}}
 on(document,'visibilitychange',visibility);
 function intersection(value){inView=value;owner.dataset.heroVisible=String(value);hero.dataset.heroVisible=String(value);if(disposed)return;if(!value){cancelWarm();cancelAnimation();cancelStatic();stopIntro();}else{if(dirty&&canPaint()){size();staticPaint();}refresh();warm();}}
 if('IntersectionObserver'in window){observer=new IntersectionObserver(function(entries){intersection(entries[0].isIntersecting);},{threshold:.05});observer.observe(owner);}else{var checkIntersectionFallback=function(){if(disposed)return;var r=owner.getBoundingClientRect();intersection(r.bottom>0&&r.top<innerHeight);};on(window,'scroll',checkIntersectionFallback,{passive:true});on(window,'resize',checkIntersectionFallback);checkIntersectionFallback();}
 if('ResizeObserver'in window){resizeObserver=new ResizeObserver(size);resizeObserver.observe(button);}else on(window,'resize',size);
 if(M)unsubscribe=M.onChange(function(){cancelAnimation();if(!active()){stopIntro();neutral();if(canPaint()&&wantsReveal())staticPaint();}else warm();refresh();});
 on(window,'pagehide',function(e){suspended=true;generation++;if(abort)abort.abort();loading=false;cancelAnimation();cancelStatic();stopIntro();clearTimeout(timeout);if(!e.persisted)dispose();});
 on(window,'pageshow',function(){if(disposed)return;suspended=false;refresh();if(inView){if(pinned)ensure();else warm();}});
 function dispose(){if(disposed)return;disposed=true;fallbackGeneration++;owner.dataset.revealed='false';owner.dataset.fallback='false';cancelWarm();generation++;removers.splice(0).forEach(function(off){off();});if(abort)abort.abort();cancelAnimation();cancelStatic();clearTimeout(timeout);stopIntro();if(observer)observer.disconnect();if(resizeObserver)resizeObserver.disconnect();if(unsubscribe)unsubscribe();if(mesh)disposeMesh(mesh);if(renderer){renderer.dispose();renderer.domElement.remove();}renderer=null;mesh=null;scene=null;group=null;camera=null;ready=false;loading=false;fallbackActive=false;cache.clear();}
 window.PortfolioHero3D={state:function(){return {selected:selected,loaded:loaded,loading:loading,ready:ready,revealed:owner.dataset.revealed==='true',pinned:pinned,inView:inView,contextLost:contextLost,fallback:fallbackActive,disposed:disposed,animationPending:!!raf,staticPending:!!staticRaf,degraded:degraded,stats:JSON.parse(JSON.stringify(stats)),canvas:renderer?{width:renderer.domElement.width,height:renderer.domElement.height}:null};},dispose:dispose};
 ui();
})();
