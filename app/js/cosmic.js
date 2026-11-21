// Kozmikus Mancs – új külső (3. szakasz). A számítás változatlan: horoscope.js (égi profil), cosmos.js (Hold, jegy, szerencseszín).
// A díszítések saját rajzú, arany vonalas SVG-k (url(#au) = a közös arany színátmenet az index.html-ben).
import { fmtDate } from './i18n.js?v=0.6.54';
import { birthProfile } from './horoscope.js?v=0.6.54';
import { moonPhase, zodiac, luckyHue, hash } from './cosmos.js?v=0.6.54';
import { ICON } from './home.js?v=0.6.54';
import { IC_SWAP } from './aura-deco.js?v=0.6.54';
import { saveWithNotice, lastOf, sig } from './journal.js?v=0.6.54';
import { ZG, PG } from './zodiac-glyphs.js?v=0.6.54';

const ELEM = ['fire', 'earth', 'air', 'water'];
const RULER = [4, 3, 2, 1, 0, 2, 3, 9, 5, 6, 7, 8]; // jegy → uralkodó bolygó (modern rend): Kos–Mars, Bika–Vénusz, …, Halak–Neptunusz
const GL = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const hueName = (h) => (h < 18 || h >= 330 ? 'red' : h < 70 ? 'yellow' : h < 170 ? 'green' : h < 255 ? 'blue' : 'purple');
const G = 'fill="none" stroke="url(#au)" stroke-linecap="round" stroke-linejoin="round"';
const rnd = (seed) => { let s = hash(seed); return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909)) >>> 0) / 4294967296; };
const star4 = (x, y, r) => `<path d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z" fill="url(#au)"/>`;

