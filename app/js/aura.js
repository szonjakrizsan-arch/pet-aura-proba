// Aura Scanner képernyők: indító · fotózás · portré igazítása · elemzés · sikertelen próba · eredmény.
// A jóváhagyott próbaoldalak (pet-aura-proba) logikája, az app keretébe illesztve. Minden felirat a szótárból (t) jön.
import { SEAL_SHARDS, IC_GAL, IC_SHOOT, IC_GAL2, IC_SWAP } from './aura-deco.js?v=0.6.56';
import { ICON } from './home.js?v=0.6.56';
import { resultScreen, archiveScreen } from './aura-result.js?v=0.6.56';

const A = (f) => `assets/aura/${f}`;
const RM = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
// A folyamat állapota (memóriában; a kész appban a fotó nem hagyja el a telefont a gazdi tudta nélkül)
export const FLOW = { photo: null, fromGallery: false, dir: null, portrait: null, species: null, fail: null, test: {} };
const DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

// ---------- közös: csillagpor-vászon (a képernyő-gyökérhez képest) ----------
function dustLoop(root, canvas, spawnFn, opts = {}) {
  const dx = canvas.getContext('2d'); let P = [], next = 0, tp = performance.now(), alive = true;
  const size = () => { canvas.width = root.clientWidth * devicePixelRatio; canvas.height = root.clientHeight * devicePixelRatio; }; size();
  const rel = (r) => { const b = root.getBoundingClientRect(); return { left: r.left - b.left, top: r.top - b.top, right: r.right - b.left, bottom: r.bottom - b.top, width: r.width, height: r.height }; };
  function loop(now) {
    if (!alive) return; const dt = Math.min(.1, (now - tp) / 1000); tp = now; const d = devicePixelRatio; dx.clearRect(0, 0, canvas.width, canvas.height);
    if (!RM()) {
      next -= dt; while (next <= 0 && P.length < (opts.max || 34)) { const p = spawnFn(rel, now); if (p) P.push(p); next += -Math.log(1 - Math.random()) / (opts.rate || 3.5) * (Math.random() < .2 ? 3.5 : 1); }
      P = P.filter((p) => { p.life += dt / p.dur; if (p.life >= 1) return false; p.y -= (p.v || 0) * dt; p.x += (p.dr || 0) * dt; if (p.toward) { const k = .22 * dt; p.x += (p.toward[0] - p.x) * k; p.y += (p.toward[1] - p.y) * k; } if (p.lim && p.y < p.lim && p.life < .8) p.life = .8;
        let al = Math.min(1, p.life / (p.k === 2 ? .35 : .15)) * Math.pow(1 - p.life, p.k === 2 ? .7 : 1.2) * (p.k === 0 ? 1 : .9) * (.8 + .2 * Math.sin(now / 1000 * 2.3 + p.ph)) * (p.crisp ? 1.7 : 1); if (al > 1) al = 1;
        const x = (p.x + Math.sin(now / 1000 * p.f + p.ph) * p.sw * (p.k === 0 ? .4 : 1)) * d, y = p.y * d, rr = p.r * d, R4 = rr * (p.k === 0 ? 3.5 : 4.5);
        const g = dx.createRadialGradient(x, y, 0, x, y, R4); g.addColorStop(0, p.k === 0 ? `rgba(255,250,228,${al})` : p.crisp ? `rgba(255,255,255,${al * .9})` : `rgba(${p.c},${al})`); g.addColorStop(p.k === 0 ? .18 : .12, `rgba(${p.c},${al * .9})`); g.addColorStop(.42, `rgba(${p.c},${al * .35})`); g.addColorStop(1, `rgba(${p.c},0)`);
        dx.fillStyle = g; dx.beginPath(); dx.arc(x, y, R4, 0, 7); dx.fill();
        if (p.star) { const L = rr * 6 * (.6 + .4 * Math.sin(now / 1000 * 3.1 + p.ph)); dx.strokeStyle = `rgba(255,246,214,${al * .8})`; dx.lineWidth = Math.max(.6, rr * .35); dx.lineCap = 'round'; dx.beginPath(); dx.moveTo(x - L, y); dx.lineTo(x + L, y); dx.moveTo(x, y - L); dx.lineTo(x, y + L); dx.stroke(); }
        return true; });
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop); addEventListener('resize', size);
  return () => { alive = false; removeEventListener('resize', size); };
}
const kind = (x, y, extra = {}) => { const k = Math.random(); return Object.assign(k < .5 ? { k: 0, r: 1.1 + Math.random() * .9, v: 12 + Math.random() * 20, dur: 2.4 + Math.random() * 2.6, c: '255,214,130', star: Math.random() < .4 }
  : k < .82 ? { k: 1, r: 2.1 + Math.random() * 1.6, v: 6 + Math.random() * 10, dur: 4 + Math.random() * 4, c: Math.random() < .5 ? '110,232,222' : '208,172,255' }
  : { k: 2, r: 3.8 + Math.random() * 2.8, v: 2.5 + Math.random() * 5, dur: 6.5 + Math.random() * 5, c: ['255,222,156', '128,228,222', '214,188,255'][Math.floor(Math.random() * 3)] },
  { x, y, life: 0, sw: 4 + Math.random() * 10, f: .3 + Math.random() * .8, ph: Math.random() * 7, dr: (Math.random() - .5) * 6 }, extra); };
const stars = (root, canvas) => { const sx = canvas.getContext('2d'); let ST = [], alive = true; const size = () => { canvas.width = root.clientWidth * devicePixelRatio; canvas.height = root.clientHeight * devicePixelRatio; ST = Array.from({ length: 40 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.3 + .3, p: Math.random() * 6 })); }; size(); const t0 = performance.now();
  (function f(now) { if (!alive) return; const t = (now - t0) / 1000; sx.clearRect(0, 0, canvas.width, canvas.height); ST.forEach((s) => { sx.globalAlpha = .35 + .35 * Math.sin(t * 1.3 + s.p); sx.fillStyle = '#fff3d6'; sx.beginPath(); sx.arc(s.x * canvas.width, s.y * canvas.height, s.r * devicePixelRatio, 0, 7); sx.fill(); }); sx.globalAlpha = 1; requestAnimationFrame(f); })(t0);
  addEventListener('resize', size); return () => { alive = false; removeEventListener('resize', size); }; };
