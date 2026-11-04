/* Optional section index: never hijacks native scrolling, links or history. */
(function(){
 'use strict';
 var map=document.getElementById('journey-map'),hero=document.getElementById('top');if(!map||!hero)return;
 var details=map.querySelector('details'),summary=map.querySelector('summary'),label=map.querySelector('[data-journey-current]'),hide=map.querySelector('.journey-hide');
 var sections=Array.from(document.querySelectorAll('main > section[data-title]')),links=Array.from(map.querySelectorAll('.journey-links a')),frame=0,dismissed=false;
 function paint(){
  frame=0;if(dismissed)return;var marker=innerHeight*.30,current=sections[0];
  sections.forEach(function(s){if(s.getBoundingClientRect().top<=marker)current=s;});
  var away=hero.getBoundingClientRect().bottom<innerHeight*.4;
  map.hidden=!away&&!map.contains(document.activeElement);
  var index=sections.indexOf(current),title=current.getAttribute('data-title')||'Index';
  label.textContent=('0'+index).slice(-2)+' / '+title;
  links.forEach(function(a){if(a.getAttribute('href')==='#'+current.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(paint);}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
 map.addEventListener('focusout',function(){setTimeout(schedule,0);});
 map.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('.journey-links a');if(!a)return;var section=document.getElementById(a.hash.slice(1)),keyboard=e.detail===0;
  details.open=false;
  if(keyboard&&section){setTimeout(function(){var had=section.hasAttribute('tabindex');if(!had)section.setAttribute('tabindex','-1');section.focus({preventScroll:true});if(!had)section.addEventListener('blur',function(){section.removeAttribute('tabindex');},{once:true});schedule();},0);}
 });
 document.addEventListener('click',function(e){if(details.open&&!map.contains(e.target))details.open=false;});
 document.addEventListener('keydown',function(e){if(e.key==='Escape'&&details.open){details.open=false;summary.focus();e.preventDefault();}});
 hide.addEventListener('click',function(){dismissed=true;details.open=false;map.hidden=true;var target=sections.find(function(s){return s.getBoundingClientRect().bottom>0;})||hero;var had=target.hasAttribute('tabindex');if(!had)target.setAttribute('tabindex','-1');target.focus({preventScroll:true});if(!had)target.addEventListener('blur',function(){target.removeAttribute('tabindex');},{once:true});});
 schedule();
})();