// --- apró arany mancsnyom (x,y középpont, méret, elforgatás) ---
const paw = (x, y, s, rot, op = 1) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s})" opacity="${op}"><ellipse cx="0" cy="2.2" rx="2.6" ry="2.1" fill="url(#au)"/><ellipse cx="-2.9" cy="-1.3" rx=".95" ry="1.25" fill="url(#au)"/><ellipse cx="-1" cy="-2.7" rx=".95" ry="1.3" fill="url(#au)"/><ellipse cx="1" cy="-2.7" rx=".95" ry="1.3" fill="url(#au)"/><ellipse cx="2.9" cy="-1.3" rx=".95" ry="1.25" fill="url(#au)"/></g>`;
// --- állatövi érme ---
const zodiacMedal = (i, glow = '') => `<span class="zm${glow ? ' ' + glow : ''}"><svg viewBox="-8 -8 116 116" aria-hidden="true"><path d="${ZG[i]}" fill="url(#au)"/></svg></span>`;

// --- alkímiai elemjel (háromszög) ---
function elemSign(el, cx = 50, cy = 52, r = 22, w = 4) {
  const up = el === 'fire' || el === 'air', h = r * 1.5, t = up ? cy - h * 0.62 : cy + h * 0.62, b = up ? cy + h * 0.38 : cy - h * 0.38, half = r * 0.95;
  const tri = `M${cx} ${t}L${cx + half} ${b}L${cx - half} ${b}Z`;
  const bar = el === 'air' || el === 'earth' ? `<path d="M${cx - half * 0.86} ${(t + b) / 2 + (up ? 2 : -2)}h${half * 1.72}" ${G} stroke-width="${w}"/>` : '';
  return `<path d="${tri}" ${G} stroke-width="${w}"/>${bar}`;
}
// --- oldalsó égi mutató: elem vagy bolygó, doboz nélkül, arany fényben ---
const ring = (dots = 36) => `<circle cx="50" cy="50" r="45" ${G} stroke-width="1.4" opacity=".7"/><circle cx="50" cy="50" r="38.5" ${G} stroke-width="1.6" stroke-dasharray="0 ${(2 * Math.PI * 38.5 / dots).toFixed(2)}" opacity=".85"/>`;
const sideElem = (el) => `<svg viewBox="0 0 100 100" aria-hidden="true">${ring()}${elemSign(el, 50, 51, 19, 3.6)}${star4(50, 5, 4)}${star4(50, 95, 4)}</svg>`;
const sidePlanet = (p) => `<svg viewBox="0 0 100 100" aria-hidden="true">${ring()}<g transform="translate(27 27) scale(.46)"><path d="${PG[p]}" fill="url(#au)"/></g>${star4(5, 50, 4)}${star4(95, 50, 4)}</svg>`;

// --- asztrolábium-szárnyak a portré mögött (görgetésre lassan fordul) ---
function astrolabe() {
  const C = 120; let ticks = '';
  for (let a = 0; a < 360; a += 5) { const L = a % 30 === 0 ? 9 : 4, r1 = 104, r2 = r1 - L, k = (a * Math.PI) / 180; ticks += `M${(C + r1 * Math.cos(k)).toFixed(1)} ${(C + r1 * Math.sin(k)).toFixed(1)}L${(C + r2 * Math.cos(k)).toFixed(1)} ${(C + r2 * Math.sin(k)).toFixed(1)}`; }
  const R = rnd('astro'); let stars = '';
  for (let i = 0; i < 16; i++) { const k = R() * Math.PI * 2, r = 80 + R() * 34; stars += `<circle cx="${(C + r * Math.cos(k)).toFixed(1)}" cy="${(C + r * Math.sin(k)).toFixed(1)}" r="${(0.6 + R() * 1.1).toFixed(1)}" fill="#ffe9b0" opacity="${(0.35 + R() * 0.6).toFixed(2)}"/>`; }
  // mancsnyom-ösvények a gyűrűn: négy irányban, hogy a lassú forgás közben mindkét szárnyon mindig látsszon egy
  let trails = ''; for (const base of [0, 90, 180, 270]) for (let j = 0; j < 4; j++) { const a = base - 15 + j * 10, k = (a * Math.PI) / 180, r = 95 + (j % 2 ? 2.2 : -2.2); trails += paw(C + r * Math.cos(k), C + r * Math.sin(k), 1.05, a + 180, 0.55 + j * 0.15); }
  const cons = (pts) => `<path d="${pts.map((p, i) => (i ? 'L' : 'M') + p.join(' ')).join('')}" ${G} stroke-width=".7" opacity=".55"/>${pts.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="1.5" fill="#fff1c2"/>`).join('')}`;
  // Csak a két oldalsó ív látszik (szárnyak): vízszintes és függőleges lágy maszk – a cím és a névtábla előtt nem fut át.
  return `<svg class="kastro" viewBox="0 0 240 240" aria-hidden="true"><defs>
   <linearGradient id="kah"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="#fff"/><stop offset=".4" stop-color="#000"/><stop offset=".6" stop-color="#000"/><stop offset=".7" stop-color="#fff"/><stop offset="1" stop-color="#fff"/></linearGradient>
   <linearGradient id="kav" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset=".22" stop-color="#000"/><stop offset=".4" stop-color="#fff"/><stop offset=".6" stop-color="#fff"/><stop offset=".78" stop-color="#000"/><stop offset="1" stop-color="#000"/></linearGradient>
   <mask id="kmh" maskUnits="userSpaceOnUse" x="0" y="0" width="240" height="240"><rect width="240" height="240" fill="url(#kah)"/></mask><mask id="kmv" maskUnits="userSpaceOnUse" x="0" y="0" width="240" height="240"><rect width="240" height="240" fill="url(#kav)"/></mask></defs>
   <g mask="url(#kmh)"><g mask="url(#kmv)"><g class="rot">
   <circle cx="${C}" cy="${C}" r="114" ${G} stroke-width=".8" opacity=".6"/><circle cx="${C}" cy="${C}" r="104" ${G} stroke-width="1" opacity=".75"/><circle cx="${C}" cy="${C}" r="86" ${G} stroke-width=".6" stroke-dasharray="1 4" opacity=".6"/>
   <path d="${ticks}" ${G} stroke-width=".9" opacity=".7"/>${stars}
   ${trails}
   ${star4(C, 8, 4)}${star4(C, 232, 4)}${star4(8, C, 4)}${star4(232, C, 4)}</g></g></g></svg>`;
}

// --- holdkorong ---
function moonDisc(frac) {
  const r = 42, k = Math.cos(frac * 2 * Math.PI), rx = r * Math.abs(k), wax = frac < 0.5, cres = k > 0;
  const lit = `M50 ${50 - r}A${r} ${r} 0 0 ${wax ? 1 : 0} 50 ${50 + r}A${rx.toFixed(1)} ${r} 0 0 ${wax ? (cres ? 0 : 1) : (cres ? 1 : 0)} 50 ${50 - r}Z`;
  return `<svg class="kmoon" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="${r}" fill="#2a1a52"/><path d="${lit}" fill="url(#au)"/><circle cx="50" cy="50" r="${r}" fill="none" stroke="#f3cf7a" stroke-opacity=".55" stroke-width="2"/></svg>`;
}

// --- díszes arany elválasztó a pergamenen ---
const divider = () => `<svg class="kdiv" viewBox="0 0 260 18" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
 <defs><linearGradient id="kdl" x1="0" x2="1"><stop offset="0" stop-color="#9a6a24" stop-opacity="0"/><stop offset=".6" stop-color="#b07a26"/><stop offset="1" stop-color="#d9a64a"/></linearGradient><linearGradient id="kdr" x1="1" x2="0"><stop offset="0" stop-color="#9a6a24" stop-opacity="0"/><stop offset=".6" stop-color="#b07a26"/><stop offset="1" stop-color="#d9a64a"/></linearGradient></defs>
 <path d="M12 9H100" stroke="url(#kdl)" stroke-width="1.2" fill="none"/><path d="M160 9H248" stroke="url(#kdr)" stroke-width="1.2" fill="none"/>
 <path d="M100 9c4-6 10-6 12 0-2 4-6 4-7 1M160 9c-4-6-10-6-12 0 2 4 6 4 7 1" stroke="#b07a26" stroke-width="1.2" fill="none" stroke-linecap="round"/>
 <path d="M130 1.5 133 9 130 16.5 127 9Z" fill="#c08a32"/><path d="M122.5 9 130 6.5 137.5 9 130 11.5Z" fill="#d9a64a"/><circle cx="118" cy="9" r="1.4" fill="#b07a26"/><circle cx="142" cy="9" r="1.4" fill="#b07a26"/></svg>`;

// --- füstüveg-panelek arany díszvonala (középen vastagodó, végein elhalványuló, indás – mint a pergamen elválasztója) ---
const orn = (pos) => `<svg class="korn ${pos}" viewBox="0 0 280 20" aria-hidden="true"><defs><linearGradient id="kog" x1="0" x2="1"><stop offset="0" stop-color="#f6d27a" stop-opacity="0"/><stop offset=".5" stop-color="#ffe7a6"/><stop offset="1" stop-color="#f6d27a" stop-opacity="0"/></linearGradient></defs>
 <path d="M6 10Q70 9.4 140 8.4Q210 9.4 274 10Q210 10.6 140 11.6Q70 10.6 6 10Z" fill="url(#kog)"/>
 <path d="M112 10c4-6 10-6 12 0-2 4-6 4-7 1M168 10c-4-6-10-6-12 0 2 4 6 4 7 1" stroke="url(#au)" stroke-width="1.3" fill="none" stroke-linecap="round"/>
 <path d="M140 2 143.4 10 140 18 136.6 10Z" fill="url(#au)"/><circle cx="129" cy="10" r="1.5" fill="#f6d27a"/><circle cx="151" cy="10" r="1.5" fill="#f6d27a"/></svg>`;

// --- születési csillag (üres állapot) ---
const birthStar = () => `<svg class="kbirth" viewBox="0 0 120 120" aria-hidden="true">
 <defs><radialGradient id="kbg"><stop offset="0" stop-color="#fff6d8" stop-opacity=".95"/><stop offset=".35" stop-color="#ffd98a" stop-opacity=".45"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient></defs>
 <circle cx="60" cy="60" r="44" fill="url(#kbg)"/><circle cx="60" cy="60" r="50" fill="none" stroke="#b07a26" stroke-width="1" stroke-dasharray="0 6" stroke-linecap="round"/><circle cx="60" cy="60" r="38" fill="none" stroke="#c08a32" stroke-width=".8" opacity=".7"/>
 <path d="M60 14 64 52 102 60 64 68 60 106 56 68 18 60 56 52Z" fill="#c8912f"/><path d="M60 34 62.5 57.5 86 60 62.5 62.5 60 86 57.5 62.5 34 60 57.5 57.5Z" fill="#fff1c2" transform="rotate(45 60 60)" opacity=".9"/>
 <circle cx="60" cy="60" r="5" fill="#fffaf0"/>${star4(24, 24, 4)}${star4(98, 28, 3)}${star4(94, 96, 4)}${star4(22, 92, 3)}</svg>`;

// --- az elem részletes jelképe (fényudvarban) és halvány háttérmotívuma ---
function elemArt(el, cls) {
  let art = '';
  if (el === 'earth') art = `<path d="M18 74 38 44 46 54 56 32 82 74" ${G} stroke-width="2.6"/><path d="M27 74 38 57 44 64 M48 74 56 50 70 74 M36 74l20-30" ${G} stroke-width="1.4" opacity=".75"/><path d="M14 80c12-4 24-4 36 0s24 4 36 0" ${G} stroke-width="1.6"/><path d="M60 16a9 9 0 1 0 9 13 7 7 0 1 1-9-13Z" fill="url(#au)"/>`;
  if (el === 'fire') art = `<path d="M50 14c4 14 18 20 18 38a18 18 0 0 1-36 0c0-10 6-14 9-22 3 5 5 9 7 10 3-8 2-16 2-26Z" ${G} stroke-width="2.6"/><path d="M50 50c3 6 8 8 8 15a8 8 0 0 1-16 0c0-4 3-7 4-11 2 3 3 4 4 4" ${G} stroke-width="1.8"/><path d="M28 30l2 3M72 26l-2 3M24 50h3M76 48h-3" ${G} stroke-width="1.6" opacity=".8"/>`;
  if (el === 'water') art = `<path d="M50 14c11 15 17 24 17 33a17 17 0 0 1-34 0c0-9 6-18 17-33Z" ${G} stroke-width="2.6"/><path d="M42 50a8 8 0 0 0 8 8" ${G} stroke-width="1.8"/><path d="M16 72c6-5 11-5 17 0s11 5 17 0 11-5 17 0 11 5 17 0M22 82c5-4 9-4 14 0s9 4 14 0 9-4 14 0 9 4 14 0" ${G} stroke-width="1.6"/>`;
  if (el === 'air') art = `<path d="M14 38h40a10 10 0 1 0-10-10" ${G} stroke-width="2.6"/><path d="M14 52h56a11 11 0 1 1-11 11" ${G} stroke-width="2.6"/><path d="M20 66h22a7 7 0 1 1-7 7" ${G} stroke-width="1.8"/><path d="M70 24c4 0 8 3 8 8" ${G} stroke-width="1.4" opacity=".7"/>`;
  const R = rnd('el' + el); let dots = ''; for (let i = 0; i < 10; i++) { const k = R() * Math.PI * 2; dots += `<circle cx="${(50 + 46 * Math.cos(k)).toFixed(1)}" cy="${(50 + 46 * Math.sin(k)).toFixed(1)}" r="1.1" fill="#ffe9b0"/>`; }
  if (cls === 'kbgm') return `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true">${art}</svg>`; // háttérben csak maga a motívum, halványan
  return `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="47" ${G} stroke-width="1.2" opacity=".55"/>${dots}${art}</svg>`;
}