const fileToData = (f, max = 1600, q = .9) => new Promise((res) => { const u = URL.createObjectURL(f), im = new Image(); im.onload = () => { const k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight)), cv = document.createElement('canvas'); cv.width = Math.round(im.naturalWidth * k); cv.height = Math.round(im.naturalHeight * k); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); URL.revokeObjectURL(u); res(cv.toDataURL('image/jpeg', q)); }; im.src = u; });
const pickFile = (cb) => { const i = document.getElementById('file'); i.onchange = (e) => { const f = e.target.files[0]; i.value = ''; if (f) cb(f); }; i.click(); };
const medal = (id, label, svg, extra = '') => `<button class="medal" id="${id}" aria-label="${label}" ${extra}>${svg}</button>`;

// ================= 1. INDÍTÓ =================
function startScreen(ctx) {
  const { t, esc, pet, go, back } = ctx, name = pet.name || t('au.start.noname'), sp = pet.species;
  const sptxt = (sp === 'dog' ? [['au.start.dog']] : sp === 'cat' ? [['au.start.cat']] : [['au.start.dog'], ['au.start.cat']]).map(([k]) => `<div class="sp">${t(k).replace(/^([^:：]+[:：])/, '<b>$1</b>')}</div>`).join('');
  const html = `<div class="au au-start"><canvas class="fx" id="stars"></canvas><canvas class="fx" id="dust" style="z-index:1"></canvas>
  <div class="wrap">
   <div class="top ap" style="--d:.05s"><a class="round" id="back" role="button" tabindex="0" aria-label="${esc(t('back'))}">${ICON.back}</a><h1>${esc(t('au.start.title'))}</h1></div>
   <div class="pet ap" id="pet" style="--d:.2s"><div class="wreath"><i class="wg"></i><i class="wt"></i><i class="wv"></i></div><div class="ph swap" id="ph" role="button" tabindex="0" aria-label="${esc(t('au.start.photo'))}">${pet.photo ? '' : `<span class="nophoto">${ICON.paw}<small>${esc(t('au.start.photo'))}</small></span>`}</div><img id="frm" src="${A('portrekeret.webp')}" alt=""><div class="shine" id="shine"><i></i></div><span class="tw"></span><span class="tw" style="animation-delay:1.6s"></span><span class="tw" style="animation-delay:3.1s"></span></div>
   <a class="name ap" id="name" style="--d:.45s" role="button" tabindex="0" aria-label="${esc(t('au.start.swap'))}"><span id="nm" class="swap">${esc(name)}</span>${IC_SWAP}</a>
   <div class="fl"></div>
   <div class="scroll ap" style="--d:.7s"><div class="p-mid"></div><img class="p-top" src="${A('perg_felso.webp')}" alt=""><img class="p-bot" src="${A('perg_also.webp')}" alt=""><div class="plight"><i></i></div>${SEAL_SHARDS}
    <div class="p-in"><h2>${esc(t('au.start.h'))}</h2><div class="lead">${esc(t('au.start.lead'))}</div>
     <ul>${[1, 2, 3, 4, 5].map((i) => `<li>${esc(t('au.start.p' + i))}</li>`).join('')}</ul>
     ${sptxt}<div class="ok">${esc(t('au.start.ok'))}</div></div></div>
   <nav class="acts"><a class="main ap" id="shoot" role="button" tabindex="0" style="--d:1.05s">${IC_SHOOT}<span>${esc(t('au.start.shoot'))}</span></a><a class="sec ap" id="gal" role="button" tabindex="0" style="--d:1.2s">${IC_GAL2}<span>${esc(t('au.start.gallery'))}</span></a></nav>
   <div class="gal ap" style="--d:1.4s">${esc(t('au.start.galnote'))}</div>
  </div></div>`;
  const mount = (root) => {
    const q = (s) => root.querySelector(s), ph = q('#ph');
    if (pet.photo) ph.style.backgroundImage = `url(${pet.photo})`;
    { const sh = q('#shine'); sh.style.webkitMaskImage = sh.style.maskImage = `url(${A('portrekeret.webp')})`; }
    root.querySelectorAll('.tw').forEach((s) => { const mv = () => { const a = Math.random() * Math.PI * 2, r = 41 + Math.random() * 5; s.style.left = (50 + r * Math.cos(a)) + '%'; s.style.top = (50 + r * Math.sin(a)) + '%'; }; mv(); s.addEventListener('animationiteration', mv); });
    const petEl = q('#pet'), R0 = q('.au-start');
    function fit() { const vh = root.clientHeight, vw = root.clientWidth, m = (s) => { const e = q(s); return { top: e.offsetTop, bottom: e.offsetTop + e.offsetHeight }; };
      R0.classList.remove('tight'); const base = Math.max(112, Math.min(176, vh * 0.22 - 30)), max = Math.min(266, vw * 0.62); petEl.style.width = base + 'px';
      const gap = m('.acts').top - m('.scroll').bottom - 12; if (gap > 0) { petEl.style.width = Math.min(max, base + gap * 0.85) + 'px'; return; }
      const over = () => m('.acts .sec').bottom - (vh - 10); let o = over(); if (o <= 0) return;
      petEl.style.width = Math.max(104, base - o) + 'px'; if (over() <= 0) return;
      R0.classList.add('tight'); petEl.style.width = base + 'px'; o = over(); if (o > 0) petEl.style.width = Math.max(92, base - o) + 'px'; }
    fit(); const onR = () => fit(); addEventListener('resize', onR); document.fonts && document.fonts.ready.then(fit);
    const stop1 = stars(root, q('#stars'));
    const born0 = performance.now();
    const stop2 = dustLoop(root, q('#dust'), (rel, now) => { if (now - born0 < 1600) return null; const nm = rel(q('#name').getBoundingClientRect()), sc = rel(q('.scroll').getBoundingClientRect()), ac = rel(q('.acts').getBoundingClientRect()), edge = Math.max(14, sc.width * .055), z = Math.random(); let x, y, p;
      if (z < .34) { x = sc.left + sc.width * (.08 + Math.random() * .84); y = sc.top + 4 - Math.random() * Math.max(8, (sc.top - nm.bottom) * .5); p = kind(x, y); }
      else if (z < .72) { const L = Math.random() < .5; x = L ? sc.left - 4 + Math.random() * (edge + 4) : sc.right + 4 - Math.random() * (edge + 4); y = sc.top + sc.height * (.2 + Math.random() * .78); p = kind(x, y, { sw: 2 + Math.random() * 3, dr: 0, lim: sc.top + 6 }); p.v *= .8; p.k = p.k === 2 ? 2 : 1; p.star = false; p.r = p.k === 2 ? 3.4 + Math.random() * 1.8 : 2.2 + Math.random() * 1.4; p.c = Math.random() < .5 ? '40,196,192' : '150,96,240'; p.crisp = true; }
      else { const L = Math.random() < .5; x = L ? ac.left - 6 + Math.random() * 22 : ac.right + 6 - Math.random() * 22; y = ac.top + Math.random() * ac.height + 10; p = kind(x, y); }
      return p; });
    q('#back').onclick = () => back('home');
    q('#shoot').onclick = () => { FLOW.fromGallery = false; go('aura/kamera'); };
    q('#gal').onclick = () => pickFile(async (f) => { FLOW.photo = await fileToData(f); FLOW.fromGallery = true; FLOW.dir = null; go('aura/igazitas'); });
    ph.onclick = () => pickFile(async (f) => { const d = await fileToData(f, 512, .85); ctx.savePet({ photo: d }); ph.style.backgroundImage = `url(${d})`; const n = ph.querySelector('.nophoto'); if (n) n.remove(); });
    q('#name').onclick = () => go('pets');
    return () => { stop1(); stop2(); removeEventListener('resize', onR); };
  };
  return { html, mount, back: 'home' };
}

