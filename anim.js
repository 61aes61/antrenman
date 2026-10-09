/* Antrenman Defteri — hareket animasyonları.
   Her hareket, çizgi bir figürle 2-3 pozisyon arasında oynatılır; altta dikkat edilecek noktalar döner.
   Poz açıları derece: 0 = sağ, 90 = aşağı, -90 = yukarı. */
(function () {
  const L = { t: 50, th: 40, sh: 40, u: 27, f: 25, neck: 6, head: 9 };
  const G = 205; // zemin
  const rad = d => d * Math.PI / 180;
  const P = (o, a, l) => [o[0] + l * Math.cos(rad(a)), o[1] + l * Math.sin(rad(a))];

  function fk(p) {
    let hip;
    if (p.foot) { const knee = P(p.foot, p.sh + 180, L.sh); hip = P(knee, p.th + 180, L.th); }
    else hip = [p.hx, p.hy];
    const knee = P(hip, p.th, L.th), ankle = P(knee, p.sh, L.sh);
    const sho = P(hip, p.t, L.t), head = P(sho, p.t, L.neck + L.head);
    const elb = P(sho, p.ua, L.u), wri = P(elb, p.fa, L.f);
    let knee2, ankle2;
    if (p.th2 != null) { knee2 = P(hip, p.th2, L.th); ankle2 = P(knee2, p.sh2, L.sh); }
    return { hip, knee, ankle, sho, head, elb, wri, knee2, ankle2 };
  }
  const st = (foot, o) => Object.assign({ foot, t: -90, th: 90, sh: 90, ua: 90, fa: 90 }, o);

  const EX = {
    squat: { prop: 'barBack', cues: ['Göğüs dik, sırt düz', 'Dizler ayak yönünde', 'Uyluk yere paralel'],
      f: [st([130, G], { ua: 140, fa: -75 }), st([130, G], { t: -52, th: 8, sh: 115, ua: 178, fa: -37 })] },
    bwsquat: { cues: ['Topuklar yerde', 'Kalça geri ve aşağı', 'Göğüs dik'],
      f: [st([130, G], { ua: 0, fa: 0 }), st([130, G], { t: -55, th: 8, sh: 115, ua: 5, fa: 5 })] },
    bench: { prop: 'bar', bench: { type: 'flat', x: 40, y: 152, w: 110 }, cues: ['Kürek kemikleri sıkışık', 'Bar göğsün alt hizasına', 'Kalça sehpada kalsın'],
      f: [{ hx: 110, hy: 145, t: 180, th: 15, sh: 100, ua: -90, fa: -90 }, { hx: 110, hy: 145, t: 180, th: 15, sh: 100, ua: 115, fa: -75 }] },
    incline: { prop: 'db', bench: { type: 'along', off: -12 }, cues: ['Sehpa 30-45°', 'Dirsekler 45° açıda', 'Yukarıda kilitleme'],
      f: [{ hx: 100, hy: 150, t: -140, th: 5, sh: 95, ua: -95, fa: -95 }, { hx: 100, hy: 150, t: -140, th: 5, sh: 95, ua: 110, fa: -70 }] },
    csrow: { prop: 'db', bench: { type: 'along', off: 12 }, cues: ['Göğüs sehpada sabit', 'Dirsekleri yana aç', 'Tepede sırtı sık'],
      f: [st([70, G], { t: -40, th: 115, sh: 100 }), st([70, G], { t: -40, th: 115, sh: 100, ua: 165, fa: 95 })] },
    lateral: { view: 'front', prop: 'db', cues: ['Omuz hizasına kadar kaldır', 'Dirsekler hafif bükük', 'Savurma, yavaş indir'],
      f: [{ a: 82, b: 86 }, { a: 4, b: 12 }] },
    ohp: { view: 'front', prop: 'db', cues: ['Kulak hizasından başla', 'Beli bükme', 'Yukarıda çarpıştırma'],
      f: [{ a: 12, b: -85 }, { a: -72, b: -85 }] },
    ytw: { view: 'front', lying: true, cues: ['Yüzüstü yat: Y, T, W', 'Her birinde 2 sn tut', 'Kürek kemiklerini sık'],
      f: [{ a: -45, b: -45 }, { a: 0, b: 0 }, { a: 35, b: -55 }], hold: 900 },
    curl: { prop: 'bar', cues: ['Dirsekler gövdeye yapışık', 'Gövde sabit, sallanma', 'Aşağıda kolu tam aç'],
      f: [st([120, G], { ua: 92, fa: 92 }), st([120, G], { ua: 92, fa: -75 })] },
    hammer: { prop: 'db', cues: ['Avuçlar birbirine baksın', 'Dirsekler sabit', 'Kontrollü indir'],
      f: [st([120, G], { ua: 92, fa: 92 }), st([120, G], { ua: 92, fa: -75 })] },
    pushdown: { prop: 'cable', anchor: [150, 18], cues: ['Dirsekler yanlarda sabit', 'Aşağıda kolu tam aç', 'Omuzlar geride'],
      f: [st([110, G], { t: -82, th: 92, ua: 95, fa: -15 }), st([110, G], { t: -82, th: 92, ua: 95, fa: 88 })] },
    ohext: { prop: 'db', cues: ['Dirsekler kulak yanında', 'Dirsekler açılmasın', 'Yukarıda kolu tam aç'],
      f: [st([120, G], { ua: -100, fa: 115 }), st([120, G], { ua: -100, fa: -95 })] },
    plank: { cues: ['Vücut düz bir çizgi', 'Kalça düşmesin', 'Karnını sık, nefes al'],
      f: [st([215, G], { t: 186, th: 6, sh: 6, ua: 92, fa: 180 }), st([215, G], { t: 184, th: 5, sh: 5, ua: 92, fa: 180 })] },
    rdl: { prop: 'bar', cues: ['Dizler hafif bükük, sabit', 'Kalçayı geriye it', 'Sırt düz kalsın'],
      f: [st([130, G], {}), st([130, G], { t: -12, th: 100, sh: 86 })] },
    pulldown: { prop: 'cableUp', bench: { type: 'flat', x: 72, y: 162, w: 56 }, cues: ['Barı göğse çek', 'Dirsekler aşağı ve geri', 'Geriye fazla yaslanma'],
      f: [{ hx: 100, hy: 155, t: -100, th: -3, sh: 95, ua: -80, fa: -80 }, { hx: 100, hy: 155, t: -100, th: -3, sh: 95, ua: 105, fa: -62 }] },
    seatedrow: { prop: 'cableFwd', bench: { type: 'flat', x: 50, y: 190, w: 60 }, cues: ['Gövde sabit', 'Göbeğe doğru çek', 'Kürek kemiklerini sık'],
      f: [{ hx: 82, hy: 183, t: -92, th: -8, sh: 12, ua: 5, fa: 0 }, { hx: 82, hy: 183, t: -92, th: -8, sh: 12, ua: 160, fa: 5 }] },
    crossover: { prop: 'cable', anchor: [28, 16], cues: ['Yukarıdan aşağı çek', 'Kalçanın önünde birleştir', 'Hafif ağırlıkla sık'],
      f: [st([120, G], { t: -75, th: 92, ua: -40, fa: -30 }), st([120, G], { t: -75, th: 92, ua: 75, fa: 80 })] },
    legraise: { cues: ['Bel yere yapışık', 'Bacakları yavaş indir', 'Yere değdirme'],
      f: [{ hx: 125, hy: 196, t: 180, th: -3, sh: -3, ua: 3, fa: 0 }, { hx: 125, hy: 196, t: 180, th: -88, sh: -90, ua: 3, fa: 0 }] },
    pushup: { cues: ['Vücut düz bir çizgi', 'Göğüs yere yaklaşsın', 'Dirsekler 45° açıda'],
      f: [st([215, G], { t: 187, th: 7, sh: 7, ua: 88, fa: 92 }), st([215, G], { t: 182, th: 3, sh: 3, ua: 140, fa: 55 })] },
    bagrow: { prop: 'bag', cues: ['Sırt düz, gövde eğik', 'Çantayı karnına çek', 'Dirsekler geriye'],
      f: [st([120, G], { t: -25, th: 100, sh: 87 }), st([120, G], { t: -25, th: 100, sh: 87, ua: 165, fa: 92 })] },
    pike: { cues: ['Kalça yukarıda, ters V', 'Başı eller arasına indir', 'Dirsekler hafif geride'],
      f: [st([205, G], { t: 125, th: 55, sh: 60, ua: 100, fa: 95 }), st([205, G], { t: 140, th: 55, sh: 60, ua: 60, fa: 115 })] },
    lunge: { cues: ['Geriye adım at', 'İki diz 90°', 'Öndeki topuktan iterek kalk'],
      f: [st([150, G], { th2: 90, sh2: 90 }), st([150, G], { th: 5, sh: 92, th2: 118, sh2: 175 })] },
    bridge: { cues: ['Topuklardan it', 'Tepede 1 sn sık', 'Beli değil kalçayı kullan'],
      f: [{ hx: 115, hy: 196, t: 180, th: -40, sh: 75, ua: 3, fa: 0 }, { hx: 115, hy: 168, t: 160, th: -15, sh: 92, ua: 25, fa: 0 }] },
    deadbug: { cues: ['Bel yere yapışık', 'Karşı kol ve bacağı uzat', 'Yavaşça geri getir'],
      f: [{ hx: 120, hy: 195, t: 180, th: -90, sh: 0, ua: -90, fa: -90 }, { hx: 120, hy: 195, t: 180, th: -12, sh: -8, ua: -168, fa: -175 }] }
  };

  function colors() {
    const cs = getComputedStyle(document.documentElement), g = n => cs.getPropertyValue(n).trim();
    return { ink: g('--ink') || '#ddd', muted: g('--muted') || '#999', line: g('--line') || '#444', accent: g('--accent') || '#88f', surf: g('--surface2') || '#222' };
  }
  function lerp(a, b, t) {
    const o = {};
    for (const k in a) {
      if (Array.isArray(a[k])) o[k] = [a[k][0] + (b[k][0] - a[k][0]) * t, a[k][1] + (b[k][1] - a[k][1]) * t];
      else if (typeof a[k] === 'number') o[k] = a[k] + ((b[k] != null ? b[k] : a[k]) - a[k]) * t;
      else o[k] = a[k];
    }
    return o;
  }
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  function line(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); }

  function drawProp(ctx, ex, j, c) {
    const w = j.wri;
    ctx.lineWidth = 2;
    if (ex.prop === 'bar') { ctx.fillStyle = c.surf; ctx.strokeStyle = c.muted; ctx.beginPath(); ctx.arc(w[0], w[1], 11, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = c.muted; ctx.beginPath(); ctx.arc(w[0], w[1], 2.5, 0, 7); ctx.fill(); }
    if (ex.prop === 'barBack') { const s = j.sho; ctx.fillStyle = c.surf; ctx.strokeStyle = c.muted; ctx.beginPath(); ctx.arc(s[0] - 4, s[1] - 2, 12, 0, 7); ctx.fill(); ctx.stroke(); }
    if (ex.prop === 'db') { ctx.fillStyle = c.accent; ctx.save(); ctx.translate(w[0], w[1]); ctx.fillRect(-9, -3, 18, 6); ctx.fillRect(-11, -6, 5, 12); ctx.fillRect(6, -6, 5, 12); ctx.restore(); }
    if (ex.prop === 'bag') { ctx.fillStyle = c.accent; ctx.fillRect(w[0] - 10, w[1], 20, 22); }
    if (ex.prop === 'cable' || ex.prop === 'cableUp' || ex.prop === 'cableFwd') {
      const a = ex.prop === 'cableUp' ? [w[0], 6] : ex.prop === 'cableFwd' ? [252, w[1]] : ex.anchor;
      ctx.strokeStyle = c.muted; ctx.lineWidth = 1.5; line(ctx, [a, w]);
      ctx.fillStyle = c.accent; ctx.beginPath(); ctx.arc(w[0], w[1], 4.5, 0, 7); ctx.fill();
      if (ex.prop === 'cableUp') { ctx.strokeStyle = c.accent; ctx.lineWidth = 4; line(ctx, [[w[0] - 18, w[1]], [w[0] + 18, w[1]]]); }
    }
  }
  function drawBench(ctx, ex, f0, c) {
    const b = ex.bench; if (!b) return;
    ctx.strokeStyle = c.line; ctx.fillStyle = c.line; ctx.lineWidth = 7; ctx.lineCap = 'round';
    if (b.type === 'flat') { line(ctx, [[b.x, b.y], [b.x + b.w, b.y]]); ctx.lineWidth = 3; line(ctx, [[b.x + 10, b.y], [b.x + 10, G]]); line(ctx, [[b.x + b.w - 10, b.y], [b.x + b.w - 10, G]]); }
    if (b.type === 'along') {
      const j = fk(f0), dx = j.sho[0] - j.hip[0], dy = j.sho[1] - j.hip[1], l = Math.hypot(dx, dy), nx = -dy / l * b.off, ny = dx / l * b.off;
      const p1 = [j.hip[0] + nx - dx * .1, j.hip[1] + ny - dy * .1], p2 = [j.sho[0] + nx, j.sho[1] + ny];
      line(ctx, [p1, p2]); ctx.lineWidth = 3; line(ctx, [p1, [p1[0], G]]);
    }
  }
  function drawSide(ctx, ex, p, c) {
    const j = fk(p);
    drawBench(ctx, ex, ex.f[0], c);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = c.ink;
    if (j.knee2) { ctx.globalAlpha = .45; ctx.lineWidth = 8; line(ctx, [j.hip, j.knee2, j.ankle2]); ctx.globalAlpha = 1; }
    ctx.lineWidth = 8; line(ctx, [j.hip, j.knee, j.ankle]);
    ctx.lineWidth = 11; line(ctx, [j.hip, j.sho]);
    ctx.fillStyle = c.ink; ctx.beginPath(); ctx.arc(j.head[0], j.head[1], L.head, 0, 7); ctx.fill();
    if (ex.prop === 'barBack') drawProp(ctx, ex, j, c);
    ctx.strokeStyle = c.ink; ctx.lineWidth = 7; line(ctx, [j.sho, j.elb, j.wri]);
    if (ex.prop !== 'barBack') drawProp(ctx, ex, j, c);
  }
  function drawFront(ctx, ex, p, c) {
    const cx = 130, top = ex.lying ? 40 : 34;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = c.ink; ctx.fillStyle = c.ink;
    ctx.beginPath(); ctx.arc(cx, top + 10, 11, 0, 7); ctx.fill();
    ctx.lineWidth = 22; line(ctx, [[cx, top + 34], [cx, top + 92]]);
    ctx.lineWidth = 9; line(ctx, [[cx - 8, top + 96], [cx - 11, G]]); line(ctx, [[cx + 8, top + 96], [cx + 11, G]]);
    const sR = [cx + 15, top + 32], sL = [cx - 15, top + 32];
    const eR = P(sR, p.a, L.u), wR = P(eR, p.b, L.f), eL = P(sL, 180 - p.a, L.u), wL = P(eL, 180 - p.b, L.f);
    ctx.lineWidth = 7; line(ctx, [sR, eR, wR]); line(ctx, [sL, eL, wL]);
    if (ex.prop === 'db') { drawProp(ctx, ex, { wri: wR }, c); drawProp(ctx, ex, { wri: wL }, c); }
    if (ex.lying) { ctx.fillStyle = c.muted; ctx.font = '600 11px system-ui,sans-serif'; ctx.fillText('üstten görünüm', 8, 16); }
  }

  function mount(el, key) {
    const ex = EX[key]; if (!ex || el.dataset.on) return;
    el.dataset.on = '1';
    const cv = el.querySelector('canvas'), cap = el.querySelector('.vcap'), ctx = cv.getContext('2d');
    const W = 260, H = 215, dpr = Math.min(3, window.devicePixelRatio || 1);
    cv.width = W * dpr; cv.height = H * dpr; ctx.scale(dpr, dpr);
    const c = colors(), reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const n = ex.f.length, move = 1100, hold = ex.hold || 350, seg = move + hold;
    let t0 = performance.now(), paused = false, pausedAt = 0, ci = -1;
    el.addEventListener('click', () => { if (paused) { t0 += performance.now() - pausedAt; paused = false; el.classList.remove('paused'); } else { paused = true; pausedAt = performance.now(); el.classList.add('paused'); } });
    function frame(now) {
      if (!el.isConnected) return;
      if (!paused || reduce) {
        const e = reduce ? n - 1 : (now - t0) % (seg * n), i = Math.floor(e / seg), r = e - i * seg;
        const a = ex.f[i], b = ex.f[(i + 1) % n], tt = reduce ? 0 : r < hold ? 0 : ease((r - hold) / move);
        const p = lerp(a, b, tt);
        ctx.clearRect(0, 0, W, H);
        ctx.strokeStyle = c.line; ctx.lineWidth = 2; line(ctx, [[0, G + 4], [W, G + 4]]);
        (ex.view === 'front' ? drawFront : drawSide)(ctx, ex, p, c);
        const k = reduce ? -1 : Math.floor((now - t0) / 2600) % ex.cues.length;
        if (k !== ci) { ci = k; cap.textContent = reduce ? ex.cues.join(' · ') : ex.cues[k]; }
      }
      if (!reduce) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  window.ExAnim = { mount, has: k => !!EX[k], cues: k => (EX[k] ? EX[k].cues : []) };
})();