// --- energia: kozmikus égi pálya, rajta lassan haladó fénygömb ---
function energy(vals, t, esc) {
  // a 8 érték a nap 6 és 22 óra közötti szakaszát fedi
  const W = 300, H = 96, X = (i) => (i / (vals.length - 1)) * W, Y = (v) => H - 14 - (v / 100) * (H - 30);
  const pts = vals.map((v, i) => [X(i), Y(v)]);
  const path = (dy) => { let d = `M${pts[0][0]} ${(pts[0][1] + dy).toFixed(1)}`; for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], cx = (x0 + x1) / 2; d += `C${cx.toFixed(1)} ${(y0 + dy).toFixed(1)} ${cx.toFixed(1)} ${(y1 + dy).toFixed(1)} ${x1.toFixed(1)} ${(y1 + dy).toFixed(1)}`; } return d; };
  const d = path(0), pk = pts.reduce((a, p, i) => (p[1] < pts[a][1] ? i : a), 0), [px, py] = pts[pk];
  const R = rnd('en' + vals.join()); let st = ''; for (let i = 0; i < 22; i++) st += `<circle cx="${(R() * W).toFixed(1)}" cy="${(R() * (H - 20)).toFixed(1)}" r="${(0.5 + R() * 0.9).toFixed(1)}" fill="#fff1c2" opacity="${(0.2 + R() * 0.5).toFixed(2)}"/>`;
  const hour = 6 + (pk / (vals.length - 1)) * 16, part = hour < 11 ? 0 : hour < 13.5 ? 1 : hour < 17.5 ? 2 : 3;
  const dp = [[8, 0], [12, 1], [15.5, 2], [19.5, 3]].map(([h, i]) => `<span style="left:${(((h - 6) / 16) * 100).toFixed(1)}%">${esc(t('cos.dp.' + i))}</span>`).join('');
  return `<div class="kenergy"><div class="kplot"><svg class="kcurve" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="kcg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ffd98a" stop-opacity=".38"/><stop offset=".6" stop-color="#b77ad8" stop-opacity=".1"/><stop offset="1" stop-color="#6b3aa6" stop-opacity="0"/></linearGradient></defs>
   ${st}<path d="${d}L${W} ${H}L0 ${H}Z" fill="url(#kcg)"/>
   <path d="${path(-4)}" ${G} stroke-width="1" opacity=".35" vector-effect="non-scaling-stroke"/><path d="${path(4)}" ${G} stroke-width="1" opacity=".3" vector-effect="non-scaling-stroke"/>
   <path class="kglow" d="${d}" ${G} stroke-width="6" opacity=".35" vector-effect="non-scaling-stroke"/><path id="kpath" d="${d}" ${G} stroke-width="2.4" vector-effect="non-scaling-stroke"/></svg>
   <span class="kpeak" style="left:${((px / W) * 100).toFixed(2)}%;top:${((py / H) * 100).toFixed(2)}%"></span><span class="korbit" id="korbit"></span></div>
   <div class="kdp">${dp}</div></div><p class="kpk">✦ ${esc(t('cos.peak'))}: ${esc(t('cos.dp.' + part))}</p>`;
}