// ================= 2. FOTÓZÁS =================
function cameraScreen(ctx) {
  const { t, esc, go, back } = ctx;
  const html = `<div class="au au-cam"><svg id="astro" viewBox="-100 -100 200 200" aria-hidden="true"><g fill="none" stroke="#e8c27a" stroke-width=".3" id="ag"></g></svg><canvas class="fx" id="dust"></canvas>
  <div class="screen"><div class="frame" id="frame"><div class="cam" id="cam"><video id="v" playsinline muted autoplay></video><canvas id="c"></canvas><canvas class="vdust" id="vd"></canvas><div class="msg" id="msg"><div>${esc(t('au.cam.wake'))}</div></div></div><img src="${A('kamerakeret.webp')}" alt=""></div>
   <div class="bottom"><div class="unit" id="unit"><span class="pointer"></span><div class="ringwrap" id="ring"><img src="${A('gyuru.webp')}" alt=""><div class="wave" id="wave"></div></div><button class="lens" id="lens" aria-label="${esc(t('au.cam.shot'))}"><span class="core" id="core"></span></button></div>
   ${medal('gal', esc(t('au.start.gallery')), IC_GAL, 'style="--sw:11s;--sl:6s"')}<div class="state" id="state">&nbsp;</div></div></div>
  ${medal('back', esc(t('back')), ICON.back, 'style="--sw:10s;--sl:3.5s"')}</div>`;
  const mount = (root) => {
    const q = (s) => root.querySelector(s), v = q('#v'), c = q('#c'), msg = q('#msg'), unit = q('#unit'), ring = q('#ring'), stateEl = q('#state'), core = q('#core');
    { let s = ''; const L = (r1, r2, a) => { const th = a * Math.PI / 180; return `<line x1="${Math.sin(th) * r1}" y1="${-Math.cos(th) * r1}" x2="${Math.sin(th) * r2}" y2="${-Math.cos(th) * r2}"/>`; };
      [98, 92, 70, 44, 20].forEach((r) => s += `<circle r="${r}"/>`); for (let i = 0; i < 12; i++) s += L(70, 92, i * 30); for (let i = 0; i < 72; i++) s += L(92, i % 6 ? 94 : 96, i * 5); for (let i = 0; i < 12; i++) s += L(20, 44, i * 30 + 15); q('#ag').innerHTML = s; }
    [[49.9, 5.5], [32.8, 13.8], [67.3, 13.9], [22.6, 19.7], [77.5, 19.8], [50, 22.1], [8.9, 29.4], [91.1, 29.4], [8.8, 50.8], [91.2, 50.8], [36.4, 91], [63.7, 91], [50.1, 91.5], [10.2, 18.2], [89.6, 18.3]].forEach(([x, y], i) => { const s = document.createElement('span'); s.className = 'gl'; s.style.left = x + '%'; s.style.top = y + '%'; s.style.setProperty('--d', (5.5 + ((i * 37) % 50) / 10) + 's'); s.style.setProperty('--l', (-((i * 53) % 70) / 10) + 's'); q('#frame').appendChild(s); });
    const letEls = []; ['N', 'E', 'S', 'W'].forEach((d) => { const w = document.createElement('div'); w.className = 'let'; const b = document.createElement('b'); b.textContent = t('au.dir.s.' + d); w.appendChild(b); ring.appendChild(w); letEls.push(b); });
    const placeLetters = () => { const R = unit.clientWidth / 2 - 6; letEls.forEach((b, i) => { const a = i * 90 * Math.PI / 180; b.style.left = Math.sin(a) * R + 'px'; b.style.top = -Math.cos(a) * R + 'px'; }); };
    // csillagpor a keret két oldalán és az iránytű körül
    const stopDust = dustLoop(root, q('#dust'), (rel) => { const f = rel(q('#frame').getBoundingClientRect()), u = rel(unit.getBoundingClientRect()); let x, y;
      if (Math.random() < .55) { const L = Math.random() < .5; x = L ? f.left + f.width * (.02 + Math.random() * .1) : f.right - f.width * (.02 + Math.random() * .1); y = f.top + f.height * (.2 + Math.random() * .75); }
      else { const a = Math.random() * Math.PI * 2, r = u.width * (.5 + Math.random() * .25); x = u.left + u.width / 2 + Math.cos(a) * r; y = u.top + u.height / 2 + Math.sin(a) * r; }
      const p = kind(x, y); if (p.k === 0) { p.r = 1 + Math.random() * .9; p.v = 12 + Math.random() * 18; p.star = Math.random() < .35; } return p; }, { rate: 4, max: 38 });
    // varázstükör-vignetta csillagpora a kamerakép peremén
    const vd = q('#vd'), vx = vd.getContext('2d'); let VP = [], alive = true;
    const sizeV = () => { const r = q('#cam').getBoundingClientRect(); vd.width = r.width * devicePixelRatio; vd.height = r.height * devicePixelRatio; VP = []; for (let i = 0; i < 34; i++) { const e = Math.random() * 4 | 0, tt = Math.random(), m = Math.random() * .022; VP.push({ x: e === 0 ? m : e === 1 ? 1 - m : tt, y: e === 2 ? m : e === 3 ? 1 - m : tt, r: .5 + Math.random() * 1.1, ph: Math.random() * 7, s: .6 + Math.random() * 1.4, c: Math.random() < .6 ? '255,220,150' : '206,176,255' }); } };
    (function vig(now) { if (!alive) return; const d = devicePixelRatio; vx.clearRect(0, 0, vd.width, vd.height); if (!RM()) VP.forEach((p) => { const al = Math.max(0, Math.sin(now / 1000 * p.s + p.ph)) * .75, x = p.x * vd.width, y = p.y * vd.height, R = p.r * d * 3.2; const g = vx.createRadialGradient(x, y, 0, x, y, R); g.addColorStop(0, `rgba(255,250,230,${al})`); g.addColorStop(.3, `rgba(${p.c},${al * .6})`); g.addColorStop(1, `rgba(${p.c},0)`); vx.fillStyle = g; vx.beginPath(); vx.arc(x, y, R, 0, 7); vx.fill(); }); requestAnimationFrame(vig); })(performance.now());
    // kamera
    let stream = null; const say = (h) => { msg.innerHTML = '<div>' + h + '</div>'; msg.style.display = 'flex'; };
    async function startCam() { if (stream) { stream.getTracks().forEach((x) => x.stop()); stream = null; } unit.classList.remove('ready');
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) { say(esc(t('au.cam.nocam'))); return; }
      try { stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } } }); v.srcObject = stream; await v.play().catch(() => {}); msg.style.display = 'none'; unit.classList.add('ready'); }
      catch (e) { say(esc(e.name === 'NotAllowedError' ? t('au.cam.denied') : t('au.cam.fail'))); } }
    // iránymérés: a hátlapi kamera nézési iránya
    let heading = null, shown = 0, hist = [], locked = null, gotEvent = false, iosAsked = false, idle = 0;
    const camHeading = (a, b, g) => { const r = Math.PI / 180, ca = Math.cos(a * r), sa = Math.sin(a * r), sb = Math.sin(b * r), cg = Math.cos(g * r), sg = Math.sin(g * r); const E = -(ca * sg + sa * sb * cg), N = -(sa * sg - ca * sb * cg); if (Math.hypot(E, N) < .2) return null; return (Math.atan2(E, N) * 180 / Math.PI + 360) % 360; };
    const onOri = (e) => { let h = null; if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading; else if (e.absolute && e.alpha != null) h = camHeading(e.alpha, e.beta, e.gamma); if (h == null) return; gotEvent = true; heading = h; };
    const evName = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation'; addEventListener(evName, onOri);
    const angDiff = (a, b) => ((a - b + 540) % 360) - 180, setState = (s, ok) => { stateEl.textContent = s; stateEl.classList.toggle('ok', !!ok); };
    const t0 = performance.now();
    function lock(h) { const i = Math.round(h / 45) % 8; locked = { h, i }; unit.classList.remove('calib'); const w = q('#wave'); w.classList.remove('go'); void w.offsetWidth; w.classList.add('go'); core.classList.remove('flash'); void core.offsetWidth; core.classList.add('flash'); setTimeout(() => core.classList.remove('flash'), 1100);
      letEls.forEach((b, k) => b.classList.toggle('lit', [0, 2, 4, 6][k] === i || (i % 2 && ([0, 2, 4, 6][k] === i - 1 || [0, 2, 4, 6][k] === (i + 1) % 8)))); setState(t('au.cam.locked', { dir: t('au.dir.' + DIRS[i]) }) + ' ✦', true); }
    (function tick() { if (!alive) return;
      if (heading != null) { shown += angDiff(heading, shown) * .12; ring.style.transform = `rotate(${-shown}deg)`; letEls.forEach((b) => b.style.transform = `translate(-50%,-50%) rotate(${shown}deg)`);
        const now = performance.now(); hist.push([now, heading]); hist = hist.filter((h) => now - h[0] < 1600); const spread = Math.max(...hist.map((h) => Math.abs(angDiff(h[1], heading))));
        if (locked === null) { unit.classList.add('calib'); setState(t('au.cam.search')); if (hist.length > 12 && now - hist[0][0] > 1400 && spread < 7) lock(heading); }
        else if (Math.abs(angDiff(heading, locked.h)) > 28) { locked = null; letEls.forEach((b) => b.classList.remove('lit')); } }
      else { idle += .08; ring.style.transform = `rotate(${idle}deg)`; letEls.forEach((b) => b.style.transform = `translate(-50%,-50%) rotate(${-idle}deg)`); if (performance.now() - t0 > 4500 && !gotEvent) setState(t('au.cam.nocompass')); else if (!gotEvent) setState(t('au.cam.search2')); }
      requestAnimationFrame(tick); })();
    q('#lens').onclick = () => { if (!iosAsked && window.DeviceOrientationEvent?.requestPermission) { iosAsked = true; DeviceOrientationEvent.requestPermission().catch(() => {}); }
      if (!stream) return; const vw = v.videoWidth, vh = v.videoHeight; if (!vw) return; let sw = vw, sh = vw * 5 / 4; if (sh > vh) { sh = vh; sw = vh * 4 / 5; }
      c.width = Math.round(sw); c.height = Math.round(sh); c.getContext('2d').drawImage(v, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, c.width, c.height); c.style.display = 'block';
      core.classList.remove('flash'); void core.offsetWidth; core.classList.add('flash'); setState(t('au.cam.done') + ' ✦', true);
      FLOW.photo = c.toDataURL('image/jpeg', .9); FLOW.fromGallery = false; FLOW.dir = locked ? DIRS[locked.i] : null; setTimeout(() => go('aura/igazitas'), 650); };
    q('#gal').onclick = () => pickFile(async (f) => { FLOW.photo = await fileToData(f); FLOW.fromGallery = true; FLOW.dir = null; go('aura/igazitas'); });
    q('#back').onclick = () => back('aura');
    const layout = () => { sizeV(); placeLetters(); }; layout(); const onR = () => setTimeout(layout, 200); addEventListener('resize', onR); document.fonts && document.fonts.ready.then(placeLetters);
    const onVis = () => { if (document.hidden && stream) { stream.getTracks().forEach((x) => x.stop()); stream = null; } else if (!document.hidden && !stream) startCam(); }; document.addEventListener('visibilitychange', onVis);
    startCam();
    return () => { alive = false; stopDust(); removeEventListener(evName, onOri); removeEventListener('resize', onR); document.removeEventListener('visibilitychange', onVis); if (stream) stream.getTracks().forEach((x) => x.stop()); };
  };
  return { html, mount, back: 'aura' };
}

