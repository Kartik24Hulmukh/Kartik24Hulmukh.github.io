/* Progressive enhancement only. Content and native <details> work without this file. */
(function () {
  'use strict';
  function start() {
    var $ = function (s, root) { return (root || document).querySelector(s); };
    var all = function (s, root) { return Array.from((root || document).querySelectorAll(s)); };
    var body = document.body, main = $('#main');
    var reduced = matchMedia('(prefers-reduced-motion: reduce)');
    var fine = matchMedia('(hover: hover) and (pointer: fine)');
    var desktop = matchMedia('(min-width: 981px)');
    var motionButton = $('#motion-toggle'), evidenceButton = $('#evt');
    var live = $('#live'), paused = false, suspended = false, announceTimer;
    try { paused = localStorage.getItem('portfolio-motion') === 'paused'; } catch (_) {}
    function announce(text) {
      if (!live) return;
      clearTimeout(announceTimer); live.textContent = '';
      announceTimer = setTimeout(function () { live.textContent = text; }, 40);
    }
    function expose(button) {
      button.disabled = false; button.hidden = false; button.removeAttribute('aria-hidden');
    }
    function motionAllowed() { return !paused && !reduced.matches; }
    function active() { return !document.hidden && !suspended; }
    function watch(query, fn) {
      if (query.addEventListener) query.addEventListener('change', fn);
      else query.addListener(fn);
    }

    // Never apply the old class that replaces the native cursor, or wait for a loader.
    body.classList.remove('lock', 'has-cursor'); body.classList.add('ready');
    all('.cur, #peek, #loader').forEach(function (el) { el.remove(); });
    all('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    // Safety rules are enhancement-only; the host CSS must also expose content without JS.
    var safety = document.createElement('style');
    safety.textContent = '.src{display:inline-flex}body.ev .src{outline:2px solid var(--red,#ff4a1c);outline-offset:3px}' +
      'html.motion-paused{scroll-behavior:auto!important}' +
      'html.motion-paused *,html.motion-paused *::before,html.motion-paused *::after{animation-play-state:paused!important;transition:none!important}' +
      '#gl{pointer-events:none}#digest{overflow-wrap:anywhere}';
    document.head.appendChild(safety);

    // Snapshot before copy feedback, lettering, or other transient UI can change the text.
    // SHA-256 input: #main textContent, minus controls, with whitespace collapsed and trimmed.
    var digest = $('#digest');
    if (digest) {
      digest.title = 'Content fingerprint, not proof. SHA-256 of #main text, excluding buttons, scripts, styles and templates; whitespace collapsed and trimmed.';
      if (!main) digest.textContent = 'unavailable — no main content';
      else {
        var snapshot = main.cloneNode(true);
        all('button, script, style, template, [data-fingerprint-exclude]', snapshot).forEach(function (el) { el.remove(); });
        var text = snapshot.textContent.replace(/\s+/g, ' ').trim();
        digest.textContent = 'computing fingerprint…';
        if (window.crypto && window.crypto.subtle && window.TextEncoder) {
          try {
            window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buffer) {
              digest.textContent = Array.from(new Uint8Array(buffer), function (b) { return b.toString(16).padStart(2, '0'); }).join('');
            }).catch(function () { digest.textContent = 'fingerprint unavailable'; });
          } catch (_) { digest.textContent = 'fingerprint unavailable'; }
        } else digest.textContent = 'fingerprint unavailable — Web Crypto required';
      }
    }

    if (evidenceButton) {
      evidenceButton.title = 'Highlight source links; sources are always available';
      evidenceButton.setAttribute('aria-pressed', String(body.classList.contains('ev')));
      evidenceButton.addEventListener('click', function () {
        var on = body.classList.toggle('ev');
        evidenceButton.setAttribute('aria-pressed', String(on));
        announce(on ? 'Source highlighting on. Sources are always available.' : 'Source highlighting off. Sources remain available.');
        field.refresh();
      });
      expose(evidenceButton);
    }
    // No keyboard shortcut: ordinary typing and browser navigation are left alone.

    function fallbackCopy(text) {
      var focused = document.activeElement, selection = window.getSelection();
      var ranges = selection ? Array.from({ length: selection.rangeCount }, function (_, i) { return selection.getRangeAt(i).cloneRange(); }) : [];
      var area = document.createElement('textarea');
      area.value = text; area.readOnly = true; area.tabIndex = -1;
      area.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px;';
      body.appendChild(area); area.select(); area.setSelectionRange(0, text.length);
      var ok = false;
      try { ok = document.execCommand('copy') === true; } catch (_) {}
      area.remove();
      if (focused && focused.focus) focused.focus({ preventScroll: true });
      if (selection) {
        selection.removeAllRanges();
        ranges.forEach(function (range) { try { selection.addRange(range); } catch (_) {} });
      }
      return ok;
    }
    async function copy(text) {
      if (navigator.clipboard && window.isSecureContext) {
        try { await navigator.clipboard.writeText(text); return true; } catch (_) {}
      }
      return fallbackCopy(text);
    }
    all('[data-copy]').forEach(function (button) {
      var original = button.textContent, reset;
      button.addEventListener('click', async function () {
        var code = button.parentElement.querySelector('code');
        var text = button.hasAttribute('data-text') ? button.getAttribute('data-text') : (code ? code.textContent : '');
        if (!text) { announce('Nothing to copy.'); return; }
        clearTimeout(reset); button.disabled = true;
        var ok = await copy(text);
        button.disabled = false;
        button.textContent = ok ? 'Copied ✓' : 'Copy failed';
        if (!ok && code && window.getSelection) {
          var range = document.createRange(); range.selectNodeContents(code);
          var selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
        }
        announce(ok ? 'Copied to clipboard.' : 'Copy failed. Select the visible text and use your device’s copy command.');
        reset = setTimeout(function () { button.textContent = original; }, 2200);
      });
      expose(button);
    });

    // Native details remain independent; opening a fragment target also opens its ancestors.
    function openFragment(scroll) {
      var id;
      try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
      var target = id && document.getElementById(id);
      if (!target) return;
      for (var node = target; node && node !== body; node = node.parentElement) {
        if (node.tagName === 'DETAILS') node.open = true;
      }
      if (scroll) requestAnimationFrame(function () { target.scrollIntoView({ behavior: 'auto', block: 'start' }); });
    }
    window.addEventListener('hashchange', function () { openFragment(true); });
    document.addEventListener('click', function (event) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      var link = event.target.closest && event.target.closest('a[href]');
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
      var url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
      // Handle repeat clicks to the current fragment too; never toggle a summary in JS.
      if (url.hash === location.hash) openFragment(true);
    });
    openFragment(true);

    var progress = $('#prog'), sectionIndicator = $('#secind');
    var sections = all('[data-title]'), scrollFrame = 0;
    function updateScroll() {
      scrollFrame = 0;
      var height = document.documentElement.scrollHeight - innerHeight;
      if (progress) progress.style.transform = 'scaleX(' + Math.max(0, Math.min(1, height > 0 ? scrollY / height : 0)) + ')';
      if (sectionIndicator && sections.length) {
        var index = 0;
        sections.forEach(function (section, i) { if (section.getBoundingClientRect().top <= innerHeight * 0.55) index = i; });
        sectionIndicator.textContent = '[' + String(index).padStart(2, '0') + '/' + String(sections.length - 1).padStart(2, '0') + '] ' + sections[index].getAttribute('data-title');
      }
    }
    function scheduleScroll() { if (!scrollFrame && active()) scrollFrame = requestAnimationFrame(updateScroll); }
    window.addEventListener('scroll', scheduleScroll, { passive: true });
    all('details.proj').forEach(function (details) { details.addEventListener('toggle', scheduleScroll); });
    if (main && window.ResizeObserver) new ResizeObserver(scheduleScroll).observe(main);
    updateScroll();
    if ('IntersectionObserver' in window) {
      var arrival = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (!entry.isIntersecting) return;
          if (motionAllowed()) entry.target.classList.add('arrive');
          arrival.unobserve(entry.target);
        });
      }, {threshold:.08});
      all('.proj,.cell').forEach(function(el) { arrival.observe(el); });
    }

    // Minute-resolution Mumbai time; no ticking timer while hidden or in the back-forward cache.
    var clock = $('#clock'), clockTimer = 0, formatter;
    try { formatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }); } catch (_) {}
    function syncClock() {
      clearTimeout(clockTimer);
      if (!clock || !formatter || !active()) return;
      clock.textContent = formatter.format(new Date());
      clockTimer = setTimeout(syncClock, 60000 - (Date.now() % 60000) + 50);
    }

    // Original domain-warped ink/paper/orange contour field, capped at 24 fps / 450k pixels.
    // Reduced motion, coarse pointers and narrow viewports render one deterministic still.
    var field = (function () {
      var canvas = $('#gl'), gl, program, buffer, shaders = [], uniforms, frame = 0, lost = false;
      var time = 0, previous = 0, lastDraw = 0, x = innerWidth * 0.7, y = innerHeight * 0.3;
      var vertex = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
      var fragment = [
        'precision mediump float;uniform vec2 r,m;uniform float t,s,e;',
        'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
        'float n(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}',
        'float fbm(vec2 p){float v=0.,a=.5;mat2 R=mat2(.8,.6,-.6,.8);for(int i=0;i<3;i++){v+=a*n(p);p=R*p*2.02;a*=.5;}return v;}',
        'void main(){vec2 p=(gl_FragCoord.xy-.5*r)/r.y,mm=(m-.5*r)/r.y;',
        'float lens=1.-smoothstep(0.,.55,length(p-mm)),T=t*.04;',
        'vec2 q=vec2(fbm(p*1.4+T),fbm(p*1.4-T+5.2));',
        'vec2 w=vec2(fbm(p*1.4+3.*q+vec2(1.7,9.2)+T*1.3),fbm(p*1.4+3.*q+vec2(8.3,2.8)-T));',
        'float f=fbm(p*1.4+3.*w-(p-mm)*lens*.9);float g=abs(fract(f*(9.+e*2.)-t*.015)-.5);',
        'float c=1.-smoothstep(0.,.045,g),fade=1.-clamp(s,0.,1.)*.55;',
        'vec3 ink=vec3(.051,.051,.047),paper=vec3(.925,.91,.875),orange=vec3(1.,.29,.11);',
        'vec3 col=ink+paper*c*.075*fade*(1.-lens)+mix(paper,orange,.85)*c*.55*lens;',
        'col+=paper*pow(f,3.)*.05;col+=(h(gl_FragCoord.xy)-.5)*.025;',
        'col*=mix(.72,1.,1.-smoothstep(.25,1.25,length(p)));gl_FragColor=vec4(col,1.);}'
      ].join('\n');
      function stop() { cancelAnimationFrame(frame); frame = 0; previous = 0; lastDraw = 0; }
      function animating() { return active() && motionAllowed() && fine.matches && desktop.matches; }
      function dispose() {
        if (!gl || lost) return;
        if (buffer) gl.deleteBuffer(buffer);
        if (program) gl.deleteProgram(program);
        shaders.forEach(function (shader) { gl.deleteShader(shader); });
        buffer = program = null; shaders = [];
      }
      function fail() { stop(); dispose(); if (canvas) canvas.classList.add('nogl'); }
      function shader(type, source) {
        var result = gl.createShader(type);
        if (!result) throw new Error('Shader unavailable');
        shaders.push(result); gl.shaderSource(result, source); gl.compileShader(result);
        if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw new Error('Shader compilation failed');
        return result;
      }
      function resize() {
        var scale = Math.min(devicePixelRatio || 1, 1) * 0.65;
        scale = Math.min(scale, Math.sqrt(450000 / Math.max(1, innerWidth * innerHeight)));
        var width = Math.max(1, Math.round(innerWidth * scale)), height = Math.max(1, Math.round(innerHeight * scale));
        if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
      function draw(still) {
        if (!program || lost || !active()) return;
        gl.useProgram(program); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.uniform2f(uniforms.r, canvas.width, canvas.height);
        gl.uniform1f(uniforms.t, still ? 0 : time);
        gl.uniform2f(uniforms.m, (still ? innerWidth * .7 : x) * canvas.width / innerWidth, canvas.height - (still ? innerHeight * .3 : y) * canvas.height / innerHeight);
        gl.uniform1f(uniforms.s, still ? 0 : scrollY / Math.max(1, innerHeight));
        gl.uniform1f(uniforms.e, body.classList.contains('ev') ? 1 : 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      function loop(now) {
        frame = 0;
        if (!animating() || lost || !program) { previous = 0; return; }
        if (previous) time += Math.min((now - previous) / 1000, .1);
        previous = now;
        if (!lastDraw || now - lastDraw >= 1000 / 24) { draw(false); lastDraw = now; }
        frame = requestAnimationFrame(loop);
      }
      function refresh() {
        stop();
        if (!canvas || !program || lost || !active()) return;
        resize(); draw(!animating());
        if (animating()) frame = requestAnimationFrame(loop);
      }
      function init() {
        if (!canvas) return;
        try {
          gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
          if (!gl) { fail(); return; }
          program = gl.createProgram();
          gl.attachShader(program, shader(gl.VERTEX_SHADER, vertex)); gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragment)); gl.linkProgram(program);
          if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Program linking failed');
          gl.useProgram(program); buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
          var attribute = gl.getAttribLocation(program, 'p'); gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
          uniforms = {};
          ['r','m','t','s','e'].forEach(function (name) { uniforms[name] = gl.getUniformLocation(program, name); });
          canvas.classList.remove('nogl'); refresh();
        } catch (_) { fail(); }
      }
      if (canvas) {
        canvas.classList.add('nogl');
        canvas.addEventListener('webglcontextlost', function (event) {
          event.preventDefault(); lost = true; stop(); program = buffer = null; shaders = []; canvas.classList.add('nogl');
        });
        canvas.addEventListener('webglcontextrestored', function () { lost = false; init(); });
        document.addEventListener('pointermove', function (event) {
          if (animating() && event.pointerType !== 'touch') { x = event.clientX; y = event.clientY; }
        }, { passive: true });
        init();
      }
      return { refresh: refresh, stop: stop };
    })();

    var entrance;
    function syncMotion() {
      var enabled = motionAllowed();
      document.documentElement.classList.toggle('motion-paused', !enabled || !active());
      body.classList.toggle('motion-paused', !enabled || !active());
      body.dataset.motion = enabled ? 'on' : 'paused';
      if (entrance && (!enabled || !active())) entrance.cancel();
      if (motionButton) {
        // aria-pressed=true means optional motion is requested; OS reduction takes priority.
        motionButton.setAttribute('aria-pressed', String(enabled));
        motionButton.textContent = enabled ? 'Motion: on' : 'Motion: paused';
        motionButton.title = reduced.matches ? 'Reduced motion follows your system setting' : 'Toggle optional motion';
      }
      field.refresh();
    }
    if (motionButton) {
      motionButton.addEventListener('click', function () {
        if (reduced.matches) { announce('Motion stays paused while your system requests reduced motion.'); return; }
        paused = !paused;
        try { localStorage.setItem('portfolio-motion', paused ? 'paused' : 'on'); } catch (_) {}
        syncMotion(); announce(paused ? 'Optional motion paused.' : 'Optional motion enabled.');
      });
      expose(motionButton);
    }
    watch(reduced, syncMotion); watch(fine, syncMotion); watch(desktop, syncMotion);
    window.addEventListener('resize', function () { field.refresh(); scheduleScroll(); }, { passive: true });
    function lifecycle() { syncMotion(); syncClock(); scheduleScroll(); }
    document.addEventListener('visibilitychange', lifecycle);
    window.addEventListener('pagehide', function () { suspended = true; field.stop(); clearTimeout(clockTimer); cancelAnimationFrame(scrollFrame); scrollFrame = 0; syncMotion(); });
    window.addEventListener('pageshow', function () { suspended = false; lifecycle(); });
    lifecycle();
    var name = $('.name');
    // Final lettering is always real text; entrance never hides it or scrambles it.
    if (name && name.animate && motionAllowed() && active() && !location.hash) {
      entrance = name.animate([{ transform: 'translateY(12px)' }, { transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.2,.7,.1,1)' });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