// --- szerencsekő: valódi fénytöréssel renderelt, áttetsző csiszolt kő (design/kozmikus_mancs/forras/gem_render.py), a napi szín szerint ---
const gem = (hn) => `<img class="kgem" src="assets/kozmikus/ko_${hn}.webp" alt="">`;

let cache = { k: '', v: null };
const profile = (p) => { const k = [p.bday, p.btime, p.place && p.place.lat + ',' + p.place.lon].join('|'); if (cache.k !== k) { try { cache = { k, v: birthProfile(p) }; } catch { cache = { k, v: null }; } } return cache.v; };

export function cosmicView({ t, esc, lang, pet: p, multi }) {
  const now = new Date(), m = moonPhase(now);
  const b = p.bday ? new Date(p.bday + 'T12:00:00') : null, ok = b && !isNaN(b);
  const pf = ok ? profile(p) : null, sun = pf ? pf.sun : ok ? zodiac(b.getMonth() + 1, b.getDate()).idx : null;
  const name = p.name || t('au.start.noname'), el = sun !== null ? ELEM[sun % 4] : null, pl = sun !== null ? RULER[sun] : null;
  const side = (cls, svg, label) => `<div class="kside ${cls}"><span class="kemb">${svg}</span><small>${esc(label)}</small></div>`;
  const head = `<h1 class="t">${esc(t('nav.cosmic'))}</h1>
  <div class="ktop">${astrolabe()}
   ${el ? side('kl', sideElem(el), t('cos.elem', { el: t('au.el.' + el) })) : ''}
   <div class="kpet"><div class="kwr"><i></i><i></i><i></i></div><div class="kph${p.photo ? '' : ' none'}"${p.photo ? ` style="background-image:url(${p.photo})"` : ''}>${p.photo ? '' : ICON.paw}</div><img src="assets/aura/portrekeret.webp" alt="">${sun !== null ? `<span class="ksign">${zodiacMedal(sun)}</span>` : ''}</div>
   ${pl !== null ? side('kr', sidePlanet(pl), t('cos.ruler', { p: t('pl.' + pl) })) : ''}</div>
  ${p.id ? `<a class="kname" data-go="pets" role="button" tabindex="0" aria-label="${esc(t('pets.change'))}"><span>${esc(name)}</span>${multi ? IC_SWAP : ''}</a>` : ''}
  <div class="ksky">${moonDisc(m.frac)}<span>${esc(fmtDate(lang, now))}<br><i>${esc(t('moonph.' + m.idx))}</i></span></div>`;
  const perg = (inner) => `<div class="kscroll"><div class="p-mid"></div><img class="p-top" src="assets/aura/perg_felso.webp" alt=""><img class="p-bot" src="assets/aura/perg_also.webp" alt=""><div class="p-in">${inner}</div></div>`;
  if (!p.id) return head + perg(`${birthStar()}<h2>${esc(t('cos.title'))}</h2><p class="kc">${esc(t('pets.empty'))}</p><div class="kbtn"><button class="btn-gold" data-go="pets/uj">${esc(t('pets.add'))}</button></div>`);
  if (!ok) return head + perg(`${birthStar()}<h2>${esc(t('cos.title'))}</h2><p class="kc">${esc(t('cos.need'))}</p><div class="kbtn"><button class="btn-gold" data-go="pets/${p.id}">${esc(t('pets.edit'))}</button></div>`);

  // --- A teljes szövegtár (data/horoscope/<nyelv>/<azonosító>.json): a címet és az első bekezdést a mount tölti be, a teljes szöveg az olvasóban.
  const sp = p.species === 'cat' ? 'cat' : p.species === 'dog' ? 'dog' : null;
  if (!sp) return head + perg(`<h2>${esc(t('cos.ch.big3'))}</h2><p class="kc">${esc(t('cos.pickSp'))}</p><div class="kspk"><button class="btn-gold" data-ksp="dog">${esc(t('au.al.dog'))}</button><button class="btn-gold" data-ksp="cat">${esc(t('au.al.cat'))}</button></div>`);
  const tx = (id) => `<div class="ktx" data-tx="${id}"><i class="kload">${esc(t('cos.loading'))}</i></div>`;
  const row = (lab, i, id, glow) => `<div class="krow">${zodiacMedal(i, glow)}<div><small>${esc(t(lab))}</small><b>${esc(t('zs.' + i))}</b>${tx(id)}</div></div>`;
  const big = `<h2>${esc(t('cos.ch.big3'))}</h2>${row('cos.k.sun', pf.sun, `sun_sign.${pf.sun}.${sp}`, 'g-sun')}${divider()}${row('cos.k.moon', pf.moon, `moon_sign.${pf.moon}.${sp}`, 'g-moon')}${divider()}
    ${pf.asc !== null ? row('cos.k.asc', pf.asc, `asc_sign.${pf.asc}.${sp}`, 'g-asc') : `<div class="knote">${esc(t('cos.needAsc'))} <a data-go="pets/${p.id}" role="button" tabindex="0">${esc(t('pets.edit'))}</a></div>`}
    ${pf.approx ? `<div class="knote">${esc(t('cos.approx'))}</div>` : ''}`;
  const PI = { sun: 0, moon: 1, mercury: 2, venus: 3, mars: 4, jupiter: 5, saturn: 6, uranus: 7, neptune: 8, pluto: 9 };
  const pmedal = (k) => `<span class="zm pm"><svg viewBox="-14 -14 128 128" aria-hidden="true"><path d="${PG[PI[k]]}" fill="url(#au)"/></svg></span>`;
  const link = (id, inner) => `<a class="kline" data-go="cosmic/${id}" role="button" tabindex="0">${inner}<span class="karr">›</span></a>`;
  const signs = pf.planets.filter((q) => q.key !== 'sun' && q.key !== 'moon').map((q) => link(`planet_sign.${q.key}.${q.sign}.${sp}`, `${pmedal(q.key)}<span class="kl"><b>${esc(t('pl.' + PI[q.key]))} · ${esc(t('zs.' + q.sign))}</b><span class="kt" data-title="planet_sign.${q.key}.${q.sign}.${sp}"></span></span>`)).join('');
  const ROM = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'], hn2 = (n) => (lang === 'ja' ? String(n) : ROM[n]);
  const houses = pf.planets[0].house ? pf.planets.map((q) => link(`planet_house.${q.key}.${q.house}.${sp}`, `${pmedal(q.key)}<span class="kl"><b>${esc(t('pl.' + PI[q.key]))} · ${esc(t('cos.house', { n: hn2(q.house) }))}</b><span class="kt" data-title="planet_house.${q.key}.${q.house}.${sp}"></span></span>`)).join('')
    : `<div class="knote">${esc(t('cos.needHouses'))} <a data-go="pets/${p.id}" role="button" tabindex="0">${esc(t('pets.edit'))}</a></div>`;
  const ASYM = { conjunction: '☌', sextile: '⚹', square: '□', trigon: '△', opposition: '☍' };
  const byType = {}; pf.aspects.forEach((a) => (byType[a.type] = byType[a.type] || []).push(`${t('pl.' + PI[a.a])} – ${t('pl.' + PI[a.b])}`));
  const aspects = Object.keys(ASYM).filter((k) => byType[k]).map((k) => link(`aspect.${k}`, `<span class="zm pm asym">${ASYM[k]}</span><span class="kl"><b>${esc(t('asp.' + k))}</b><span class="kpairs">${esc(byType[k].join(' · '))}</span></span>`)).join('');
  const chapter = (title, body) => `<div class="kchap"><h2>${esc(title)}</h2>${body}</div>`;
  const chapters = perg(chapter(t('cos.ch.signs'), signs)) + perg(chapter(t('cos.ch.houses'), houses)) + (aspects ? perg(chapter(t('cos.ch.aspects'), aspects)) : '');

  const key = now.toISOString().slice(0, 10), g = GL[sun];
  const hue = luckyHue(key, g), vals = Array.from({ length: 8 }, (_, i) => 35 + (hash(key + g + i) % 55)), hn = hueName(hue);
  // Az elem-szöveg „Föld energia: …” alakú: a kettőspont előtti rész a cím, így nem ismétlődik.
  const et = t('el.' + el), cut = et.search(/[:：]/), eh = cut > 0 ? et.slice(0, cut) : t('au.el.' + el), eb = cut > 0 ? et.slice(cut + 1).trim() : et;
  return head + perg(big) + chapters + `
  <h2 class="ktoday">${esc(t('cos.today'))}</h2>
  <div class="kglass kel">${orn('t')}${elemArt(el, 'kbgm')}<span class="kico">${elemArt(el, 'kicon')}</span><div><h3>${esc(eh)}</h3><p>${esc(eb)}</p></div>${orn('b')}</div>
  <div class="kglass ken">${orn('t')}<h3>${esc(t('cos.energy'))}</h3>${energy(vals, t, esc)}${orn('b')}</div>
  <div class="kglass kluck">${orn('t')}<span class="kgemw" style="--gm:hsl(${{ red: 2, yellow: 45, green: 135, blue: 220, purple: 285 }[hn]} 90% 60% / .7)"><span class="kmist"></span>${gem(hn)}<i class="ks s1"></i><i class="ks s2"></i><i class="ks s3"></i></span><div><h3>${esc(t('cos.lucky'))}</h3><b class="kcol">${esc(t('hue.' + hn))}</b><p>${esc(t('luck.' + hn))}</p></div>${orn('b')}</div>`;
}

