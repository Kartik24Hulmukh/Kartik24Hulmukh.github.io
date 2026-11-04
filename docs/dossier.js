/* Reveal a linked project without taking over native hash navigation. */
(function(){
 'use strict';
 function reveal(id){
  var target=document.getElementById(id),project=target&&(target.classList.contains('proj')?target:target.closest('.proj'));
  document.querySelectorAll('.dossier-card').forEach(function(a){if(project&&a.getAttribute('href')==='#'+project.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
  if(!project)return;
  var button=project.querySelector('.proj-head'),body=project.querySelector('.proj-body');if(!button||!body)return;
  project.classList.add('open');button.setAttribute('aria-expanded','true');body.inert=false;
 }
 function current(){try{reveal(decodeURIComponent(location.hash.slice(1)));}catch(e){}}
 document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;var id=a.getAttribute('href').slice(1);if(!id)return;try{reveal(decodeURIComponent(id));}catch(err){}},true);
 window.addEventListener('hashchange',current);current();
})();
