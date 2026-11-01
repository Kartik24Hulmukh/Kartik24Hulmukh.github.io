/* Local motion lifecycle: no third-party runtime, telemetry, or network audio. */
(function () {
  'use strict';
  var query = window.matchMedia('(prefers-reduced-motion: reduce)'), pref = true;
  try { pref = localStorage.getItem('kh-motion') !== 'off'; } catch (e) {}
  var frames = new Map(), intervals = new Map(), seq = 1, listeners = [], ticks = 0;
  var active = pref && !query.matches && !document.hidden, pending = null, epoch = 0;
  var nativeRAF = window.requestAnimationFrame.bind(window);
  var nativeCancel = window.cancelAnimationFrame.bind(window);
  function report(error) { if (window.console) console.error('Motion callback failed:', error); }
  function invoke(fn, value) { try { fn(value); } catch (error) { report(error); } }
  function snapshot() {
    return { active: active, enabled: pref, systemReduced: query.matches, hidden: document.hidden,
      rafTicks: ticks, pendingFrames: frames.size, intervals: intervals.size };
  }
  // One native frame drains a snapshot. Work requested during it runs next frame.
  // Generation checks also reject callbacks already dispatched when a toggle fires.
  function requestPump() {
    if (!active || pending !== null || !frames.size) return;
    var generation = epoch;
    pending = nativeRAF(function (time) {
      if (!active || generation !== epoch) return;
      pending = null; ticks++;
      var batch = Array.from(frames.entries());
      batch.forEach(function (entry) {
        if (!active || generation !== epoch || !frames.has(entry[0])) return;
        frames.delete(entry[0]);
        invoke(entry[1], time);
      });
      requestPump();
    });
  }
  function startInterval(rec) {
    if (!active || rec.native !== null || !intervals.has(rec.id)) return;
    var generation = epoch;
    rec.native = window.setInterval(function () {
      if (active && generation === epoch && intervals.has(rec.id)) invoke(rec.fn);
    }, rec.ms);
  }
  function paint() { document.documentElement.dataset.motion = active ? 'on' : 'off'; document.documentElement.dataset.pageVisible = String(!document.hidden); }
  function refresh() {
    var next = pref && !query.matches && !document.hidden;
    if (next !== active) {
      active = next; epoch++;
      if (pending !== null) nativeCancel(pending);
      pending = null;
      // Never execute a "last" paused frame. Consumers explicitly settle/restart.
      frames.clear();
      intervals.forEach(function (rec) { window.clearInterval(rec.native); rec.native = null; });
    }
    paint();
    listeners.slice().forEach(function (fn) { invoke(fn, snapshot()); });
    if (active) { intervals.forEach(startInterval); requestPump(); }
  }
  window.PortfolioMotion = {
    raf: function (fn) {
      if (!active || typeof fn !== 'function') return 0;
      var id = seq++; frames.set(id, fn); requestPump(); return id;
    },
    cancel: function (id) {
      frames.delete(id);
      if (!frames.size && pending !== null) { nativeCancel(pending); pending = null; }
    },
    interval: function (fn, ms) {
      var rec = { id: seq++, fn: fn, ms: ms, native: null };
      intervals.set(rec.id, rec); startInterval(rec); return rec.id;
    },
    clearInterval: function (id) {
      var rec = intervals.get(id); if (rec) window.clearInterval(rec.native);
      intervals.delete(id);
    },
    state: snapshot,
    onChange: function (fn) {
      listeners.push(fn); invoke(fn, snapshot());
      return function () { var i = listeners.indexOf(fn); if (i !== -1) listeners.splice(i, 1); };
    },
    setEnabled: function (value) {
      pref = !!value;
      try { localStorage.setItem('kh-motion', pref ? 'on' : 'off'); } catch (e) {}
      refresh();
    }
  };
  paint();
  if (query.addEventListener) query.addEventListener('change', refresh);
  else if (query.addListener) query.addListener(refresh);
  document.addEventListener('visibilitychange', refresh);
})();
