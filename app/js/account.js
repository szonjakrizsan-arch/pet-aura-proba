// Fiók (3. szakasz): nyelv, kedvencek, adatok (minden csak ezen a telefonon), tájékoztató, névjegy.
// Bejelentkezés és előfizetés a 4. szakaszban (háttérrendszer) jön, saját felülettel – addig nem jelezzük (Szonja döntése).
import { SUPPORTED } from './i18n.js?v=0.6.26';
import { wipeAll } from './journal.js?v=0.6.26';
import { PETS } from './pets.js?v=0.6.26';

const VERSION = '0.6.26';
const ORN = (pos) => `<svg class="korn ${pos}" viewBox="0 0 280 20" aria-hidden="true"><path d="M6 10Q70 9.4 140 8.4Q210 9.4 274 10Q210 10.6 140 11.6Q70 10.6 6 10Z" fill="#f6d27a" opacity=".85"/><path d="M112 10c4-6 10-6 12 0-2 4-6 4-7 1M168 10c-4-6-10-6-12 0 2 4 6 4 7 1" stroke="url(#au)" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M140 2 143.4 10 140 18 136.6 10Z" fill="url(#au)"/></svg>`;
// sarokdísz (egy saroké; a másik hármat CSS tükrözi)
const CORNER = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M3 30C3 14 14 3 30 3" fill="none" stroke="url(#au)" stroke-width="2.2" stroke-linecap="round"/><path d="M8 30c0-9 5-16 13-19M10 21c3 1 5 3 5 7M21 10c1 3 3 5 7 5" fill="none" stroke="url(#au)" stroke-width="1.6" stroke-linecap="round"/><circle cx="30" cy="3.5" r="2.4" fill="url(#au)"/><circle cx="3.5" cy="30" r="2.4" fill="url(#au)"/><path d="M6 6l3 0 0 3-3 0z" transform="rotate(45 7.5 7.5)" fill="url(#au)"/></svg>';
export const glass = (title, body, cls = '') => `<section class="acard ${cls}">${['tl', 'tr', 'bl', 'br'].map((c) => `<i class="accor ${c}">${CORNER}</i>`).join('')}<h3>${title}</h3>${body}</section>`;
const ARROW = '<img class="acarrow" src="assets/fiok/nyil.webp?v=0.6.26" alt="">';
const WARN = '<svg class="acwsig" viewBox="0 0 40 36" aria-hidden="true"><path d="M20 3 37 33H3Z" fill="none" stroke="#f0c48a" stroke-width="2.4" stroke-linejoin="round"/><path d="M20 13v10" stroke="#f0c48a" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="28" r="1.9" fill="#f0c48a"/></svg>';
const PAW = '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="url(#au)"><ellipse cx="12" cy="16" rx="5" ry="4.2"/><ellipse cx="5.6" cy="10.4" rx="2" ry="2.5"/><ellipse cx="9.4" cy="6.6" rx="2" ry="2.6"/><ellipse cx="14.6" cy="6.6" rx="2" ry="2.6"/><ellipse cx="18.4" cy="10.4" rx="2" ry="2.5"/></g></svg>';

let confirmWipe = false;
// többes szám a nyelv szabályai szerint (pl. lengyelül 2 profile, 5 profili); a kulcsok: one / few / many / other
const plural = (lang, n) => { try { const c = new Intl.PluralRules(lang).select(n); return ['one', 'few', 'many'].includes(c) ? c : 'other'; } catch { return 'other'; } };
export function accountView({ t, esc, lang }) {
  const langs = SUPPORTED.map((s) => `<button class="aclang${s.code === lang ? ' on' : ''}" data-lang="${s.code}" lang="${s.code}" aria-pressed="${s.code === lang}">${s.code === lang ? '<span class="acstar" aria-hidden="true">✦</span>' : ''}${esc(s.label)}</button>`).join('');
  const n = PETS.list.length;
  const wipe = confirmWipe
    ? `<div class="acwarnp" role="alert">${WARN}<p class="acwq">${esc(t('acc.wipeq'))}</p><p class="acwf">${esc(t('acc.wipefinal'))}</p><p class="acwr">${esc(t('acc.wiperest'))}</p></div>
       <div class="acbtns"><button class="acbtn danger" id="acwipeyes" type="button">${esc(t('acc.wipeyes'))}</button><button class="acbtn" id="acwipeno" type="button">${esc(t('pets.cancel'))}</button></div>`
    : `<button class="acdel" id="acwipe" type="button"><img class="acdt" src="assets/fiok/torles_disz_fent.webp?v=0.6.26b" alt=""><img class="acdb" src="assets/fiok/torles_disz_lent.webp?v=0.6.26b" alt=""><span>${esc(t('acc.wipe'))}</span></button>`;
  return `<h1 class="t">${esc(t('top.account'))}</h1>
  <div class="accrest"><img class="accoin" src="assets/fiok/mancs.webp?v=0.6.26" alt=""></div>
  ${glass(esc(t('acc.lang')), `<div class="aclangs">${langs}</div>`)}
  ${glass(esc(t('top.pets')), `<a class="acrow" data-go="pets" role="button" tabindex="0"><span>${esc(t('acc.pets.' + plural(lang, n), { n }))}</span>${ARROW}</a>`)}
  ${glass(esc(t('acc.data')), `<p>${esc(t('acc.local'))}</p>${wipe}`)}
  ${glass(esc(t('disc.title')), `<p>${esc(t('disc.body'))}</p>`)}
  ${glass(esc(t('acc.about')), `<p>Pet Aura · v${VERSION}</p><p class="acsrc">${esc(t('acc.sources'))}<br>© GeoNames · CC BY 4.0<br>Noto Sans Symbols · SIL OFL 1.1</p>`)}`;
}

export function mountAccount(root, { setLang, render }) {
  // koppintáskor rövid arany fénycsík fut végig (ékszerszerű csillanás), utána vált a nyelv
  const shine = (el) => { el.classList.remove('shine'); void el.offsetWidth; el.classList.add('shine'); };
  root.querySelectorAll('[data-lang]').forEach((b) => { b.onclick = () => { shine(b); setTimeout(() => setLang(b.dataset.lang), b.classList.contains('on') ? 0 : 380); }; });
  root.querySelectorAll('.acdel,.acbtn,.acrow').forEach((b) => b.addEventListener('pointerdown', () => shine(b)));
  const w = root.querySelector('#acwipe'); if (w) w.onclick = () => { confirmWipe = true; setTimeout(() => { render(); setTimeout(() => root.querySelector('#acwipeyes')?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 0); }, 280); }; // előbb lefut a fénycsík
  const no = root.querySelector('#acwipeno'); if (no) no.onclick = () => { confirmWipe = false; render(); };
  const yes = root.querySelector('#acwipeyes'); if (yes) yes.onclick = async () => {
    await wipeAll(); // az Elemzéseim (IndexedDB) is
    // minden Pet Aura-adat törlése erről a telefonról (a választott nyelv megmarad)
    const keep = localStorage.getItem('lang'); try { localStorage.clear(); if (keep) localStorage.setItem('lang', keep); } catch { /* nincs tárhely */ }
    location.replace(location.pathname + '#home'); location.reload();
  };
}
export const leaveAccount = () => { confirmWipe = false; };

// ---- élő háttér a Fiók mögött: sodródó fénypor (főleg a kártyák két oldalán), egymástól függetlenül felvillanó csillagok,
// lassan lélegző lila fényudvar. Csak amíg a Fiók látszik; csökkentett mozgásnál áll.
export function startAccountBg(pane, { colors = false } = {}) {
  // az Elemzéseim változatban a fénypor közé lila, türkiz és rózsaszín részecskék is keverednek
  const COLS = colors ? ['#ffe7b0', '#ffe7b0', '#ffe7b0', '#d9b8ff', '#9fe6ff', '#ffc2ec'] : ['#ffe7b0'];
  if (!pane || pane.querySelector('#acbg')) return () => {};
  pane.querySelector('.bgsub').insertAdjacentHTML('afterend', '<div id="acbg"><i class="acglow"></i><canvas></canvas></div>');
  const box = pane.querySelector('#acbg'), cv = box.querySelector('canvas'), cx = cv.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches, dpr = Math.min(2, devicePixelRatio || 1);
  let W = 0, H = 0, raf = 0, dust = [], stars = [];
  const side = () => (Math.random() < .5 ? Math.random() * .22 : .78 + Math.random() * .22); // a kártyák két oldala
  const fit = () => { W = box.clientWidth; H = box.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dust = Array.from({ length: 46 }, () => ({ x: (Math.random() < .8 ? side() : Math.random()) * W, y: Math.random() * H, r: .6 + Math.random() * 1.6, vx: (Math.random() - .5) * .08, vy: -.06 - Math.random() * .16, a: .25 + Math.random() * .5, ph: Math.random() * 6.3, c: COLS[Math.floor(Math.random() * COLS.length)] }));
    stars = Array.from({ length: 14 }, () => ({ x: Math.random() * W, y: Math.random() * H, t: Math.random() * 9000, per: 5000 + Math.random() * 7000, s: 3 + Math.random() * 4 })); };
  const star = (x, y, s, a) => { cx.save(); cx.globalAlpha = a; cx.fillStyle = '#fff3cf'; cx.beginPath(); cx.moveTo(x, y - s); cx.quadraticCurveTo(x, y, x + s, y); cx.quadraticCurveTo(x, y, x, y + s); cx.quadraticCurveTo(x, y, x - s, y); cx.quadraticCurveTo(x, y, x, y - s); cx.fill();
    cx.globalAlpha = a * .5; cx.beginPath(); cx.arc(x, y, s * .9, 0, 6.3); cx.fillStyle = 'rgba(255,214,140,.25)'; cx.fill(); cx.restore(); };
  const draw = (now) => {
    cx.clearRect(0, 0, W, H);
    for (const d of dust) { if (!still) { d.x += d.vx + Math.sin(now / 2400 + d.ph) * .05; d.y += d.vy; if (d.y < -6) { d.y = H + 6; d.x = (Math.random() < .8 ? side() : Math.random()) * W; } }
      const tw = .6 + .4 * Math.sin(now / 900 + d.ph); cx.globalAlpha = d.a * tw; cx.fillStyle = d.c; cx.beginPath(); cx.arc(d.x, d.y, d.r, 0, 6.3); cx.fill(); }
    cx.globalAlpha = 1;
    for (const s of stars) { const k = ((now + s.t) % s.per) / s.per; if (k < .12) { const a = Math.sin((k / .12) * Math.PI); star(s.x, s.y, s.s * (.6 + .4 * a), a * .9); } else if (k > .99) { s.x = Math.random() * W; s.y = Math.random() * H; } }
    if (!still) raf = requestAnimationFrame(draw);
  };
  fit(); addEventListener('resize', fit); raf = requestAnimationFrame(draw);
  return () => { cancelAnimationFrame(raf); removeEventListener('resize', fit); box.remove(); };
}
