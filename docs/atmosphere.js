/* Contour field adapted from the user-supplied Portfolio.html, not a replacement gradient.
   Native input only. Finite 24fps response bursts; no unbounded ambient render loop. */
(function(){
 'use strict';
 var cv=document.getElementById('gl'),M=window.PortfolioMotion;
 if(!cv)return;
 var fine=matchMedia('(hover:hover) and (pointer:fine)'),gl=null,program=null,buffer=null,vs=null,fs=null,u={},off=[];
 var dead=false,suspended=false,lost=false,failed=false,frame=0,wakeTimer=0,until=0,lastPaint=-1000,visible=true;
 var phase=11.0,px=innerWidth*.72,py=innerHeight*.38,x=px,y=py,scroll=0,evidence=0,lastInput=0;
 var stats={contexts:0,renders:0,bursts:0,maxDrawMs:0},observer=null,unsubscribe=null;
 var work=document.getElementById('work'),main=document.getElementById('main'),lastWidth=0,lastHeight=0;
 var vertex='attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}';
 var fragment=[
  'precision mediump float;',
  'uniform vec2 r;uniform float t;uniform vec2 m;uniform float s;uniform float e;',
  'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
  'float n(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.0-2.0*f);',
  'return mix(mix(h(i),h(i+vec2(1.0,0.0)),u.x),mix(h(i+vec2(0.0,1.0)),h(i+vec2(1.0,1.0)),u.x),u.y);}',
  'float fbm(vec2 p){float v=0.0;float a=0.5;mat2 R=mat2(0.8,0.6,-0.6,0.8);',
  'for(int i=0;i<5;i++){v+=a*n(p);p=R*p*2.02;a*=0.5;}return v;}',
  'void main(){',
  'vec2 p=(gl_FragCoord.xy-0.5*r)/r.y;',
  'vec2 mm=(m-0.5*r)/r.y;',
  'float lens=1.0-smoothstep(0.0,0.42,length(p-mm));',
  'float T=t*0.04;',
  'vec2 q=vec2(fbm(p*1.4+T),fbm(p*1.4-T+5.2));',
  'vec2 w=vec2(fbm(p*1.4+3.0*q+vec2(1.7,9.2)+T*1.3),fbm(p*1.4+3.0*q+vec2(8.3,2.8)-T));',
  'float f=fbm(p*1.4+3.0*w-(p-mm)*lens*0.9);',
  'float g=abs(fract(f*(9.0+e*7.0)-t*0.015)-0.5);',
  'float c=1.0-smoothstep(0.0,0.045,g);',
  'vec3 ink=vec3(0.051,0.051,0.047);',
  'vec3 paper=vec3(0.925,0.91,0.875);',
  'vec3 pink=vec3(0.94,0.353,0.58);',
  'vec3 teal=vec3(0.392,0.776,0.702);',
  'float fade=1.0-clamp(s,0.0,1.0)*0.55;',
  'vec3 col=ink;',
  'col+=paper*c*0.09*fade*(1.0-lens);',
  'col+=mix(paper,pink,0.85)*c*0.46*lens;',
  'col+=teal*c*0.035*(1.0-lens)*fade;',
  'col+=paper*pow(f,3.0)*0.05;',
  'col+=(h(gl_FragCoord.xy+fract(t)*100.0)-0.5)*0.025;',
  'col*=mix(0.72,1.0,1.0-smoothstep(0.25,1.25,length(p)));',
  'col=min(col,vec3(0.38,0.23,0.31));',
  'gl_FragColor=vec4(col,1.0);}'
 ].join('\n');
 function on(o,k,f,opt){o.addEventListener(k,f,opt);off.push(function(){o.removeEventListener(k,f,opt);});}
 function motion(){return !!(M&&M.state().active);}
 function canDraw(){return !dead&&!suspended&&!document.hidden&&!lost&&!failed&&visible&&gl&&program;}
 function scene(){
  var r=work&&work.getBoundingClientRect(),header=document.querySelector('.nav');
  var top=header?Math.max(0,Math.min(innerHeight,header.getBoundingClientRect().bottom)):0;
  visible=!(r&&r.top<=top&&r.bottom>=innerHeight);
  cv.dataset.fieldVisible=String(visible);
  scroll=Math.max(0,scrollY/Math.max(1,innerHeight));
  evidence=document.body.classList.contains('ev')?1:0;
 }
 function cancel(){if(frame)cancelAnimationFrame(frame);frame=0;if(wakeTimer)clearTimeout(wakeTimer);wakeTimer=0;until=0;}
 function shader(type,source){var q=gl.createShader(type);gl.shaderSource(q,source);gl.compileShader(q);if(!gl.getShaderParameter(q,gl.COMPILE_STATUS)){gl.deleteShader(q);throw Error('Contour shader unavailable');}return q;}
 function build(){
  vs=shader(gl.VERTEX_SHADER,vertex);fs=shader(gl.FRAGMENT_SHADER,fragment);program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Contour program unavailable');
  gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  var a=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  ['r','t','m','s','e'].forEach(function(k){u[k]=gl.getUniformLocation(program,k);});lastWidth=lastHeight=0;
 }
 function size(){
  if(!gl||lost)return;
  var low=!fine.matches||(navigator.connection&&navigator.connection.saveData);
  var scale=Math.min(.85,(low?700:1000)/Math.max(innerWidth,innerHeight),Math.sqrt((low?180000:450000)/Math.max(1,innerWidth*innerHeight)));
  var w=Math.max(1,Math.round(innerWidth*scale)),h=Math.max(1,Math.round(innerHeight*scale));
  if(w!==lastWidth||h!==lastHeight){cv.width=w;cv.height=h;gl.viewport(0,0,w,h);lastWidth=w;lastHeight=h;}
 }
 function paint(now,advance){
  if(!canDraw())return;
  var dt=Math.min(.08,Math.max(0,(now-lastPaint)/1000));lastPaint=now;
  if(advance){phase+=dt;x+=(px-x)*.28;y+=(py-y)*.28;}
  var start=performance.now();size();gl.useProgram(program);
  gl.uniform2f(u.r,cv.width,cv.height);gl.uniform1f(u.t,phase);gl.uniform2f(u.m,x*cv.width/Math.max(1,innerWidth),(innerHeight-y)*cv.height/Math.max(1,innerHeight));
  gl.uniform1f(u.s,scroll);gl.uniform1f(u.e,evidence);gl.drawArrays(gl.TRIANGLES,0,6);
  stats.renders++;stats.maxDrawMs=Math.max(stats.maxDrawMs,performance.now()-start);cv.classList.remove('nogl');cv.dataset.fieldReady='true';
 }
 function tick(now){
  frame=0;if(!canDraw())return;
  if(!motion()){paint(now,false);return;}
  if(now-lastPaint>=1000/24-1)paint(now,true);
  if(now<until)frame=requestAnimationFrame(tick);
 }
 function wake(duration){
  if(dead||suspended||document.hidden)return;scene();if(!canDraw()){cancel();return;}
  if(!motion())return;
  if(!frame)stats.bursts++;until=Math.max(until,performance.now()+(duration||900));lastInput=performance.now();if(!frame)frame=requestAnimationFrame(tick);
 }
 function refresh(){
  cancel();scene();if(!canDraw())return;
  if(motion())wake(900);else paint(performance.now(),false);
 }
 function fallback(){failed=true;cancel();cv.classList.add('nogl');cv.dataset.fieldReady='false';release();}
 function release(){if(!gl||lost)return;if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);if(vs)gl.deleteShader(vs);if(fs)gl.deleteShader(fs);buffer=program=vs=fs=null;}
 try{
  gl=cv.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power',depth:false,stencil:false});
  if(!gl)throw Error('WebGL unavailable');stats.contexts++;build();scene();paint(performance.now(),false);if(motion())wake(1400);
 }catch(e){fallback();}
 on(window,'pointermove',function(e){if(!motion()||!fine.matches||e.pointerType==='touch')return;px=e.clientX;py=e.clientY;wake(900);},{passive:true});
 on(window,'scroll',function(){if(dead)return;scene();if(!visible){cancel();return;}wake(900);},{passive:true});
 on(window,'resize',function(){px=Math.min(innerWidth,px);py=Math.min(innerHeight,py);if(!motion()){scene();paint(performance.now(),false);}else wake(900);},{passive:true});
 on(document,'visibilitychange',function(){if(document.hidden)cancel();else refresh();});
 on(document,'keydown',function(e){if((e.key==='e'||e.key==='E')&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!(e.target.isContentEditable||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)))wake(600);});
 on(cv,'webglcontextlost',function(e){e.preventDefault();lost=true;cancel();cv.classList.add('nogl');cv.dataset.fieldReady='false';});
 on(cv,'webglcontextrestored',function(){if(dead)return;try{lost=false;failed=false;build();refresh();}catch(e){fallback();}});
 on(window,'pagehide',function(e){suspended=true;cancel();if(!e.persisted)dispose();});
 on(window,'pageshow',function(){if(dead)return;suspended=false;refresh();});
 if('ResizeObserver'in window&&main){observer=new ResizeObserver(function(){scene();if(visible&&motion())wake(600);});observer.observe(main);}
 if(M)unsubscribe=M.onChange(refresh);
 function dispose(){if(dead)return;dead=true;cancel();off.splice(0).forEach(function(fn){fn();});if(observer)observer.disconnect();if(unsubscribe)unsubscribe();release();}
 window.PortfolioAtmosphere={state:function(){return {ready:!!program&&!failed&&!lost,failed:failed,contextLost:lost,visible:visible,active:motion(),pending:!!frame,disposed:dead,phase:phase,pointer:{x:x,y:y,targetX:px,targetY:py},scroll:scroll,evidence:evidence,size:{width:cv.width,height:cv.height},stats:JSON.parse(JSON.stringify(stats))};},dispose:dispose,
  snapshot:function(){scene();paint(performance.now(),false);return cv.toDataURL('image/png');}};
})();
