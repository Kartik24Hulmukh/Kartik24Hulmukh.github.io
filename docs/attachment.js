
(function () {
  'use strict';
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia('(pointer: fine)').matches;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  var HEX = '0123456789ABCDEF';
  function rnd(n) { var s = ''; for (var i = 0; i < n; i++) s += HEX[(Math.random() * 16) | 0]; return s; }
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
  window.addEventListener('mousemove', function (e) { MX = e.clientX; MY = e.clientY; }, { passive: true });

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
      s.classList.add('stretch');
      setTimeout(function () { s.classList.remove('stretch'); }, 650);
    });
  });
  function introName() {
    document.body.classList.add('ready');
    if (RM) return;
    $$('.name .ch').forEach(function (s, k) {
      var fin = s.getAttribute('data-ch'), n = 0, max = 6 + k;
      var iv = setInterval(function () {
        n++;
        if (n > max) { clearInterval(iv); s.textContent = fin; return; }
        s.textContent = HEX[(Math.random() * 16) | 0];
      }, 42);
    });
  }

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

  /* ---------- 5. loader ---------- */
  function runLoader() {
    var L = $('#loader');
    if (!L) return Promise.resolve();
    if (RM) { L.parentNode.removeChild(L); return Promise.resolve(); }
    document.body.classList.add('lock');
    var c = $('#lcount'), h = $('#lhash'), st = $('#lstat');
    var start = performance.now(), dur = 1500, done = false;
    return new Promise(function (resolve) {
      function finish() {
        if (done) return; done = true;
        L.classList.add('out');
        document.body.classList.remove('lock');
        setTimeout(function () { if (L.parentNode) L.parentNode.removeChild(L); }, 1100);
        resolve();
      }
      L.addEventListener('click', finish);
      function tick(now) {
        if (done) return;
        var p = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - p, 3);
        c.textContent = ('00' + Math.round(e * 100)).slice(-3);
        if (p < 1) { h.textContent = rnd(64); requestAnimationFrame(tick); return; }
        digestPromise.then(function (d) {
          if (done) return;
          h.textContent = d ? d : 'web crypto is unavailable in this context';
          st.textContent = d ? 'sha-256 of this page — computed in your browser, just now' : 'digest skipped — nothing claimed';
          setTimeout(finish, 750);
        });
      }
      requestAnimationFrame(tick);
    });
  }

  /* ---------- 6. WebGL field ---------- */
  var GL = { e: 0, s: 0 };
  (function initGL() {
    var cv = $('#gl'), gl = null;
    try { gl = cv.getContext('webgl', { antialias: false, alpha: false }) || cv.getContext('experimental-webgl'); } catch (e) { gl = null; }
    if (!gl) { cv.classList.add('nogl'); return; }
    var vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}';
    var fs = [
      'precision mediump float;',
      'uniform vec2 r;uniform float t;uniform vec2 m;uniform float s;uniform float e;',
      'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
      'float n(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.0-2.0*f);',
      ' return mix(mix(h(i),h(i+vec2(1.0,0.0)),u.x),mix(h(i+vec2(0.0,1.0)),h(i+vec2(1.0,1.0)),u.x),u.y);}',
      'float fbm(vec2 p){float v=0.0;float a=0.5;mat2 R=mat2(0.8,0.6,-0.6,0.8);',
      ' for(int i=0;i<5;i++){v+=a*n(p);p=R*p*2.02;a*=0.5;}return v;}',
      'void main(){',
      ' vec2 p=(gl_FragCoord.xy-0.5*r)/r.y;',
      ' vec2 mm=(m-0.5*r)/r.y;',
      ' float d=length(p-mm);',
      ' float lens=smoothstep(0.42,0.0,d);',
      ' float T=t*0.04;',
      ' vec2 q=vec2(fbm(p*1.4+T),fbm(p*1.4-T+5.2));',
      ' vec2 w=vec2(fbm(p*1.4+3.0*q+vec2(1.7,9.2)+T*1.3),fbm(p*1.4+3.0*q+vec2(8.3,2.8)-T));',
      ' float f=fbm(p*1.4+3.0*w-(p-mm)*lens*0.9);',
      ' float g=abs(fract(f*(9.0+e*7.0)-t*0.015)-0.5);',
      ' float c=1.0-smoothstep(0.0,0.045,g);',
      ' vec3 ink=vec3(0.051,0.051,0.047);',
      ' vec3 paper=vec3(0.925,0.91,0.875);',
      ' vec3 red=vec3(1.0,0.29,0.11);',
      ' float fade=1.0-clamp(s,0.0,1.0)*0.55;',
      ' vec3 col=ink;',
      ' col+=paper*c*0.075*fade*(1.0-lens);',
      ' col+=mix(paper,red,0.85)*c*0.55*lens;',
      ' col+=paper*pow(f,3.0)*0.05;',
      ' col+=(h(gl_FragCoord.xy+fract(t)*100.0)-0.5)*0.035;',
      ' col*=mix(0.72,1.0,smoothstep(1.25,0.25,length(p)));',
      ' gl_FragColor=vec4(col,1.0);',
      '}'
    ].join('\n');
    function sh(type, src) {
      var o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o);
      if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) { return null; }
      return o;
    }
    var v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) { cv.classList.add('nogl'); return; }
    var pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.classList.add('nogl'); return; }
    gl.useProgram(pr);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't'), uM = gl.getUniformLocation(pr, 'm'),
        uS = gl.getUniformLocation(pr, 's'), uE = gl.getUniformLocation(pr, 'e');
    var scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.75;
    function resize() { cv.width = Math.max(1, Math.floor(window.innerWidth * scale)); cv.height = Math.max(1, Math.floor(window.innerHeight * scale)); gl.viewport(0, 0, cv.width, cv.height); }
    resize(); window.addEventListener('resize', resize);
    var sm = { x: MX, y: MY }, ev = 0, t0 = performance.now(), running = true;
    document.addEventListener('visibilitychange', function () { running = !document.hidden; if (running) requestAnimationFrame(frame); });
    function draw(now) {
      sm.x += (MX - sm.x) * 0.06; sm.y += (MY - sm.y) * 0.06;
      ev += (GL.e - ev) * 0.05;
      gl.uniform2f(uR, cv.width, cv.height);
      gl.uniform1f(uT, (now - t0) / 1000);
      gl.uniform2f(uM, sm.x * scale, cv.height - sm.y * scale);
      gl.uniform1f(uS, GL.s);
      gl.uniform1f(uE, ev);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    function frame(now) { if (!running) return; draw(now); requestAnimationFrame(frame); }
    if (RM) { draw(performance.now()); window.addEventListener('resize', function () { draw(performance.now()); }); }
    else requestAnimationFrame(frame);
  })();

  /* ---------- 7. custom cursor ---------- */
  if (FINE && !RM) {
    document.body.classList.add('has-cursor');
    var cur = $('.cur'), ring = $('.cur-ring'), dot = $('.cur-dot'), lab = $('.cur-lab');
    var rx = MX, ry = MY;
    (function loop() {
      rx += (MX - rx) * 0.18; ry += (MY - ry) * 0.18;
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      dot.style.transform = 'translate3d(' + MX + 'px,' + MY + 'px,0)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest ? e.target.closest('[data-cursor],a,button') : null;
      if (!t) { cur.classList.remove('hov', 'lbl'); return; }
      cur.classList.add('hov');
      var l = t.getAttribute('data-cursor');
      if (l) { lab.textContent = l; cur.classList.add('lbl'); } else { cur.classList.remove('lbl'); }
    });
    document.addEventListener('mouseleave', function () { cur.style.opacity = '0'; });
    document.addEventListener('mouseenter', function () { cur.style.opacity = '1'; });
  }

  /* ---------- 8. role rotator ---------- */
  var roles = $$('.roles li'), ri = 0;
  if (roles.length > 1 && !RM) {
    setInterval(function () {
      var cur = roles[ri]; cur.classList.remove('on'); cur.classList.add('off');
      ri = (ri + 1) % roles.length;
      var nx = roles[ri]; nx.classList.remove('off'); nx.classList.add('on');
      setTimeout(function () { cur.classList.remove('off'); }, 800);
    }, 2400);
  }

  /* ---------- 9. scramble on nav hover ---------- */
  function scramble(el) {
    if (RM) return;
    var fin = el.getAttribute('data-txt') || el.textContent;
    el.setAttribute('data-txt', fin);
    var start = performance.now(), dur = 420;
    (function f(now) {
      var p = Math.min(1, (now - start) / dur), out = '';
      for (var i = 0; i < fin.length; i++) out += (i / fin.length < p || fin[i] === ' ') ? fin[i] : HEX[(Math.random() * 16) | 0];
      el.textContent = out;
      if (p < 1) requestAnimationFrame(f); else el.textContent = fin;
    })(start);
  }
  $$('.scr').forEach(function (a) { a.addEventListener('mouseenter', function () { scramble(a); }); });

  /* ---------- 10. reveals + counters ---------- */
  function countUp(el) {
    var to = parseInt(el.getAttribute('data-to'), 10) || 0;
    if (RM) { el.textContent = to.toLocaleString('en-US'); return; }
    var s = performance.now(), d = 1500;
    (function f(now) {
      var p = Math.min(1, (now - s) / d), e = 1 - Math.pow(1 - p, 4);
      el.textContent = (to === 0 ? (p < 1 ? String((Math.random() * 10) | 0) : '0') : Math.round(to * e).toLocaleString('en-US'));
      if (p < 1) requestAnimationFrame(f);
    })(s);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        $$('.num', en.target).forEach(countUp);
        if (en.target.classList.contains('num')) countUp(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.2 });
    $$('[data-reveal]').forEach(function (el) { io.observe(el); });
    $$('.num').forEach(function (el) { if (!el.closest('[data-reveal]')) io.observe(el); });

    var steps = $$('.step');
    var io3 = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { steps.forEach(function (s) { s.classList.remove('on'); }); en.target.classList.add('on'); } });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { io3.observe(s); });
    if (steps[0]) steps[0].classList.add('on');

    var secs = $$('[data-title]'), si = $('#secind'), total = secs.length - 1;
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = secs.indexOf(en.target);
        si.textContent = '[' + ('0' + i).slice(-2) + '/' + ('0' + total).slice(-2) + '] ' + en.target.getAttribute('data-title');
      });
    }, { rootMargin: '-50% 0px -50% 0px' });
    secs.forEach(function (s) { io2.observe(s); });
  } else {
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    $$('.num').forEach(countUp);
    $$('.step').forEach(function (s) { s.classList.add('on'); });
  }

  /* ---------- 11. scroll-driven loop ---------- */
  var prog = $('#prog'), marq = $('#marq'), man = $('#manifesto');
  var lastY = window.scrollY, skew = 0, ticking = false;
  function onScroll() {
    var y = window.scrollY, H = document.documentElement.scrollHeight - window.innerHeight;
    if (prog) prog.style.transform = 'scaleX(' + (H > 0 ? y / H : 0) + ')';
    GL.s = y / window.innerHeight;
    if (man && words.length && !RM) {
      var r = man.getBoundingClientRect();
      var p = clamp(-r.top / Math.max(1, r.height - window.innerHeight), 0, 1);
      var lit = Math.round(p * 1.15 * words.length);
      for (var i = 0; i < words.length; i++) words[i].classList.toggle('on', i < lit);
    }
    if (marq && !RM) {
      var v = y - lastY; skew = clamp(v * 0.25, -8, 8);
      marq.style.setProperty('--skew', skew + 'deg');
    }
    lastY = y; ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  setInterval(function () { if (marq && Math.abs(skew) > 0.05) { skew *= 0.6; marq.style.setProperty('--skew', skew + 'deg'); } }, 80);
  onScroll();

  /* ---------- 12. projects: accordion + peek ---------- */
  var peek = $('#peek'), peekOn = false;
  function fillPeek(p) {
    $('.pk-n', peek).textContent = $('.p-name', p).textContent;
    $('.pk-s', peek).textContent = p.getAttribute('data-status') || '';
    $('.pk-k', peek).textContent = p.getAttribute('data-kind') || '';
    var c = $('.r-cmd code', p);
    $('.pk-c', peek).textContent = c ? c.textContent.split('\n')[0] : 'no command — see repository';
  }
  $$('.proj').forEach(function (p) {
    var h = $('.proj-head', p);
    h.addEventListener('click', function () {
      var open = p.classList.toggle('open');
      h.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (peek) { peek.classList.remove('on'); peekOn = false; }
    });
    if (FINE && !RM && peek) {
      h.addEventListener('mouseenter', function () { if (p.classList.contains('open')) return; fillPeek(p); peek.classList.add('on'); peekOn = true; });
      h.addEventListener('mouseleave', function () { peek.classList.remove('on'); peekOn = false; });
    }
  });
  if (FINE && !RM && peek) {
    var px = MX, py = MY;
    (function loop() {
      var tx = clamp(MX + 30, 10, window.innerWidth - 290), ty = clamp(MY - 60, 10, window.innerHeight - 260);
      var dx = tx - px; px += dx * 0.14; py += (ty - py) * 0.14;
      var rot = clamp(dx * 0.05, -9, 9);
      if (peekOn) peek.style.transform = 'translate3d(' + px + 'px,' + py + 'px,0) rotate(' + rot + 'deg)';
      requestAnimationFrame(loop);
    })();
  }

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
    evt.setAttribute('aria-pressed', on ? 'true' : 'false');
    GL.e = on ? 1 : 0;
    announce(on ? 'Evidence mode on: sources are shown' : 'Evidence mode off');
  }
  if (evt) evt.addEventListener('click', toggleEv);
  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    if (/INPUT|TEXTAREA|SELECT/.test(tag) || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'e' || e.key === 'E') toggleEv();
  });

  /* ---------- 15. clock ---------- */
  var fmt = null;
  try { fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }); } catch (e) { fmt = null; }
  function tickClock() { var el = $('#clock'); if (el && fmt) el.textContent = fmt.format(new Date()); }
  tickClock(); setInterval(tickClock, 1000);

  /* ---------- 16. magnetic buttons ---------- */
  if (FINE && !RM) {
    $$('.mag').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + (x * 0.22) + 'px,' + (y * 0.32) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- go ---------- */
  runLoader().then(function () { setTimeout(introName, RM ? 0 : 120); });
})();