// --- szövegtár betöltése (nyelvenként, azonosítónként egy kis JSON; egyszer töltjük le, utána a memóriából) ---
const LIB = new Map();
export function libText(lang, id) {
  const k = lang + '/' + id; if (!LIB.has(k)) LIB.set(k, fetch(`data/horoscope/${lang}/${id}.json?v=0.6.54`).then((r) => (r.ok ? r.json() : null)).catch(() => null));
  return LIB.get(k);
}
// Teljes szöveg az olvasóban (útvonal: #cosmic/<azonosító>), a pergamenen.
export function readerView({ t, esc, id }) {
  // a szöveg helye a horoszkópban, pl. „Napjegy · Bika · Kutya”, „Mars · I. ház · Macska”, „Fényszögek · Kvadrát”
  const PIX = { sun: 0, moon: 1, mercury: 2, venus: 3, mars: 4, jupiter: 5, saturn: 6, uranus: 7, neptune: 8, pluto: 9 }, ROM = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const q = id.split('.'), spn = (x) => (x === 'cat' ? t('au.al.cat') : x === 'dog' ? t('au.al.dog') : '');
  const ctx = q[0] === 'aspect' ? [t('cos.ch.aspects'), t('asp.' + q[1])]
    : q[0] === 'planet_sign' ? [t('pl.' + PIX[q[1]]), t('zs.' + q[2]), spn(q[3])]
    : q[0] === 'planet_house' ? [t('pl.' + PIX[q[1]]), t('cos.house', { n: ROM[+q[2]] || q[2] }), spn(q[3])]
    : [t({ sun_sign: 'cos.k.sun', moon_sign: 'cos.k.moon', asc_sign: 'cos.k.asc' }[q[0]] || 'nav.cosmic'), t('zs.' + q[1]), spn(q[2])];
  // központi égi szimbólum a pergamen felső peremén: ugyanaz az érme, mint a listában
  const ASYM = { conjunction: '☌', sextile: '⚹', square: '□', trigon: '△', opposition: '☍' };
  const sym = q[0] === 'aspect' ? `<span class="zm pm asym">${ASYM[q[1]] || '✦'}</span>`
    : q[0].startsWith('planet') ? `<span class="zm pm"><svg viewBox="-14 -14 128 128" aria-hidden="true"><path d="${PG[PIX[q[1]]]}" fill="url(#au)"/></svg></span>`
    : zodiacMedal(+q[1], { sun_sign: 'g-sun', moon_sign: 'g-moon', asc_sign: 'g-asc' }[q[0]] || 'g-sun');
  // a lap alja: halványan derengő kristályok és a lassan forgó asztrológiai kör (a portré körüli díszítés teljes köre, maszk nélkül)
  const dial = astrolabe().replace(' mask="url(#kmh)"', '').replace(' mask="url(#kmv)"', '').replace('class="kastro"', 'class="kdial"');
  return `<h1 class="t">${esc(t('nav.cosmic'))}</h1><p class="kctx">${esc(ctx.filter(Boolean).join(' · '))}</p><div class="kreader"><div class="kscroll"><div class="p-mid"></div><img class="p-top" src="assets/aura/perg_felso.webp" alt=""><img class="p-bot" src="assets/aura/perg_also.webp" alt=""><span class="krsym">${sym}</span><div class="p-in" id="kread"><i class="kload">${esc(t('cos.loading'))}</i></div></div></div>
   <div class="krfoot">${dial}<img class="kcry l" src="assets/kezdolap/crystals.webp" alt=""><img class="kcry r" src="assets/kezdolap/crystals.webp" alt="">
    <button class="krbtn" data-go="cosmic"><span>${esc(t('cos.back'))}</span></button></div>`;
}
// Japánul nincs iniciálé (a japán tördelés nem ismeri, és egy kana egyedül furcsán hatna): helyette egy kis, cinóbervörös pecsét
// (落款-szerű) nyitja a szöveget, benne a jegy / bolygó / fényszög jelével.
function sealFor(id) {
  const q = id.split('.'), PIX = { sun: 0, moon: 1, mercury: 2, venus: 3, mars: 4, jupiter: 5, saturn: 6, uranus: 7, neptune: 8, pluto: 9 };
  const ASYM = { conjunction: '☌', sextile: '⚹', square: '□', trigon: '△', opposition: '☍' };
  const inner = q[0] === 'aspect' ? `<span class="ksealt">${ASYM[q[1]] || '✦'}</span>`
    : `<svg viewBox="-10 -10 120 120" aria-hidden="true"><path d="${q[0].startsWith('planet') ? PG[PIX[q[1]]] : ZG[+q[1]]}" fill="#b3341f"/></svg>`;
  return `<span class="kseal" aria-hidden="true">${inner}</span>`;
}
export function mountReader(root, lang, id, esc) {
  libText(lang, id).then((d) => {
    const box = root.querySelector('#kread'); if (!box || !d) return;
    let n = d.n; while (n.length && n[0][1].trim() === d.title.trim()) n = n.slice(1); // a cím ne ismétlődjön
    const dropAt = n.findIndex((x) => x[0] === 'p' && x[1].length > 80); // az iniciálé az első valódi bekezdésre kerül
    // 1–2 pihentető díszvonal a hosszú szövegben: a harmadoló pontokhoz legközelebbi címsor (vagy bekezdés) elé
    const marks = new Set(), pick = (f) => { const target = Math.round(n.length * f); let best = -1;
      for (let i = 2; i < n.length - 1; i++) if (n[i][0] !== 'q' && (best < 0 || (n[i][0] === 'h') > (n[best][0] === 'h') || ((n[i][0] === 'h') === (n[best][0] === 'h') && Math.abs(i - target) < Math.abs(best - target)))) best = i;
      if (best > 0) marks.add(best); };
    if (n.length >= 6) pick(1 / 2); if (n.length >= 14) { marks.clear(); pick(1 / 3); const a = [...marks][0]; pick(2 / 3); if ([...marks].length < 2 || [...marks][1] - a < 3) { marks.clear(); pick(1 / 2); } }
    box.innerHTML = `<h2 class="krt">${esc(d.title)}</h2>${divider()}` + n.map(([k, x], i) => (marks.has(i) ? divider() : '') + (k === 'h' ? `<h3 class="krh">${esc(x)}</h3>` : k === 'q' ? `<blockquote class="krq">${esc(x)}</blockquote>` : (i === dropAt && lang === 'ja' ? `<p class="krp">${sealFor(id)}${esc(x)}</p>` : `<p class="krp${i === dropAt ? ' kdrop' : ''}">${esc(x)}</p>`))).join('')
      + (d.sig ? `${divider()}<p class="krs">${esc(d.sig)}</p>` : '');
  });
}

