/* Three locations, one renderer. Posters are immediate; geometry is on demand. */
(function(){
 'use strict';
 var script=document.currentScript,base=new URL('.',script.src),M=window.PortfolioMotion;
 if(window.CSS&&typeof CSS.registerProperty==='function')document.documentElement.classList.add('iris-motion-ready');
 var fine=matchMedia('(hover:hover) and (pointer:fine)'),removers=[],disposed=false,suspended=false,frame=0,epoch=0,abort=null,timer=0;
 var T=null,runtime=null,renderer=null,scene=null,camera=null,group=null,active=null,attached=null,lost=false;
 var dataCache=new Map(),meshCache=new Map(),resize=null,observer=null,unsubscribe=null,lastSize='',degraded=false;
 var hero=document.getElementById('hero-identity'),heroButton=document.getElementById('portrait-reveal'),heroLabel=document.getElementById('identity-label');
 var helper=document.getElementById('identity-help');
 var portraitPinned=false,hovered=false,focused=false,forcedMask=false,portrait=false,pointerX=-1,pointerY=-1;
 var stats={rendererCreations:0,renders:0,loads:0,aborts:0,handoffs:0,frames:0,drawCalls:0,triangles:0,maxRenderMs:0};
 var records=Array.from(document.querySelectorAll('.character-stage')).map(function(node){return {id:node.id,node:node,character:node.dataset.character,full:node.dataset.framing==='full',viewport:node.querySelector('.stage-visual,.identity-aperture'),surface:node.querySelector('.stage-surface'),status:node.querySelector('.stage-status'),enable:node.querySelector('.stage-enable'),turn:node.querySelector('.stage-turn'),retry:node.querySelector('.stage-retry'),visible:false,userEnabled:false,loading:false,failed:false,painted:false,progress:.5,paintKey:'',x:0,y:0,turned:false,quarter:0,angle:0};});
 if(!records.length)return;
 function on(target,type,fn,options){target.addEventListener(type,fn,options);removers.push(function(){target.removeEventListener(type,fn,options);});}
 function motion(){return !!(M&&M.state().active);}
 function auto(){return motion()&&!(navigator.connection&&navigator.connection.saveData);}
 function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
 function text(rec,value){if(!disposed&&rec.status.textContent!==value)rec.status.textContent=value;}
 function live(rec,value){rec.painted=value;rec.node.dataset.live=String(value);}
 function showFailure(rec){rec.failed=true;live(rec,false);text(rec,'Static preview · choose Retry 3D');if(rec.retry){rec.retry.hidden=false;if(rec.turn)rec.turn.disabled=true;}if(rec.enable){rec.enable.textContent='Retry 3D';rec.enable.setAttribute('aria-pressed','false');}}
 function syncHero(){
  if(disposed)return;portrait=!forcedMask&&(portraitPinned||hovered||focused);hero.dataset.portrait=String(portrait);
  heroButton.setAttribute('aria-pressed',String(portraitPinned));heroButton.setAttribute('aria-label',portraitPinned?'Restore Front Man mask':"Reveal Kartik's portrait");
  heroLabel.textContent=portrait?'Kartik Hulmukh':'Front Man';helper.textContent=portrait?(portraitPinned?(fine.matches?'Portrait pinned · click to restore':'Tap to restore mask'):(fine.matches?(focused&&!hovered?'Enter to keep · Escape to restore':'Click to keep · leave to restore'):'Tap to restore mask')):(fine.matches?'Hover or focus to meet Kartik':'Tap to meet Kartik');
  if(portrait)text(records[0],'Portrait revealed');else text(records[0],records[0].painted?'Live 3D mask':'Character study');schedule();
 }
 function bytes(str){var raw=atob(str),out=new Uint8Array(raw.length);for(var i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out;}
 async function decode(data){
  if(data.format!=='squid-quantized-mesh-v1'||data.vertexCount>65000||data.triangleCount>80000)throw Error('Unsupported model');
  var packed=JSON.parse(T.strFromU8(T.gunzipSync(bytes(data.geometry))));
  var p=new Int16Array(bytes(packed.positions).buffer),n=new Int8Array(bytes(packed.normals).buffer),uv=new Uint16Array(bytes(packed.uvs).buffer),ix=new Uint16Array(bytes(packed.indices).buffer),lo=data.bounds.min,hi=data.bounds.max;
  if(p.length!==data.vertexCount*3||n.length!==p.length||uv.length!==data.vertexCount*2||ix.length!==data.triangleCount*3||!lo.concat(hi).every(Number.isFinite))throw Error('Invalid mesh buffers');
  for(var k=0;k<ix.length;k++)if(ix[k]>=data.vertexCount)throw Error('Invalid mesh index');
  var positions=new Float32Array(p.length);for(var i=0;i<p.length;i++){var c=i%3;positions[i]=lo[c]+(p[i]/32767+1)*.5*(hi[c]-lo[c]);}
  var geometry=new T.BufferGeometry(),texture=null;geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('normal',new T.BufferAttribute(n,3,true));geometry.setAttribute('uv',new T.BufferAttribute(uv,2,true));geometry.setIndex(new T.BufferAttribute(ix,1));geometry.computeBoundingSphere();
  try{texture=await new T.TextureLoader().loadAsync(data.texture);texture.colorSpace=T.SRGBColorSpace;texture.flipY=data.textureFlipY;texture.anisotropy=1;return new T.Mesh(geometry,new T.MeshStandardMaterial({map:texture,roughness:data.material.roughness,metalness:data.material.metalness}));}
  catch(e){geometry.dispose();if(texture)texture.dispose();throw e;}
 }
 function disposeMesh(mesh){mesh.geometry.dispose();if(mesh.material.map)mesh.material.map.dispose();mesh.material.dispose();}
 function createRenderer(){
  if(renderer)return;var canvas=document.createElement('canvas');canvas.id='portfolio-stage-canvas';canvas.setAttribute('aria-hidden','true');
  renderer=new T.WebGLRenderer({canvas:canvas,alpha:true,antialias:true,powerPreference:'low-power'});stats.rendererCreations++;
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;renderer.setClearColor(0x000000,0);
  scene=new T.Scene();camera=new T.PerspectiveCamera(28,1,.1,50);group=new T.Group();scene.add(group);scene.add(new T.HemisphereLight(0xe8efff,0x858099,2));
  [[0xffffff,4,3,4,5],[0xe65a89,2,-3,2,1],[0xb2d5ff,4,2,3,-4]].forEach(function(l){var light=new T.DirectionalLight(l[0],l[1]);light.position.set(l[2],l[3],l[4]);scene.add(light);});
  on(canvas,'webglcontextlost',function(e){e.preventDefault();lost=true;cancelLoad();records.forEach(function(r){live(r,false);text(r,'Static preview · 3D temporarily unavailable');});});
  on(canvas,'webglcontextrestored',function(){if(disposed)return;lost=false;lastSize='';records.forEach(function(r){r.failed=false;});schedule();});
 }
 function eligible(rec){return rec.visible&&!(rec.node===hero&&portrait)&&(auto()||rec.userEnabled);}
 function valid(rec,ticket){return !disposed&&!suspended&&!document.hidden&&!lost&&ticket===epoch&&active===rec&&eligible(rec);}
 function cancelLoad(){epoch++;if(abort){abort.abort();abort=null;stats.aborts++;}clearTimeout(timer);timer=0;records.forEach(function(r){if(r.loading&&r.retry&&r.turn&&r.turn.disabled){r.retry.hidden=false;text(r,'Static preview · choose Retry 3D');}r.loading=false;});}
 function attach(rec){
  if(!renderer||!meshCache.has(rec.character))return;
  if(attached!==rec){if(attached)live(attached,false);if(group.children.length)group.remove(group.children[0]);group.add(meshCache.get(rec.character));rec.surface.appendChild(renderer.domElement);attached=rec;rec.paintKey='';stats.handoffs++;lastSize='';}
 }
 function render(rec){
  if(disposed||suspended||document.hidden||lost||active!==rec||!eligible(rec)||!renderer||!meshCache.has(rec.character))return;
  attach(rec);var rect=rec.viewport.getBoundingClientRect();if(rect.width<1||rect.height<1)return;
  var dpr=degraded?1:Math.min(devicePixelRatio||1,fine.matches?1.5:1.25),key=[rect.width,rect.height,dpr,rec.full].join(':');
  if(key!==lastSize){renderer.setPixelRatio(dpr);renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.position.set(0,rec.full?0:.5,rec.full?5.65:2.4);camera.lookAt(0,rec.full?0:.5,0);camera.updateProjectionMatrix();lastSize=key;}
  rec.angle=(rec.full?rec.quarter*Math.PI/2:0)+(motion()&&rec.full?clamp((rec.progress-.5)*.5+rec.x*.2,-.4,.4):0);
  var pitch=motion()?-rec.y*.08:0,paintKey=key+':'+pitch.toFixed(4)+':'+rec.angle.toFixed(4);
  if(rec.painted&&rec.paintKey===paintKey)return;rec.paintKey=paintKey;
  group.rotation.set(pitch,rec.angle,0);var start=performance.now();renderer.render(scene,camera);var ms=performance.now()-start;
  stats.renders++;stats.maxRenderMs=Math.max(stats.maxRenderMs,ms);stats.drawCalls=renderer.info.render.calls;stats.triangles=renderer.info.render.triangles;
  if(stats.renders>8&&ms>28&&!degraded){degraded=true;lastSize='';}
  live(rec,true);text(rec,rec.full&&rec.quarter?((motion()?'Live':'Static')+' 3D · '+(rec.quarter*90)+'° view'):rec.full&&rec.viewport.clientWidth<220?(motion()?'Live 3D':'Static 3D view'):(motion()?(rec.full?(fine.matches?'Live 3D · scroll or hover':'Live 3D · scroll to turn'):'Live 3D mask'):'Static 3D view · motion is paused'));
  if(rec.retry)rec.retry.hidden=true;if(rec.turn)rec.turn.disabled=false;if(rec.enable){rec.enable.textContent='3D enabled';rec.enable.setAttribute('aria-pressed','true');}
 }
 async function load(rec){
  if(rec.loading||rec.failed||lost)return;var ticket=epoch;rec.loading=true;text(rec,rec.full&&rec.viewport.clientWidth<220?'Preparing 3D':'Preparing 3D · preview stays visible');var next=null;
  timer=setTimeout(function(){if(!valid(rec,ticket))return;cancelLoad();showFailure(rec);},12000);
  try{
   if(!runtime)runtime=import(new URL('./vendor/hero-three.js',base).href).catch(function(e){runtime=null;throw e;});T=await runtime;if(!valid(rec,ticket))return;
   var data=dataCache.get(rec.character);if(!data){abort=new AbortController();stats.loads++;var response=await fetch(new URL('./models/'+rec.character+'.model.json',base),{signal:abort.signal});if(!response.ok)throw Error('Model unavailable');data=await response.json();if(!valid(rec,ticket))return;dataCache.set(rec.character,data);}
   if(!valid(rec,ticket))return;next=await decode(data);if(!valid(rec,ticket)){disposeMesh(next);next=null;return;}
   meshCache.set(rec.character,next);next=null;rec.loading=false;clearTimeout(timer);timer=0;abort=null;createRenderer();render(rec);
  }catch(e){if(next)disposeMesh(next);if(!renderer&&meshCache.has(rec.character)){disposeMesh(meshCache.get(rec.character));meshCache.delete(rec.character);}if(disposed||ticket!==epoch||active!==rec)return;clearTimeout(timer);timer=0;abort=null;rec.loading=false;showFailure(rec);}
 }
 function tick(){
  frame=0;if(disposed||suspended||document.hidden)return;stats.frames++;var header=clamp(document.querySelector('.nav').getBoundingClientRect().bottom,0,innerHeight),center=(innerHeight+header)/2,candidate=null,score=Infinity;
  records.forEach(function(rec){var r=rec.viewport.getBoundingClientRect();rec.visible=r.bottom>header&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;rec.node.dataset.visible=String(rec.visible);rec.progress=clamp((innerHeight-r.top)/(innerHeight+r.height),0,1);
   if(rec.full){rec.node.style.setProperty('--poster-turn',motion()?((rec.progress-.5)*18+rec.x*7)+'deg':'0deg');rec.node.style.setProperty('--stage-lift',motion()?((.5-rec.progress)*12)+'px':'0px');rec.node.style.setProperty('--ring-turn',motion()?(-25+rec.progress*50)+'deg':'0deg');}
   if(eligible(rec)){var distance=Math.abs((Math.max(r.top,header)+Math.min(r.bottom,innerHeight))/2-center);if(distance<score){candidate=rec;score=distance;}}
  });
  var marquee=document.querySelector('.marq');if(marquee){var mr=marquee.getBoundingClientRect();marquee.dataset.visible=String(mr.bottom>header&&mr.top<innerHeight);}
  if(candidate!==active){cancelLoad();if(active){live(active,false);if(!active.failed)text(active,active.node===hero&&portrait?'Portrait revealed':(!motion()?'Static preview · motion paused':'Character study'));}active=candidate;}
  if(!active||lost)return;if(meshCache.has(active.character)){render(active);}else if(!active.failed&&!active.loading)load(active);
 }
 function schedule(){if(disposed||suspended||document.hidden||frame)return;frame=requestAnimationFrame(tick);}
 function enable(rec){if(disposed)return;rec.userEnabled=true;rec.failed=false;if(rec.retry)rec.retry.hidden=true;if(rec.enable){rec.enable.setAttribute('aria-pressed','true');rec.enable.textContent='Enable 3D';}schedule();}
 function resetIdentityDepth(){['--identity-x','--identity-y','--identity-rx','--identity-ry'].forEach(function(k){hero.style.removeProperty(k);});}
 function setRevealOrigin(e){var r=heroButton.getBoundingClientRect();if(!r.width||!r.height)return;hero.style.setProperty('--cut-x',(clamp((e.clientX-r.left)/r.width,0,1)*100).toFixed(1)+'%');hero.style.setProperty('--cut-y',(clamp((e.clientY-r.top)/r.height,0,1)*100).toFixed(1)+'%');}
 on(heroButton,'pointermove',function(e){
  pointerX=e.clientX;pointerY=e.clientY;
  if(fine.matches&&e.pointerType!=='touch'&&!hovered&&!forcedMask){hovered=true;syncHero();}
  if(!motion()||!fine.matches||e.pointerType==='touch'){resetIdentityDepth();return;}
  var r=heroButton.getBoundingClientRect(),x=clamp((e.clientX-r.left)/r.width*2-1,-1,1),y=clamp((e.clientY-r.top)/r.height*2-1,-1,1);
  hero.style.setProperty('--identity-x',(x*3).toFixed(2)+'px');hero.style.setProperty('--identity-y',(y*2).toFixed(2)+'px');hero.style.setProperty('--identity-rx',(-y*2).toFixed(2)+'deg');hero.style.setProperty('--identity-ry',(x*3).toFixed(2)+'deg');
 });
 on(heroButton,'pointerleave',resetIdentityDepth);
 on(heroButton,'pointerenter',function(e){if(e.pointerType==='touch'||!fine.matches)return;pointerX=e.clientX;pointerY=e.clientY;setRevealOrigin(e);hovered=true;forcedMask=false;syncHero();});
 on(heroButton,'pointerleave',function(){hovered=false;syncHero();});
 on(heroButton,'focus',function(){if(!hovered){hero.style.setProperty('--cut-x','50%');hero.style.setProperty('--cut-y','50%');}focused=true;forcedMask=false;syncHero();});
 on(heroButton,'blur',function(){focused=false;syncHero();});
 on(heroButton,'click',function(e){if(e.detail>0&&!portraitPinned&&!hovered)setRevealOrigin(e);portraitPinned=!portraitPinned;forcedMask=!portraitPinned;syncHero();});
 on(document,'keydown',function(e){if(e.key==='Escape'&&portrait&&!e.defaultPrevented){portraitPinned=false;forcedMask=true;syncHero();}});
 records.forEach(function(rec){
  if(rec.enable)on(rec.enable,'click',function(){enable(rec);});
  if(rec.retry)on(rec.retry,'click',function(){enable(rec);});
  if(rec.turn){
   rec.turn.textContent='Turn 90° ↗';rec.turn.removeAttribute('aria-pressed');rec.turn.setAttribute('aria-label','Turn '+rec.character.replace('-',' ')+' model by 90 degrees');
   on(rec.turn,'click',function(){rec.quarter=(rec.quarter+1)%4;rec.turned=rec.quarter!==0;rec.turn.setAttribute('aria-label','Turn '+rec.character.replace('-',' ')+' model by 90 degrees; requested view '+(rec.quarter*90)+' degrees');enable(rec);});
  }
  if(rec.full){on(rec.viewport,'pointermove',function(e){if(!motion()||!fine.matches||e.pointerType==='touch')return;var r=rec.viewport.getBoundingClientRect();rec.x=clamp((e.clientX-r.left)/r.width*2-1,-1,1);rec.y=clamp((e.clientY-r.top)/r.height*2-1,-1,1);schedule();});on(rec.viewport,'pointerleave',function(){rec.x=rec.y=0;schedule();});}
 });
 on(fine,'change',function(){hovered=false;resetIdentityDepth();syncHero();schedule();});
 on(window,'scroll',function(){
  // A stationary pointer can outlive its hover target during native scrolling.
  if(hovered){var r=heroButton.getBoundingClientRect();if(pointerX<r.left||pointerX>r.right||pointerY<r.top||pointerY>r.bottom){hovered=false;resetIdentityDepth();syncHero();}}
  schedule();
 },{passive:true});on(window,'resize',schedule,{passive:true});
 if('IntersectionObserver'in window){observer=new IntersectionObserver(schedule,{threshold:0});records.forEach(function(r){observer.observe(r.viewport);});}
 if('ResizeObserver'in window){resize=new ResizeObserver(schedule);records.forEach(function(r){resize.observe(r.viewport);});resize.observe(document.getElementById('main'));}
 if(M)unsubscribe=M.onChange(function(){if(disposed)return;resetIdentityDepth();cancelLoad();if(document.hidden)return;records.forEach(function(r){r.x=r.y=0;});schedule();});
 on(document,'visibilitychange',function(){if(document.hidden){hovered=false;focused=false;resetIdentityDepth();syncHero();if(frame)cancelAnimationFrame(frame);frame=0;cancelLoad();records.forEach(function(r){live(r,false);});}else schedule();});
 on(window,'pagehide',function(e){resetIdentityDepth();suspended=true;if(frame)cancelAnimationFrame(frame);frame=0;cancelLoad();records.forEach(function(r){live(r,false);});if(!e.persisted)dispose();});
 on(window,'pageshow',function(e){if(disposed)return;suspended=false;if(e.persisted){hovered=false;focused=false;portraitPinned=false;forcedMask=false;syncHero();}schedule();});
 function dispose(){if(disposed)return;resetIdentityDepth();disposed=true;if(frame)cancelAnimationFrame(frame);frame=0;cancelLoad();removers.splice(0).forEach(function(off){off();});if(observer)observer.disconnect();if(resize)resize.disconnect();if(unsubscribe)unsubscribe();records.forEach(function(r){live(r,false);});meshCache.forEach(disposeMesh);meshCache.clear();dataCache.clear();if(renderer){renderer.dispose();renderer.domElement.remove();}renderer=null;scene=null;group=null;camera=null;active=null;attached=null;}
 window.PortfolioStages={state:function(){return {active:active?active.id:null,portrait:portrait,portraitPinned:portraitPinned,contextLost:lost,disposed:disposed,suspended:suspended,pending:!!frame,degraded:degraded,meshCache:meshCache.size,dataCache:dataCache.size,stats:JSON.parse(JSON.stringify(stats)),stages:records.map(function(r){return {id:r.id,character:r.character,full:r.full,visible:r.visible,loading:r.loading,loaded:meshCache.has(r.character),live:r.painted,userEnabled:r.userEnabled,failed:r.failed,angle:r.angle,quarter:r.quarter,progress:r.progress};})};},dispose:dispose};
 document.documentElement.classList.add('stage-ready');
 syncHero();
 schedule();
})();