// ================= 3. PORTRÉ IGAZÍTÁSA =================
function alignScreen(ctx) {
  const { t, esc, pet, go, back } = ctx;
  const PAW = '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="16" rx="5" ry="4.2"/><ellipse cx="5.5" cy="10.5" rx="2" ry="2.6"/><ellipse cx="9.5" cy="6.5" rx="2" ry="2.7"/><ellipse cx="14.5" cy="6.5" rx="2" ry="2.7"/><ellipse cx="18.5" cy="10.5" rx="2" ry="2.6"/></svg>';
  // Eset: biztos (az adatlapi faj; nincs kérdés) · bizonytalan (hangolás) · elteres (nagyon biztos eltérés). A felismerő a 4. szakaszban jön; addig: ismert faj → biztos, ismeretlen → bizonytalan. Próba: FLOW.test.faj.
  const CASE = FLOW.test.faj || (pet.species ? 'biztos' : 'bizonytalan'), seen = CASE === 'elteres' ? (pet.species === 'cat' ? 'dog' : 'cat') : null, name = pet.name || t('au.start.noname');
  const html = `<div class="au au-al"><canvas class="fx" id="dust"></canvas>${medal('back', esc(t('back')), ICON.back)}
  <div class="screen"><h1>${esc(t('au.al.title'))}</h1><div class="sub">${esc(t('au.al.sub'))}</div>
   <div class="pf" id="pf"><div class="halo"></div><div class="wreath"><i class="wg"></i><i class="wt"></i><i class="wv"></i></div>
    <div class="ph" id="ph"><img id="img" alt=""><svg class="geo" viewBox="-100 -100 200 200" aria-hidden="true"><g fill="none" stroke="#ffd98a" stroke-width=".7" id="geo"></g></svg><div class="empty" id="empty"><div>${esc(t('au.al.nophoto'))}</div><button class="cap" id="pick">${esc(t('au.al.pick'))}</button></div></div>
    <img src="${A('portrekeret.webp')}" alt=""><div class="shine"><i></i></div></div>
   <div class="hint">${esc(t('au.al.hint'))}</div>
   <div class="zoom"><span>−</span><input type="range" id="zoom" min="1" max="4" step="0.01" value="1" aria-label="${esc(t('au.al.zoom'))}"><span>+</span></div>
   <div class="tune" id="tune"></div>
   <div class="acts"><button class="main" id="ok">✦ ${esc(t('au.al.ok'))}</button><button class="sec" id="again">↺ ${esc(t('au.al.again'))}</button></div></div>
  <div class="done" id="done">${esc(t('au.al.done'))} ✦</div></div>`;
  const mount = (root) => {
    const q = (s) => root.querySelector(s), ph = q('#ph'), img = q('#img'), zoom = q('#zoom'), okBtn = q('#ok'), R0 = q('.au-al');
    { const F = 1.618; let s = '<line x1="-100" y1="0" x2="100" y2="0"/><line x1="0" y1="-100" x2="0" y2="100"/>'; [100 / F, 100 / F / F, 100 / F / F / F].forEach((r) => s += `<circle r="${r}"/>`); for (let i = 0; i < 6; i++) { const a = i * 60 * Math.PI / 180, r = 100 / F / F; s += `<circle cx="${Math.cos(a) * r}" cy="${Math.sin(a) * r}" r="${r}"/>`; }
      const p = (k) => [0, 1, 2].map((i) => { const a = (k + i * 120) * Math.PI / 180; return (Math.sin(a) * 100 / F) + ',' + (-Math.cos(a) * 100 / F); }).join(' '); s += `<polygon points="${p(0)}"/><polygon points="${p(180)}"/>`; q('#geo').innerHTML = s; }
    let iw = 0, ih = 0, D = 0, base = 1, z = 1, tx = 0, ty = 0;
    const clamp = () => { const s = base * z; tx = Math.min(0, Math.max(D - iw * s, tx)); ty = Math.min(0, Math.max(D - ih * s, ty)); };
    const apply = () => { clamp(); img.style.transform = `translate(${tx}px,${ty}px) scale(${base * z})`; zoom.value = z; zoom.style.setProperty('--p', ((z - 1) / 3 * 100) + '%'); };
    const fit = (keep) => { D = ph.clientWidth; if (!iw) return; const cx = keep ? (D / 2 - tx) / (base * z) : iw / 2, cy = keep ? (D / 2 - ty) / (base * z) : ih * .42; base = Math.max(D / iw, D / ih); if (!keep) z = 1; tx = D / 2 - cx * base * z; ty = D / 2 - cy * base * z; apply(); };
    const setZoom = (nz, px, py) => { nz = Math.min(4, Math.max(1, nz)); const s0 = base * z, s1 = base * nz; px = px ?? D / 2; py = py ?? D / 2; tx = px - (px - tx) * s1 / s0; ty = py - (py - ty) * s1 / s0; z = nz; apply(); };
    const load = (src) => { img.onload = () => { iw = img.naturalWidth; ih = img.naturalHeight; q('#empty').style.display = 'none'; fit(false); }; img.src = src; };
    const pts = new Map(); let pinch = null; const touching = (on) => ph.classList.toggle('touch', on);
    ph.addEventListener('pointerdown', (e) => { if (!iw) return; ph.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); touching(true); if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), z }; } });
    ph.addEventListener('pointermove', (e) => { if (!pts.has(e.pointerId)) return; const p = pts.get(e.pointerId), r = ph.getBoundingClientRect(); if (pts.size === 1) { tx += e.clientX - p[0]; ty += e.clientY - p[1]; pts.set(e.pointerId, [e.clientX, e.clientY]); apply(); } else if (pts.size === 2 && pinch) { pts.set(e.pointerId, [e.clientX, e.clientY]); const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); setZoom(pinch.z * d / pinch.d, (a[0] + b[0]) / 2 - r.left, (a[1] + b[1]) / 2 - r.top); } });
    const up = (e) => { pts.delete(e.pointerId); pinch = null; if (!pts.size) touching(false); }; ph.addEventListener('pointerup', up); ph.addEventListener('pointercancel', up);
    ph.addEventListener('wheel', (e) => { e.preventDefault(); const r = ph.getBoundingClientRect(); setZoom(z * (e.deltaY < 0 ? 1.08 : .93), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    let zt; zoom.addEventListener('input', () => { touching(true); clearTimeout(zt); zt = setTimeout(() => touching(false), 700); setZoom(+zoom.value); });
    q('#pf').addEventListener('transitionend', (e) => { if (e.propertyName === 'width') fit(true); });
    // hangolás
    let chosen = pet.species || null;
    const caps = (list, col) => { const w = document.createElement('div'); w.className = 'caps' + (col ? ' col' : ''); list.forEach(([key, label, sel]) => { const b = document.createElement('button'); b.className = 'cap' + (sel ? ' sel' : ''); b.innerHTML = PAW + '<span>' + esc(label) + '</span>'; b.onclick = () => { w.querySelectorAll('.cap').forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); chosen = key; okBtn.disabled = false; collapse(label); }; w.appendChild(b); }); return w; };
    let ct; const collapse = (label) => { clearTimeout(ct); ct = setTimeout(() => { const tn = q('#tune'); tn.innerHTML = ''; const m = document.createElement('button'); m.className = 'modl'; m.textContent = '✦ ' + label + ' · ' + t('au.al.mod2'); m.onclick = () => renderTune(true); tn.appendChild(m); R0.classList.remove('c-elteres', 'c-vendeg'); requestAnimationFrame(() => fit(true)); }, 950); };
    const spLabel = (k) => t(k === 'cat' ? 'au.al.cat' : 'au.al.dog');
    function renderTune(again) { const tn = q('#tune'); tn.classList.remove('on'); tn.innerHTML = ''; R0.classList.add('c-' + CASE); if (again) requestAnimationFrame(() => fit(true));
      if (CASE === 'bizonytalan') { tn.innerHTML = `<div class="t">${esc(t('au.al.tune'))}</div>`; tn.appendChild(caps([['dog', spLabel('dog'), again && chosen === 'dog'], ['cat', spLabel('cat'), again && chosen === 'cat']])); if (!again) { chosen = null; okBtn.disabled = true; } tn.classList.add('on'); }
      else if (CASE === 'elteres') { tn.innerHTML = `<div class="t it">${esc(t(seen === 'cat' ? 'au.al.diff_cat' : 'au.al.diff_dog', { name }))}</div>`; tn.appendChild(caps([[seen, t(seen === 'cat' ? 'au.al.pick_cat' : 'au.al.pick_dog'), again && chosen === seen], [pet.species, t('au.al.stay', { name }), again && chosen === pet.species]], true)); if (!again) { chosen = null; okBtn.disabled = true; } tn.classList.add('on'); }
      else { if (again) { tn.innerHTML = `<div class="t">${esc(t('au.al.tune'))}</div>`; tn.appendChild(caps([['dog', spLabel('dog'), chosen === 'dog'], ['cat', spLabel('cat'), chosen === 'cat']])); tn.classList.add('on'); } else { const m = document.createElement('button'); m.className = 'modl'; m.textContent = t('au.al.modify'); m.onclick = () => renderTune(true); tn.appendChild(m); } } }
    renderTune(false);
    okBtn.onclick = () => { if (!iw) return; const N = 720, k = N / D, cv = document.createElement('canvas'); cv.width = cv.height = N; cv.getContext('2d').drawImage(img, tx * k, ty * k, iw * base * z * k, ih * base * z * k);
      FLOW.portrait = cv.toDataURL('image/jpeg', .9); FLOW.species = chosen || pet.species || 'dog'; const d = q('#done'); d.classList.add('on'); setTimeout(() => go('aura/elemzes', true), 700); };
    q('#again').onclick = q('#back').onclick = () => back('aura/kamera');
    q('#pick').onclick = () => pickFile(async (f) => { FLOW.photo = await fileToData(f); FLOW.fromGallery = true; FLOW.dir = null; load(FLOW.photo); });
    if (FLOW.photo) load(FLOW.photo);
    const onR = () => setTimeout(() => fit(true), 200); addEventListener('resize', onR);
    const stopDust = dustLoop(root, q('#dust'), (rel) => { const f = rel(q('#pf').getBoundingClientRect()), a = rel(q('.acts').getBoundingClientRect()); let x, y; if (Math.random() < .7) { const th = Math.random() * Math.PI * 2, r = f.width * (.5 + Math.random() * .16); x = f.left + f.width / 2 + Math.cos(th) * r; y = f.top + f.height / 2 + Math.sin(th) * r; } else { x = Math.random() < .5 ? a.left - 4 + Math.random() * 18 : a.right + 4 - Math.random() * 18; y = a.top + Math.random() * a.height; } return kind(x, y); }, { max: 32 });
    return () => { stopDust(); removeEventListener('resize', onR); };
  };
  return { html, mount, back: 'aura/kamera' };
}

