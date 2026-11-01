
(function () {
  'use strict';
  // A missing controller must not strand the loader or hide page content.
  var Motion = window.PortfolioMotion || {
    state: function () { return { active: false }; }, raf: function () { return 0; },
    cancel: function () {}, interval: function () { return 0; }, clearInterval: function () {},
    onChange: function (fn) { fn({ active: false }); }
  };
  if (!window.PortfolioMotion) document.documentElement.dataset.motion = 'off';
  var fineQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  var RM = !Motion.state().active;
  var FINE = fineQuery.matches;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* ---------- 1. page digest (computed before any DOM animation) ---------- */
  var mainEl = $('#main');
  var pageText = (mainEl ? mainEl.textContent : '').replace(/\s+/g, ' ').trim();
  var digestPromise;
  try {
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      digestPromise = crypto.subtle.digest('SHA-256', new TextEncoder().encode(pageText)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
      }).catch(function () { return null; });
    } else { digestPromise = Promise.resolve(null); }
  } catch (e) { digestPromise = Promise.resolve(null); }
  digestPromise.then(function (d) {
    var el = $('#digest');
    if (el) el.textContent = d ? (d.slice(0, 20) + '…' + d.slice(-8)) : 'unavailable in this context';
  });

  /* ---------- 2. shared pointer ---------- */
  var MX = window.innerWidth / 2, MY = window.innerHeight / 2;
  window.addEventListener('mousemove', function (e) { if (RM || !FINE) return; MX = e.clientX; MY = e.clientY; }, { passive: true });

  /* ---------- 3. split hero name into letters ---------- */
  $$('.name .row').forEach(function (row, ri) {
    var t = row.textContent.trim();
    row.textContent = '';
    for (var i = 0; i < t.length; i++) {
      var s = document.createElement('span');
      s.className = 'ch';
      s.textContent = t[i];
      s.setAttribute('data-ch', t[i]);
      s.style.setProperty('--i', String(ri * 6 + i));
      row.appendChild(s);
    }
  });
  $$('.name .ch').forEach(function (s) {
    s.addEventListener('mouseenter', function () {
      if (RM || !FINE) return;
      s.classList.add('stretch');
      setTimeout(function () { s.classList.remove('stretch'); }, 650);
    });
  });
  // Identity is always canonical; never scramble the visitor's first read.
  document.body.classList.add('ready');

  /* ---------- 4. manifesto word split ---------- */
  function splitWords(root) {
    var out = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          var frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(function (pt) {
            if (!pt) return;
            if (/^\s+$/.test(pt)) { frag.appendChild(document.createTextNode(' ')); return; }
            var s = document.createElement('span'); s.className = 'w'; s.textContent = pt; frag.appendChild(s); out.push(s);
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1) { walk(ch); }
      });
    })(root);
    return out;
  }
  var words = $('#words') ? splitWords($('#words')) : [];
  if (RM) words.forEach(function (w) { w.classList.add('on'); });

  /* ---------- 5. immediate content; no loading gate or scroll lock ---------- */
  var loader = $('#loader');
  if (loader) loader.remove();
  document.body.classList.remove('lock');

  /* ---------- 6. independent contour-field enhancement with static fallback ---------- */
  var canvas = $('#gl');
  if (canvas) canvas.classList.add('nogl'); // atmosphere.js owns the optional field lifecycle.

  /* ---------- 7. native cursor; no cursor overlay or animation ---------- */
  document.body.classList.remove('has-cursor');

  /* ---------- 8. stable role; no repeating identity animation ---------- */
  var roles = $$('.roles li'), ri = 0;
  roles.forEach(function (el, i) {
    el.classList.remove('off'); el.classList.toggle('on', i === ri);
  });

  /* ---------- 9. navigation stays canonical; no hover scramble ---------- */

  /* ---------- 10. reveals + counters ---------- */
  function countUp(el) { el.textContent=(parseInt(el.getAttribute('data-to'),10)||0).toLocaleString('en-US'); }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        $$('.num', en.target).forEach(countUp);
        if (en.target.classList.contains('num')) countUp(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -32px 0px' });
    $$('[data-reveal]').forEach(function (el) { io.observe(el); });
    $$('.num').forEach(function (el) { if (!el.closest('[data-reveal]')) io.observe(el); });

    var steps = $$('.step');
    var io3 = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { steps.forEach(function (s) { s.classList.remove('on'); }); en.target.classList.add('on'); } });
    }, { rootMargin: '-25% 0px -35% 0px' });
    steps.forEach(function (s) { io3.observe(s); });
    if (steps[0]) steps[0].classList.add('on');

    var secs = $$('[data-title]'), si = $('#secind'), total = secs.length - 1;
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = secs.indexOf(en.target);
        if (si) si.textContent = '[' + ('0' + i).slice(-2) + '/' + ('0' + total).slice(-2) + '] ' + en.target.getAttribute('data-title');
      });
    }, { rootMargin: '-25% 0px -35% 0px' });
    secs.forEach(function (s) { io2.observe(s); });
  } else {
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    $$('.num').forEach(countUp);
    $$('.step').forEach(function (s) { s.classList.add('on'); });
  }

  /* ---------- 11. scroll-driven loop ---------- */
  var prog = $('#prog'), marq = $('#marq'), man = $('#manifesto');
  var lastY = window.scrollY, skew = 0, ticking = false, skewFrame = 0;
  function easeSkew() {
    skewFrame = 0;
    if (RM || !marq) return;
    skew *= 0.85;
    if (Math.abs(skew) < 0.05) skew = 0;
    marq.style.setProperty('--skew', skew + 'deg');
    if (skew) skewFrame = Motion.raf(easeSkew);
  }
  function onScroll() {
    var y = window.scrollY, H = document.documentElement.scrollHeight - window.innerHeight;
    if (prog) prog.style.transform = 'scaleX(' + (H > 0 ? y / H : 0) + ')';
    // Native scrolling keeps every word readable; character stages own choreography.
    lastY = y; ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(onScroll).observe(mainEl || document.body);
  onScroll();

  /* ---------- 12. projects: accordion + peek ---------- */
  var peek = $('#peek'), peekOn = false, peekFrame = 0, px = MX, py = MY;
  function stopPeek() {
    peekOn = false;
    if (peekFrame) Motion.cancel(peekFrame);
    peekFrame = 0;
    if (peek) peek.classList.remove('on');
  }
  window.addEventListener('scroll', stopPeek, { passive: true });
  window.addEventListener('blur', stopPeek);
  function movePeek() {
    peekFrame = 0;
    if (RM || !FINE || !peekOn || !peek) return;
    var tx = clamp(MX + 30, 10, Math.max(10, window.innerWidth - 290));
    var ty = clamp(MY - 60, 10, Math.max(10, window.innerHeight - 260));
    var dx = tx - px, dy = ty - py;
    px += dx * 0.14; py += dy * 0.14;
    var moving = Math.abs(dx) + Math.abs(dy) > 0.2;
    peek.style.transform = 'translate3d(' + px + 'px,' + py + 'px,0) rotate(' + (moving ? clamp(dx * 0.05, -9, 9) : 0) + 'deg)';
    if (moving) peekFrame = Motion.raf(movePeek);
  }
  window.addEventListener('mousemove', function () {
    if (!RM && FINE && peekOn && !peekFrame) peekFrame = Motion.raf(movePeek);
  }, { passive: true });
  function fillPeek(p) {
    var name = $('.p-name', p);
    var n = $('.pk-n', peek), status = $('.pk-s', peek), kind = $('.pk-k', peek), command = $('.pk-c', peek);
    if (!n || !status || !kind || !command) return;
    n.textContent = name ? name.textContent : '';
    status.textContent = p.getAttribute('data-status') || '';
    kind.textContent = p.getAttribute('data-kind') || '';
    var c = $('.r-cmd code', p);
    command.textContent = c ? c.textContent.split('\n')[0] : 'no command — see repository';
  }
  $$('.proj').forEach(function (p) {
    var h = $('.proj-head', p);
    var body = $('.proj-body', p);
    if (!h || !body) return;
    body.inert=!p.classList.contains('open');
    h.setAttribute('aria-expanded',p.classList.contains('open')?'true':'false');
    h.disabled=false;
    h.addEventListener('click', function () {
      var open = p.classList.toggle('open');
      h.setAttribute('aria-expanded', open ? 'true' : 'false');
      body.inert=!open;
      stopPeek();
    });
    if (peek) {
      h.addEventListener('mouseenter', function () { if (RM || !FINE || p.classList.contains('open')) return; fillPeek(p); peek.classList.add('on'); peekOn = true; if (!peekFrame) peekFrame = Motion.raf(movePeek); });
      h.addEventListener('mouseleave', stopPeek);
    }
  });

  document.documentElement.classList.add('js','accordion-ready');

  /* ---------- 13. copy ---------- */
  var live = $('#live');
  function announce(msg) { if (live) { live.textContent = ''; setTimeout(function () { live.textContent = msg; }, 30); } }
  function fallbackCopy(t) {
    var ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    var ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta); return ok;
  }
  function copyText(t) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t).then(function () { return true; }).catch(function () { return fallbackCopy(t); });
    return Promise.resolve(fallbackCopy(t));
  }
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var t = b.getAttribute('data-text');
      if (!t) { var c = b.parentNode.querySelector('code'); t = c ? c.textContent : ''; }
      var orig = b.getAttribute('data-orig') || b.textContent; b.setAttribute('data-orig', orig);
      copyText(t).then(function (ok) {
        b.textContent = ok ? 'COPIED ✓' : 'SELECT & COPY';
        announce(ok ? 'Copied to clipboard' : 'Copy failed — select the text manually');
        setTimeout(function () { b.textContent = orig; }, 1600);
      });
    });
  });

  /* ---------- 14. evidence mode ---------- */
  var evt = $('#evt');
  function toggleEv() {
    var on = document.body.classList.toggle('ev');
    if (evt) evt.setAttribute('aria-pressed', on ? 'true' : 'false');
    announce(on ? 'Evidence mode on: sources are shown' : 'Evidence mode off');
  }
  if (evt) evt.addEventListener('click', toggleEv);
  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    if ((e.target && e.target.isContentEditable) || e.repeat || /INPUT|TEXTAREA|SELECT/.test(tag) || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'e' || e.key === 'E') toggleEv();
  });

  /* ---------- 15. clock ---------- */
  var fmt = null;
  try { fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }); } catch (e) { fmt = null; }
  function tickClock() { var el = $('#clock'); if (el && fmt) el.textContent = fmt.format(new Date()); }
  tickClock(); Motion.interval(tickClock, 1000);

  /* ---------- 16. magnetic buttons ---------- */
  {
    $$('.mag').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        if (RM || !FINE) return;
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.setProperty('--hotspot-x', (e.clientX-r.left) + 'px');
        el.style.setProperty('--hotspot-y', (e.clientY-r.top) + 'px');
        el.classList.add('pointer-lit');
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; el.classList.remove('pointer-lit'); });
    });
  }

  function syncPointer() {
    document.body.classList.remove('has-cursor');
    if (RM || !FINE) {
      stopPeek();
      $$('.mag').forEach(function (el) { el.style.transform = ''; el.classList.remove('pointer-lit'); });
    }
  }
  function pointerChanged() { FINE = fineQuery.matches; syncPointer(); }
  if (fineQuery.addEventListener) fineQuery.addEventListener('change', pointerChanged);
  else if (fineQuery.addListener) fineQuery.addListener(pointerChanged);

  window.__portfolioEngineReady = true;
  /* ---------- runtime experience preferences ---------- */
  Motion.onChange(function(state){
    RM = !state.active;
    syncPointer();
    ticking = false;
    if (skewFrame) Motion.cancel(skewFrame); skewFrame = 0;
    if (RM) {
      var loader = $('#loader'); if (loader) loader.remove();
      document.body.classList.remove('lock');
      document.body.classList.add('ready');
      $$('.name .ch').forEach(function(el){el.textContent=el.getAttribute('data-ch');el.classList.remove('stretch');});
      $$('.scr').forEach(function(el){if(el.getAttribute('data-txt'))el.textContent=el.getAttribute('data-txt');});
      $$('[data-reveal]').forEach(function(el){el.classList.add('in');});
      $$('.num').forEach(function(el){el.textContent=(parseInt(el.getAttribute('data-to'),10)||0).toLocaleString('en-US');});
      words.forEach(function(el){el.classList.add('on');});
      roles.forEach(function(el,i){el.classList.remove('off');el.classList.toggle('on',i===ri);});
      stopPeek();
      $$('.mag').forEach(function(el){el.style.transform='';el.classList.remove('pointer-lit');});
      if(marq){skew=0;marq.style.setProperty('--skew','0deg');}
    }
    onScroll();
  });

})();
