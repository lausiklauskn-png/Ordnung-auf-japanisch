/* Ordnung auf Japanisch — Gong und Pausenklang, erzeugt mit Web Audio (keine Dateien, kein Netz, keine Lizenz).
   Gong: ein Tempelglocken-Ton aus unharmonischen Teiltönen. Pausenklang: gezupfte Töne in einer japanischen
   Tonleiter (Hirajōshi), dazu ein leiser Grundton — ruhig, ohne Melodie zum Mitsummen. */
(function () {
  let ctx = null, musik = null;
  const kontext = () => {
    if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; ctx = new A(); }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
  function gong(laut = .5) {
    const c = kontext(); if (!c) return;
    const t = c.currentTime, aus = c.createGain(); aus.gain.value = laut; aus.connect(c.destination);
    [[196, 1, 5.5], [196 * 2.76, .45, 3.2], [196 * 5.4, .22, 1.8], [196 * 8.9, .1, 1.1]].forEach(([f, v, d]) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g).connect(aus); o.start(t); o.stop(t + d + .1);
    });
    (window.__klang = window.__klang || []).push('gong');
  }
  // Hirajōshi auf D: D E F A Bb, zwei Oktaven
  const TOENE = [293.7, 329.6, 349.2, 440, 466.2, 587.3, 659.3, 698.5, 880];
  function zupfen(c, ziel, f, t) {
    const o = c.createOscillator(), g = c.createGain(), fl = c.createBiquadFilter();
    o.type = 'triangle'; o.frequency.value = f;
    fl.type = 'lowpass'; fl.frequency.setValueAtTime(3200, t); fl.frequency.exponentialRampToValueAtTime(500, t + 1.4);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.16, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + 2.6);
    o.connect(fl).connect(g).connect(ziel); o.start(t); o.stop(t + 2.7);
  }
  function musikStart() {
    const c = kontext(); if (!c || musik) return;
    const aus = c.createGain(); aus.gain.value = 0; aus.gain.linearRampToValueAtTime(.55, c.currentTime + 2); aus.connect(c.destination);
    // Hall: zwei Echos mit Rückkopplung
    const echo = c.createDelay(1.5), rueck = c.createGain(); echo.delayTime.value = .42; rueck.gain.value = .38;
    echo.connect(rueck).connect(echo); echo.connect(aus);
    const trocken = c.createGain(); trocken.gain.value = .8; trocken.connect(aus); trocken.connect(echo);
    const grund = c.createOscillator(), gg = c.createGain(); grund.type = 'sine'; grund.frequency.value = 73.4; gg.gain.value = .05;
    grund.connect(gg).connect(aus); grund.start();
    let naechste = c.currentTime + .3;
    const takt = setInterval(() => {
      while (naechste < c.currentTime + 1) {
        zupfen(c, trocken, TOENE[Math.floor(Math.random() * TOENE.length)], naechste);
        if (Math.random() < .25) zupfen(c, trocken, TOENE[Math.floor(Math.random() * 4)] / 2, naechste + .05);
        naechste += [.6, .9, 1.2, 1.8, 2.4][Math.floor(Math.random() * 5)];
      }
    }, 250);
    musik = { aus, grund, takt };
    (window.__klang = window.__klang || []).push('musik-an');
  }
  function musikStopp() {
    if (!musik || !ctx) return;
    const m = musik; musik = null; clearInterval(m.takt);
    m.aus.gain.cancelScheduledValues(ctx.currentTime); m.aus.gain.setValueAtTime(m.aus.gain.value, ctx.currentTime);
    m.aus.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
    setTimeout(() => { try { m.grund.stop(); m.aus.disconnect(); } catch (_) {} }, 1400);
    (window.__klang = window.__klang || []).push('musik-aus');
  }
  // leiser, solange gesprochen wird
  function ducken(an) { if (musik && ctx) musik.aus.gain.setTargetAtTime(an ? .15 : .55, ctx.currentTime, .3); }
  (window.OJ = window.OJ || {}).Klang = { gong, musikStart, musikStopp, ducken, laeuft: () => !!musik, wecken: kontext };
})();
