/* Automatic-first arrival; browser autoplay policy remains authoritative. */
(function(){
 'use strict';
 var M=window.PortfolioMotion,$=function(s){return document.querySelector(s);};
 var audio=$('#portfolio-audio'),sound=$('#sound-toggle'),motion=$('#motion-toggle'),status=$('#xp-status');
 var volumeInput=$('#sound-volume'),generation=0,pending=false,soundOn=false,phase='idle',volume=.2;
 var builtInURL=null,loadPromise=null,initialAttempted=false,muted=false,suspended=false;
 try{muted=localStorage.getItem('kh-audio')==='off';}catch(e){}
 function remember(on){muted=!on;try{localStorage.setItem('kh-audio',on?'on':'off');}catch(e){}}
 function render(message){
  sound.setAttribute('aria-checked',String(soundOn));sound.setAttribute('aria-busy',String(pending));
  $('#sound-action').textContent=pending?'Cancel sound':soundOn?'Mute music':phase==='error'?'Retry sound':'Sound on';
  sound.title=pending?'Cancel music loading':soundOn?'Mute Pink Soldiers':'Play Pink Soldiers';
  sound.dataset.state=phase;if(message)status.textContent=message;
 }
 function stopSound(next){generation++;pending=false;soundOn=false;audio.pause();phase=next||'paused';render();}
 function loadTrack(){
  if(builtInURL)return Promise.resolve();if(loadPromise)return loadPromise;
  loadPromise=fetch(audio.dataset.src).then(function(r){if(!r.ok)throw Error('Track download failed');return r.text();}).then(function(text){
   var raw=atob(text.trim()),bytes=new Uint8Array(raw.length);for(var i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
   builtInURL=URL.createObjectURL(new Blob([bytes],{type:'audio/mpeg'}));audio.src=builtInURL;
  }).catch(function(e){loadPromise=null;throw e;});return loadPromise;
 }
 function startSound(origin){
  if(document.hidden||suspended||pending||soundOn)return;
  var ticket=++generation;pending=true;phase='loading';render(origin==='auto'?'Preparing background music.':'Starting background music.');
  audio.volume=volume;
  function play(){if(ticket!==generation||document.hidden||muted)return;return audio.play();}
  var attempt;
  // A ready source calls play synchronously during the Sound on gesture (Safari included).
  try{attempt=builtInURL?play():loadTrack().then(play);}catch(e){attempt=Promise.reject(e);}
  Promise.resolve(attempt).then(function(){
   if(ticket!==generation)return;
   if(document.hidden||suspended||muted||audio.paused||audio.muted||volume===0){stopSound(muted?'muted':'paused');return;}
   pending=false;soundOn=true;phase='playing';render('Pink Soldiers is playing. Use Mute music to stop.');
  }).catch(function(e){
   if(ticket!==generation)return;
   stopSound(e&&e.name==='NotAllowedError'?'blocked':'error');
   render(phase==='blocked'?'Your browser requires a tap. Choose Sound on to play Pink Soldiers.':'Music could not start. Choose Retry sound to try again.');
  });
 }
 sound.addEventListener('click',function(){
  if(soundOn||pending){remember(false);stopSound('muted');render('Music muted. Your choice is remembered.');}
  else{remember(true);if(volume===0){volume=.2;audio.volume=volume;volumeInput.value='20';$('#volume-output').textContent='20%';}startSound('user');}
 });
 volumeInput.addEventListener('input',function(){volume=Number(this.value)/100;audio.volume=volume;$('#volume-output').textContent=this.value+'%';if(volume===0){remember(false);stopSound('muted');render('Music muted at zero volume.');}});
 audio.addEventListener('error',function(){stopSound('error');render('This audio could not be played. Choose Retry sound to try again.');});
 if(M){
  M.onChange(function(s){
   motion.setAttribute('aria-checked',String(s.enabled&&!s.systemReduced));motion.disabled=s.systemReduced;
   $('#motion-action').textContent=s.systemReduced?'Reduced motion':s.enabled?'Pause motion':'Resume motion';
   motion.title=s.systemReduced?'Your device requests reduced motion':s.enabled?'Pause decorative motion':'Resume decorative motion';
  });
  motion.addEventListener('click',function(){M.setEnabled(!M.state().enabled);status.textContent=M.state().enabled?'Motion resumed.':'Motion paused. All project content remains available.';});
 }else{motion.disabled=true;$('#motion-action').textContent='Motion unavailable';}
 function arrival(){if(initialAttempted)return;initialAttempted=true;if(document.hidden){phase='paused';render();return;}if(muted){phase='muted';render('Music is muted by your saved preference.');}else startSound('auto');}
 document.addEventListener('visibilitychange',function(){if(document.hidden)stopSound(muted?'muted':'paused');else render();});
 window.addEventListener('pagehide',function(){suspended=true;stopSound(muted?'muted':'paused');});
 window.addEventListener('pageshow',function(){suspended=false;render();});
 audio.addEventListener('volumechange',function(){if(audio.muted&&soundOn){stopSound('paused');render('Music was muted by your browser.');}});
 audio.addEventListener('pause',function(){if(audio.paused&&!pending&&soundOn){stopSound('paused');render('Music paused. Choose Sound on to resume.');}});
 audio.addEventListener('playing',function(){if(document.hidden||suspended||muted||(!pending&&!soundOn))audio.pause();});
 window.addEventListener('storage',function(e){if(e.key==='kh-audio'&&e.newValue==='off'){muted=true;stopSound('muted');render('Music muted in another tab.');}});
 window.PortfolioExperience={stopSound:stopSound,state:function(){return {playMode:true,soundOn:soundOn,track:'Pink Soldiers',paused:audio.paused,pending:pending,phase:phase,muted:muted,volume:volume};}};
 // Header controls occupy a reserved band; native focus scrolling needs no corrective jump.
 render();arrival();
})();
(function(){
 var M=window.PortfolioMotion||{state:function(){return {active:false};},onChange:function(fn){fn({active:false});}},gate=document.querySelector('.human-gate');if(!gate)return;
 var project=gate.closest('.proj'),button=gate.querySelector('.gate-continue'),status=gate.querySelector('.gate-status'),phase=1,timer=null;
 function render(){gate.querySelectorAll('[data-stage]').forEach(function(e){e.classList.toggle('current',Number(e.dataset.stage)===phase);});status.textContent=phase===1?'Waiting at the human gate.':phase===2?'Illustrated execution—no real action is running.':'Illustrated receipt inspection—no verification was run.';button.firstChild.textContent=phase===1?'Continue illustration ':'Replay illustration ';}
 function finish(){clearTimeout(timer);timer=null;phase=3;render();}
 button.addEventListener('click',function(){if(phase!==1){clearTimeout(timer);phase=1;render();return;}phase=2;render();if(M.state().active)timer=setTimeout(finish,450);else finish();});
 M.onChange(function(s){if(!s.active&&phase===2)finish();});
 project.querySelector('.proj-head').addEventListener('click',function(){if(!project.classList.contains('open')){clearTimeout(timer);timer=null;phase=1;render();}});
})();
