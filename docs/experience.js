(function(){
 'use strict';
 var M=window.PortfolioMotion, $=function(s){return document.querySelector(s);};
 var toggle=$('#experience-toggle'),panel=$('#experience-panel'),close=$('#experience-close');
 var motion=$('#motion-toggle'),play=$('#play-toggle'),sound=$('#sound-toggle'),status=$('#xp-status');
 var custom=$('#custom-audio'),audio=null,audioURL=null,ctx=null,oscillators=[],soundOn=false,playMode=false;
 var generation=0,pending=false,masterGain=null,volume=.2;
 if(!M){toggle.hidden=true;return;}
 var volumeInput=$('#sound-volume');
 volumeInput.addEventListener('input',function(){volume=Number(this.value)/100;$('#volume-output').textContent=this.value+'%';if(audio)audio.volume=volume;if(ctx&&masterGain)masterGain.gain.setTargetAtTime(volume*.09,ctx.currentTime,.025);});
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
 play.addEventListener('click',function(){setPlay(!playMode);report(playMode?'Game-inspired geometry enabled. No official show assets are used.':'Original portfolio palette restored.');});
 function stopSound(){
  generation++;pending=false;soundOn=false;sound.setAttribute('aria-checked','false');
  if(audio)audio.pause();
  if(ctx){var old=ctx;ctx=null;masterGain=null;oscillators.forEach(function(o){try{o.stop();}catch(e){}});oscillators=[];old.close().catch(function(){});}
 }
 function makeAmbient(){
  var AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error('Audio synthesis is unavailable in this browser.');
  ctx=new AC();var gain=ctx.createGain();masterGain=gain;gain.gain.setValueAtTime(volume*.09,ctx.currentTime);gain.connect(ctx.destination);
  /* Original sustained harmony, not a transcription or sound-alike of any theme song. */
  [146.83,220,261.63,329.63].forEach(function(hz,i){var o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=hz;g.gain.value=i===0?.38:.17;o.connect(g);g.connect(gain);o.start();oscillators.push(o);});
  return ctx.resume();
 }
 sound.addEventListener('click',function(){
  if(soundOn||pending){stopSound();report('Sound muted.');return;}
  pending=true;var ticket=++generation;var promise;
  try{if(audio){audio.volume=volume;promise=audio.play();}else promise=makeAmbient();}
  catch(e){stopSound();report(e.message);return;}
  Promise.resolve(promise).then(function(){if(ticket!==generation||document.hidden){return;}pending=false;soundOn=true;sound.setAttribute('aria-checked','true');report(audio?'Your selected audio is playing locally.':'Original ambient sketch playing. This is not the Squid Game soundtrack.');}).catch(function(){if(ticket!==generation)return;stopSound();report('Playback was blocked. Try turning sound on again.');});
 });
 custom.addEventListener('change',function(){var f=custom.files&&custom.files[0];if(!f)return;
  if(!f.type.startsWith('audio/')&&!(/\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i.test(f.name)&&!f.type)){report('Choose a supported audio file.');custom.value='';return;}
  if(f.size>25*1024*1024){report('Choose an audio file smaller than 25 MB.');custom.value='';return;}
  stopSound();if(audioURL)URL.revokeObjectURL(audioURL);audioURL=URL.createObjectURL(f);audio=new Audio(audioURL);audio.loop=true;audio.preload='none';var selectedAudio=audio;audio.addEventListener('error',function(){if(audio!==selectedAudio)return;stopSound();report('This audio file could not be played. Choose a different format.');});
  $('#sound-description').textContent='Your selected audio. Turn sound on to play; no upload is made.';report('Audio selected locally. Use only tracks you have permission to use.');position();
 });
 document.addEventListener('visibilitychange',function(){if(document.hidden)stopSound();});
 window.addEventListener('pagehide',function(){stopSound();});
 window.PortfolioExperience={stopSound:stopSound,state:function(){return {playMode:playMode,soundOn:soundOn,audioContextState:ctx?ctx.state:'closed',customAudio:!!audio};}};
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
