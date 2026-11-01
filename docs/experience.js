(function(){
 'use strict';
 var M=window.PortfolioMotion, $=function(s){return document.querySelector(s);};
 var toggle=$('#experience-toggle'),panel=$('#experience-panel'),close=$('#experience-close');
 var motion=$('#motion-toggle'),play=$('#play-toggle'),sound=$('#sound-toggle'),status=$('#xp-status');
 var custom=$('#custom-audio'),builtIn=$('#portfolio-audio'),audio=builtIn,audioURL=null,builtInURL=null,loadPromise=null,soundOn=false,playMode=false;
 var generation=0,pending=false,volume=.2;
 if(!M){toggle.hidden=true;return;}
 var volumeInput=$('#sound-volume');
 volumeInput.addEventListener('input',function(){volume=Number(this.value)/100;$('#volume-output').textContent=this.value+'%';if(audio)audio.volume=volume;});
 function report(text){status.textContent=text;position();}
 function position(){if(panel.hidden)return;var r=toggle.getBoundingClientRect(),gap=12;
  var width=panel.getBoundingClientRect().width;panel.style.left=Math.max(16,Math.min(innerWidth-width-16,r.right-width))+'px';
  var height=panel.getBoundingClientRect().height;panel.style.top=Math.max(16,Math.min(innerHeight-height-16,r.bottom+gap))+'px';}
 function open(){panel.hidden=false;toggle.setAttribute('aria-expanded','true');position();close.focus();}
 function shut(restore){panel.hidden=true;toggle.setAttribute('aria-expanded','false');if(restore)toggle.focus();}
 toggle.addEventListener('click',function(){panel.hidden?open():shut(true);});close.addEventListener('click',function(){shut(true);});
 document.addEventListener('pointerdown',function(e){if(!panel.hidden&&!panel.contains(e.target)&&!toggle.contains(e.target))shut(false);});
 document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!panel.hidden){e.preventDefault();shut(true);}});
 window.addEventListener('resize',position);document.addEventListener('focusin',function(e){if(!panel.hidden&&!panel.contains(e.target)&&e.target!==toggle)shut(false);});
 M.onChange(function(s){motion.setAttribute('aria-checked',String(s.enabled&&!s.systemReduced));motion.disabled=s.systemReduced;
  $('#motion-description').textContent=s.systemReduced?'Your system requests reduced motion. Backgrounds and decorative movement are paused.':'Pause backgrounds, animated type and decorative movement.';
  if(s.hidden&&soundOn)stopSound();position();});
 motion.addEventListener('click',function(){M.setEnabled(!M.state().enabled);report(M.state().enabled?'Motion enabled.':'Motion paused. All project content stays available.');});
 function setPlay(on){playMode=on;document.body.classList.toggle('play-mode',on);play.setAttribute('aria-checked',String(on));try{localStorage.setItem('kh-play',on?'on':'off');}catch(e){}}
 try{setPlay(localStorage.getItem('kh-play')==='on');}catch(e){setPlay(false);}
 play.addEventListener('click',function(){setPlay(!playMode);report(playMode?'Game-inspired geometry enabled. No copied show imagery is used.':'Original portfolio palette restored.');});
 function stopSound(){
  generation++;pending=false;soundOn=false;sound.setAttribute('aria-checked','false');sound.removeAttribute('aria-busy');
  audio.pause();
 }
 function loadBuiltIn(){
  if(builtInURL)return Promise.resolve();
  if(loadPromise)return loadPromise;
  // Same-origin lossless transport; fetched only after an explicit play request.
  loadPromise=fetch(builtIn.dataset.src).then(function(r){if(!r.ok)throw Error('Track download failed');return r.text();}).then(function(text){
   var raw=atob(text.trim()),bytes=new Uint8Array(raw.length);
   for(var i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
   builtInURL=URL.createObjectURL(new Blob([bytes],{type:'audio/mpeg'}));builtIn.src=builtInURL;
  }).catch(function(e){loadPromise=null;throw e;});return loadPromise;
 }
 function bindError(selected){selected.addEventListener('error',function(){if(selected!==audio)return;stopSound();report('This audio could not be played. Try again or choose another file.');});}
 bindError(builtIn);
 sound.addEventListener('click',function(){
  if(soundOn||pending){stopSound();report('Music paused.');return;}
  var selected=audio,ticket=++generation;pending=true;sound.setAttribute('aria-busy','true');
  report(selected===builtIn?'Loading Pink Soldiers…':'Starting your selected audio…');
  Promise.resolve(selected===builtIn?loadBuiltIn():undefined).then(function(){
   if(ticket!==generation||document.hidden||selected!==audio)return;
   selected.volume=volume;return selected.play();
  }).then(function(){
   if(ticket!==generation||document.hidden||selected!==audio)return;
   pending=false;soundOn=true;sound.removeAttribute('aria-busy');sound.setAttribute('aria-checked','true');
   report(selected===builtIn?'Pink Soldiers is playing.':'Your selected audio is playing locally.');
  }).catch(function(){if(ticket!==generation)return;stopSound();report('Playback could not start. Press the music control again, or choose a different file.');});
 });
 custom.addEventListener('change',function(){var f=custom.files&&custom.files[0];if(!f)return;
  if(!f.type.startsWith('audio/')&&!(/\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i.test(f.name)&&!f.type)){report('Choose a supported audio file.');custom.value='';return;}
  if(f.size>25*1024*1024){report('Choose an audio file smaller than 25 MB.');custom.value='';return;}
  stopSound();if(audioURL)URL.revokeObjectURL(audioURL);audioURL=URL.createObjectURL(f);audio=new Audio(audioURL);audio.loop=true;audio.preload='none';bindError(audio);
  $('#sound-description').textContent='Your selected audio. Turn music on to play; no upload is made.';report('Local audio selected. Music is paused.');
 });
 $('#restore-track').addEventListener('click',function(){
  stopSound();audio=builtIn;if(audioURL){URL.revokeObjectURL(audioURL);audioURL=null;}custom.value='';
  $('#sound-description').textContent='Pink Soldiers · 30-second loop. Starts only when you turn it on.';report('Pink Soldiers selected. Turn music on to play.');
 });
 document.addEventListener('visibilitychange',function(){if(document.hidden)stopSound();});
 window.addEventListener('pagehide',function(){stopSound();});
 window.PortfolioExperience={stopSound:stopSound,state:function(){return {playMode:playMode,soundOn:soundOn,audioContextState:'closed',customAudio:audio!==builtIn,track:audio===builtIn?'Pink Soldiers':'local file',paused:audio.paused,pending:pending};}};
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
