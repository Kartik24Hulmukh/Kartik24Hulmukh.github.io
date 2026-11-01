/* Progressive emphasis, not a reading gate. Native scroll and stable targets. */
(function () {
 'use strict';
 var M=window.PortfolioMotion,wordsRoot=document.getElementById('words'),marq=document.getElementById('marq');
 var words=[],frame=0,lastY=scrollY,lastTime=performance.now(),skew=0,skewTime=performance.now(),disposed=false,removers=[];
 function on(n,t,f,o){if(!n)return;n.addEventListener(t,f,o);removers.push(function(){n.removeEventListener(t,f,o);});}
 function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
 function active(){return !!(M&&M.state().active&&!document.hidden);}
 function collect(){words=wordsRoot?Array.from(wordsRoot.querySelectorAll('.w')):[];}
 function reset(){skew=0;if(marq)marq.style.setProperty('--skew','0deg');words.forEach(function(w){w.classList.remove('scroll-lit');});lastY=scrollY;lastTime=performance.now();}
 function paint(){
  frame=0;if(disposed)return;if(!active()){reset();return;}
  if(!words.length)collect();
  if(wordsRoot&&words.length){var r=wordsRoot.getBoundingClientRect(),p=clamp((innerHeight*.82-r.top)/Math.max(1,r.height+innerHeight*.45),0,1),lit=Math.round(p*words.length);words.forEach(function(w,i){w.classList.toggle('scroll-lit',i<lit);});}
  if(marq){var mr=marq.getBoundingClientRect();if(mr.bottom>0&&mr.top<innerHeight){var now=performance.now();skew*=Math.exp(-(now-skewTime)/110);skewTime=now;if(Math.abs(skew)<.025)skew=0;marq.style.setProperty('--skew',skew.toFixed(3)+'deg');}else{skew=0;marq.style.setProperty('--skew','0deg');}}
  if(skew)schedule();
 }
 function schedule(){if(!disposed&&!frame&&!document.hidden)frame=requestAnimationFrame(paint);}
 function scroll(){var now=performance.now(),y=scrollY,dy=y-lastY,dt=clamp(now-lastTime,16,80);if(active()&&Math.abs(dy)<innerHeight*.8)skew=clamp(dy/dt*1.2,-3,3);skewTime=now;lastY=y;lastTime=now;schedule();}
 collect();var observer=wordsRoot&&new MutationObserver(function(){collect();schedule();});if(observer)observer.observe(wordsRoot,{childList:true,subtree:true});
 on(window,'scroll',scroll,{passive:true});on(window,'resize',schedule,{passive:true});
 var unsubscribe=M&&M.onChange(function(){if(frame)cancelAnimationFrame(frame);frame=0;reset();schedule();});
 on(document,'visibilitychange',function(){if(frame)cancelAnimationFrame(frame);frame=0;reset();if(!document.hidden)schedule();});
 on(window,'pagehide',function(e){if(frame)cancelAnimationFrame(frame);frame=0;reset();if(!e.persisted){disposed=true;if(observer)observer.disconnect();if(unsubscribe)unsubscribe();removers.splice(0).forEach(function(off){off();});}});
 on(window,'pageshow',function(){reset();schedule();});schedule();
})();