// ================= 4. ELEMZÉS – az aura születése =================
function analysisScreen(ctx) {
  const { t, esc, go } = ctx, GALLERY = !FLOW.dir;
  const html = `<div class="au au-an"><canvas class="fx" id="dust"></canvas>
  <div class="screen" id="scr"><div class="stage" id="stage">
    <div class="rings"><svg viewBox="-100 -100 200 200"><g class="r1" id="r1"></g><g class="r2" id="r2"></g><g class="r3" id="r3"></g><g class="rose" id="rose"></g></svg></div>
    <div class="lay gold"></div><div class="lay turq"></div><div class="lay viol"></div><div class="crown"></div>
    <div class="ph"><img id="img" alt=""><svg class="geo" viewBox="-100 -100 200 200" id="geo"></svg></div>
    <img class="frame" src="${A('portrekeret.webp')}" alt=""><div class="shine"><i></i></div></div>
   <div class="cap" id="cap" aria-live="polite"><span id="c1">${esc(t('au.an.c1'))}</span><span id="c2">${esc(t('au.an.c2'))}</span><span id="c3">${esc(t('au.an.c3'))}</span><span id="c4">${esc(t(GALLERY ? 'au.an.c4b' : 'au.an.c4'))}</span><span id="c5">${esc(t('au.an.c5'))}</span></div>
   <div class="gems" id="gems"><i></i><i${GALLERY ? ' class="skip"' : ''}></i><i></i></div></div>
  <div class="veil"></div><div class="white" id="white"></div></div>`;
  const mount = (root) => {
    const q = (s) => root.querySelector(s), scr = q('#scr'), rm = RM(); let alive = true;
    if (FLOW.portrait) q('#img').src = FLOW.portrait;
    { const tick = (r1, r2, a) => { const th = a * Math.PI / 180; return `<line x1="${Math.sin(th) * r1}" y1="${-Math.cos(th) * r1}" x2="${Math.sin(th) * r2}" y2="${-Math.cos(th) * r2}"/>`; };
      const ring = (r, n, len, o) => { let s = `<g fill="none" stroke="#f0c66a" stroke-width=".28" opacity="${o}"><circle r="${r}"/><circle r="${r - len - 1.2}"/>`; for (let i = 0; i < n; i++) s += tick(r - len, r, i * 360 / n); return s + '</g>'; };
      q('#r1').innerHTML = ring(96, 72, 2.2, .5); q('#r2').innerHTML = ring(84, 24, 3, .42); q('#r3').innerHTML = ring(72, 12, 4, .36);
      let s = '<g fill="none" stroke="#9ffff6" stroke-width=".35">'; for (let i = 0; i < 8; i++) { const a = i * 45 * Math.PI / 180, L = i % 2 ? 80 : 96, w = i % 2 ? 4 : 6, px = Math.cos(a) * w, py = Math.sin(a) * w; s += `<path d="M${-px} ${-py} L${Math.sin(a) * L} ${-Math.cos(a) * L} L${px} ${py}"/>`; } q('#rose').innerHTML = s + '</g>';
      const F = 1.618; let g = ''; [100 / F, 100 / F / F].forEach((r) => g += `<circle r="${r}" pathLength="1"/>`); for (let i = 0; i < 6; i++) { const a = i * 60 * Math.PI / 180, r = 100 / F / F; g += `<circle cx="${Math.cos(a) * r}" cy="${Math.sin(a) * r}" r="${r}" pathLength="1" style="animation-delay:${.15 * i}s"/>`; }
      const p = (k) => [0, 1, 2].map((i) => { const a = (k + i * 120) * Math.PI / 180; return (Math.sin(a) * 100 / F) + ',' + (-Math.cos(a) * 100 / F); }).join(' '); g += `<polygon points="${p(0)}" pathLength="1" style="animation-delay:.9s"/><polygon points="${p(180)}" pathLength="1" style="animation-delay:1.1s"/>`; q('#geo').innerHTML = g; }
    const PH = rm ? 900 : 3400, steps = [['p1', 'c1', 0], ...(GALLERY ? [] : [['p2', 'c2', 1]]), ['p3', 'c3', 2]];
    const capOn = (id) => root.querySelectorAll('.cap span').forEach((s) => s.classList.toggle('on', s.id === id));
    const show = (cls, cap, gem) => { scr.classList.remove('p1', 'p2', 'p3', 'hold'); scr.classList.add(cls); capOn(cap); if (gem != null) q('#gems').children[gem].classList.add('on'); };
    let serverDone = false, phasesDone = false, finished = false; const timers = [];
    // A tényleges elemzés (4. szakasz: szerver + AI). Addig: szimulált idő, és az eredmény mintaadat. Próba: FLOW.test.ido (mp), FLOW.test.ok (sikertelen).
    const SERVER = (FLOW.test.ido || 9) * 1000; timers.push(setTimeout(() => { serverDone = true; tryFinish(); }, SERVER));
    steps.forEach(([cls, cap, gem], i) => timers.push(setTimeout(() => show(cls, cap, gem), 500 + i * PH)));
    timers.push(setTimeout(() => { scr.classList.add('hold'); capOn('c4'); timers.push(setTimeout(() => { phasesDone = true; tryFinish(); }, rm ? 400 : 2200)); }, 500 + steps.length * PH));
    function tryFinish() { if (finished || !serverDone || !phasesDone || !alive) return; finished = true;
      if (FLOW.test.ok) { FLOW.fail = FLOW.test.ok; scr.classList.remove('hold'); scr.classList.add('fail'); root.querySelectorAll('.cap span').forEach((s) => s.classList.remove('on')); timers.push(setTimeout(() => go('aura/csend', true), rm ? 400 : 1900)); return; }
      capOn('c5'); scr.classList.add('fin'); q('.au-an').classList.add('fin');
      timers.push(setTimeout(() => q('#white').classList.add('on'), rm ? 300 : 2350)); timers.push(setTimeout(() => { FLOW.arrivedFromAnalysis = true; go('aura/eredmeny', true); }, rm ? 900 : 4000)); }
    const stopDust = dustLoop(root, q('#dust'), (rel) => { const f = rel(q('#stage').getBoundingClientRect()), a = Math.random() * Math.PI * 2, r = f.width * (.62 + Math.random() * .5), cls = scr.className, cols = ['255,214,130']; if (/p2|p3|hold|fin/.test(cls) && !GALLERY) cols.push('110,232,222'); if (/p3|hold|fin/.test(cls)) cols.push('208,172,255');
      return { k: 1, x: f.left + f.width / 2 + Math.cos(a) * r, y: f.top + f.height / 2 + Math.sin(a) * r, toward: [f.left + f.width / 2, f.top + f.height / 2], r: 1 + Math.random() * 1.8, dur: 3 + Math.random() * 3, life: 0, c: cols[Math.floor(Math.random() * cols.length)], ph: Math.random() * 7, sw: 0, f: 0, v: 0 }; }, { rate: 5, max: 40 });
    return () => { alive = false; timers.forEach(clearTimeout); stopDust(); };
  };
  return { html, mount, back: null };
}