// Mozgás: az asztrolábium görgetésre lassan fordul; a fénygömb végighalad az égi pályán (csökkentett mozgásnál áll).
// Mozgás: az asztrolábium CSS-ből, önállóan és nagyon lassan forog (a görgetéstől független).
// A fénygömb csak balról jobbra halad (az idő múlását követve); a végén elhalványul, és elölről indul.
// Elemzéseim: a horoszkóp pillanatképe (a látott fejezetek, címkék és a TELJES szövegek, ahogy most szólnak).
// Csak akkor készül új bejegyzés, ha a tartalom változott (más születési adat vagy módosult szövegtár).
async function snapshotHoroscope(root, lang, pet, t) {
  if (!pet || !pet.id || !root.querySelector('.krow')) return;
  const sections = [...root.querySelectorAll('.kscroll')].map((sc) => {
    const title = sc.querySelector('h2')?.textContent || '';
    const items = [...sc.querySelectorAll('.krow, .kline')].map((el) => {
      if (el.classList.contains('krow')) { const tx = el.querySelector('[data-tx]'); return tx ? { id: tx.dataset.tx, label: [el.querySelector('small')?.textContent, el.querySelector('b')?.textContent].filter(Boolean).join(' · ') } : null; }
      const id = (el.dataset.go || '').replace(/^cosmic\//, ''); const b = el.querySelector('b')?.textContent || ''; const pairs = el.querySelector('.kpairs')?.textContent || '';
      return id ? { id, label: b, pairs } : null;
    }).filter(Boolean);
    return { title, items };
  }).filter((x) => x.items.length);
  const ids = [...new Set(sections.flatMap((x) => x.items.map((i) => i.id)))];
  const texts = {}; for (const id of ids) { const d = await libText(lang, id); if (!d) return; texts[id] = d; }
  if (!document.body.contains(root)) return;
  const birth = { bday: pet.bday, btime: pet.btime, place: pet.place, species: pet.species };
  const sg = sig(JSON.stringify([lang, birth, sections, texts]));
  const last = await lastOf(pet.id, 'horo'); if (last && last.sig === sg) return;
  saveWithNotice({ type: 'horo', petId: pet.id, petName: pet.name || t('au.start.noname'), lang, birth, sections, texts, sig: sg }, t);
}

export function mountCosmic(root, lang, esc, extra = {}) {
  if (extra.pet) setTimeout(() => snapshotHoroscope(root, lang, extra.pet, extra.t), 1200);
  root.querySelectorAll('[data-tx]').forEach((el) => libText(lang, el.dataset.tx).then((d) => { if (!d) { el.innerHTML = ''; return; }
    const first = d.n.find((x) => x[0] === 'p');
    el.innerHTML = `<i class="ktt">${esc(d.title)}</i>${first ? `<p>${esc(first[1])}</p>` : ''}<a class="kmore" data-go="cosmic/${el.dataset.tx}" role="button" tabindex="0">${esc(el.closest('.km').dataset.more)} ›</a>`; }));
  root.querySelectorAll('[data-title]').forEach((el) => libText(lang, el.dataset.title).then((d) => { if (d) el.textContent = d.title; }));
  const path = root.querySelector('#kpath'), orb = root.querySelector('#korbit'), svg = path && path.ownerSVGElement;
  let raf = 0; const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (path && orb) {
    const L = path.getTotalLength(), t0 = performance.now(), vb = svg.viewBox.baseVal, place = (f) => { const pt = path.getPointAtLength(f * L); orb.style.left = (pt.x / vb.width * 100) + '%'; orb.style.top = (pt.y / vb.height * 100) + '%'; };
    if (still) place(0.5); else { const step = (now) => { const f = ((now - t0) / 12000) % 1; place(f); orb.style.opacity = Math.min(1, f * 10, (1 - f) * 10).toFixed(2); raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step); }
  }
  return () => cancelAnimationFrame(raf);
}