// ================= 5. SIKERTELEN PRÓBA – a tükör még hallgat =================
function failScreen(ctx) {
  const { t, esc, pet, go, back } = ctx, name = pet.name || t('au.start.noname'), ok = FLOW.fail || 'arc';
  const html = `<div class="au au-fail"><canvas class="fx" id="dust"></canvas>${medal('back', esc(t('back')), ICON.back)}
  <div class="screen"><h1>${esc(t('au.fail.title'))}</h1><div class="sub">${esc(t('au.fail.sub'))}</div>
   <div class="pf"><div class="halo"></div><div class="wreath"><i class="wg"></i><i class="wv"></i></div><div class="ph"><img id="img" alt=""><div class="mist"></div><div class="q">✦</div></div><img src="${A('portrekeret.webp')}" alt=""></div>
   <div class="scroll"><div class="p-mid"></div><img class="p-top" src="${A('perg_felso.webp')}" alt=""><img class="p-bot" src="${A('perg_also.webp')}" alt=""><div class="plight"><i></i></div>
    <div class="p-in"><h2>${esc(t('au.fail.h', { name }))}</h2><p>${esc(t('au.fail.p', { name }))}</p><p class="tip">✦ ${esc(t('au.fail.tip.' + (['arc', 'homalyos', 'sotet', 'tavol'].includes(ok) ? ok : 'arc')))}</p></div></div>
   <div class="note">${esc(t('au.fail.note'))}</div>
   <div class="acts"><button class="main" id="again">✦ ${esc(t('au.fail.again'))}</button><button class="sec" id="gal">${esc(t('au.start.gallery'))}</button></div></div></div>`;
  const mount = (root) => {
    const q = (s) => root.querySelector(s); if (FLOW.portrait) q('#img').src = FLOW.portrait;
    q('#again').onclick = q('#back').onclick = () => back('aura/kamera');
    q('#gal').onclick = () => pickFile(async (f) => { FLOW.photo = await fileToData(f); FLOW.fromGallery = true; FLOW.dir = null; go('aura/igazitas'); });
    const stopDust = dustLoop(root, q('#dust'), (rel) => { const f = rel(q('.pf').getBoundingClientRect()), a = Math.random() * Math.PI * 2, r = f.width * (.5 + Math.random() * .2); return { k: 1, x: f.left + f.width / 2 + Math.cos(a) * r, y: f.top + f.height / 2 + Math.sin(a) * r, r: 1 + Math.random() * 1.4, v: 5 + Math.random() * 8, dur: 3.5 + Math.random() * 3, life: 0, c: Math.random() < .6 ? '255,214,130' : '208,172,255', ph: Math.random() * 7, sw: 3 + Math.random() * 6, f: .3 + Math.random() * .6 }; }, { rate: 1.8, max: 16 });
    return () => stopDust();
  };
  return { html, mount, back: 'aura' };
}

// ---------- útvonalak ----------
const SCREENS = { '': startScreen, kamera: cameraScreen, igazitas: alignScreen, elemzes: analysisScreen, csend: failScreen, eredmeny: resultScreen };
export function auraScreen(sub, ctx) {
  if (sub.startsWith('naplo-')) return archiveScreen(ctx, sub.slice(6)); // Elemzéseim: egy elmentett eredmény
  // fotó nélkül az igazítás/elemzés/eredmény nem értelmes → vissza az indítóhoz
  if ((sub === 'igazitas' && !FLOW.photo) || ((sub === 'elemzes' || sub === 'eredmeny') && !FLOW.portrait)) { ctx.go('aura', true); return null; }
  return (SCREENS[sub] || startScreen)(ctx);
}
