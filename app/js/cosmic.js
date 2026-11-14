// Kozmikus Mancs – új külső (3. szakasz). A számítás változatlan: horoscope.js (égi profil), cosmos.js (Hold, jegy, szerencseszín).
import { KB_READY, fmtDate } from './i18n.js?v=0.6.4';
import { birthProfile } from './horoscope.js?v=0.6.4';
import { moonPhase, zodiac, luckyHue, hash } from './cosmos.js?v=0.6.4';
import { elementArt } from './art.js?v=0.6.4';
import { ICON } from './home.js?v=0.6.4';
import { IC_SWAP } from './aura-deco.js?v=0.6.4';
import { ZG } from './zodiac-glyphs.js?v=0.6.4';

const ELEM = ['fire', 'earth', 'air', 'water'];
const glyph = (i) => `<svg viewBox="-8 -8 116 116" aria-hidden="true"><path d="${ZG[i]}" fill="url(#au)"/></svg>`;
const medal = (i) => `<span class="zm">${glyph(i)}</span>`;
// A szerencseszín árnyalatához a meglévő színnevek (hue.*) közül a legközelebbi.
const hueName = (h) => (h < 18 || h >= 330 ? 'red' : h < 70 ? 'yellow' : h < 170 ? 'green' : h < 255 ? 'blue' : 'purple');

function moonDisc(frac) {
  const r = 42, k = Math.cos(frac * 2 * Math.PI), rx = r * Math.abs(k), wax = frac < 0.5, cres = k > 0;
  const lit = `M50 ${50 - r}A${r} ${r} 0 0 ${wax ? 1 : 0} 50 ${50 + r}A${rx.toFixed(1)} ${r} 0 0 ${wax ? (cres ? 0 : 1) : (cres ? 1 : 0)} 50 ${50 - r}Z`;
  return `<svg class="kmoon" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="${r}" fill="#2a1a52"/><path d="${lit}" fill="url(#au)"/><circle cx="50" cy="50" r="${r}" fill="none" stroke="#f3cf7a" stroke-opacity=".55" stroke-width="2"/></svg>`;
}
function energy(vals) {
  const W = 300, H = 92, pts = vals.map((v, i) => [(i / (vals.length - 1)) * W, H - 12 - (v / 100) * (H - 26)]);
  let d = `M${pts[0][0]} ${pts[0][1].toFixed(1)}`; // lágy görbe a pontokon át
  for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], cx = (x0 + x1) / 2; d += `C${cx.toFixed(1)} ${y0.toFixed(1)} ${cx.toFixed(1)} ${y1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`; }
  const top = pts.reduce((a, p) => (p[1] < a[1] ? p : a));
  return `<svg class="kcurve" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="kcg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ffd98a" stop-opacity=".5"/><stop offset=".55" stop-color="#c98a3a" stop-opacity=".16"/><stop offset="1" stop-color="#6b3aa6" stop-opacity="0"/></linearGradient></defs>
   <path d="${d}L${W} ${H}L0 ${H}Z" fill="url(#kcg)"/><path d="${d}" fill="none" stroke="url(#au)" stroke-width="3" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
   <circle cx="${top[0].toFixed(1)}" cy="${top[1].toFixed(1)}" r="4.5" fill="#fff3c8" stroke="#d79a3a" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg>`;
}

let cache = { k: '', v: null };
const profile = (p) => { const k = [p.bday, p.btime, p.place && p.place.lat + ',' + p.place.lon].join('|'); if (cache.k !== k) { try { cache = { k, v: birthProfile(p) }; } catch { cache = { k, v: null }; } } return cache.v; };

export function cosmicView({ t, esc, lang, pet: p, multi }) {
  const now = new Date(), m = moonPhase(now), kb = KB_READY.includes(lang);
  const b = p.bday ? new Date(p.bday + 'T12:00:00') : null, ok = b && !isNaN(b);
  const pf = ok && kb ? profile(p) : null, sun = pf ? pf.sun : ok ? zodiac(b.getMonth() + 1, b.getDate()).idx : null;
  const name = p.name || t('au.start.noname');
  // Fejléc: a kiválasztott kedvenc portréja és neve (a névtáblával lehet kedvencet váltani – mint az Aura Scannerben).
  const head = `<h1 class="t">${esc(t('nav.cosmic'))}</h1>
  <div class="kpet"><div class="kph${p.photo ? '' : ' none'}"${p.photo ? ` style="background-image:url(${p.photo})"` : ''}>${p.photo ? '' : ICON.paw}</div><img src="assets/aura/portrekeret.png" alt="">${sun !== null ? `<span class="ksign">${medal(sun)}</span>` : ''}</div>
  ${p.id ? `<a class="kname" data-go="pets" role="button" tabindex="0" aria-label="${esc(t('pets.change'))}"><span>${esc(name)}</span>${multi ? IC_SWAP : ''}</a>` : ''}
  <div class="ksky">${moonDisc(m.frac)}<span>${esc(fmtDate(lang, now))}<br><i>${esc(t('moonph.' + m.idx))}</i></span></div>`;
  const perg = (inner) => `<div class="kscroll"><div class="p-mid"></div><img class="p-top" src="assets/aura/perg_felso.png" alt=""><img class="p-bot" src="assets/aura/perg_also.png" alt=""><div class="p-in">${inner}</div></div>`;
  if (!p.id) return head + perg(`<h2>${esc(t('cos.title'))}</h2><p class="kc">${esc(t('pets.empty'))}</p><div class="kbtn"><button class="btn-gold" data-go="pets/uj">${esc(t('pets.add'))}</button></div>`);
  if (!ok) return head + perg(`<h2>${esc(t('cos.title'))}</h2><p class="kc">${esc(t('cos.need'))}</p><div class="kbtn"><button class="btn-gold" data-go="pets/${p.id}">${esc(t('pets.edit'))}</button></div>`);

  const row = (lab, i, txt) => `<div class="krow${txt ? "" : " solo"}">${medal(i)}<div>${lab ? `<small>${esc(t(lab))}</small>` : ''}<b>${esc(t('zs.' + i))}</b>${txt ? `<p>${esc(txt)}</p>` : ''}</div></div>`;
  let big;
  if (pf) big = `<h2>${esc(t('h.big3'))}</h2>${row('h.sun', pf.sun, t('sun.' + pf.sun))}${row('h.moon', pf.moon, t('moon.' + pf.moon))}
    ${pf.asc !== null ? row('h.asc', pf.asc, t('asc.' + pf.asc)) : `<div class="knote">${esc(t('h.noAsc'))} <a data-go="pets/${p.id}" role="button" tabindex="0">${esc(t('pets.edit'))}</a></div>`}
    ${pf.approx ? `<div class="knote">${esc(t('h.approx'))}</div>` : ''}`;
  else big = `<h2>${esc(t('cos.sign'))}</h2>${row('', sun, '')}`;

  const el = ELEM[sun % 4], key = now.toISOString().slice(0, 10), g = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'][sun];
  const hue = luckyHue(key, g), vals = Array.from({ length: 8 }, (_, i) => 35 + (hash(key + g + i) % 55));
  // Az elem-szöveg „Föld energia: …” alakú: a kettőspont előtti rész a cím, így nem ismétlődik.
  const et = t('el.' + el), cut = et.search(/[:：]/), eh = cut > 0 ? et.slice(0, cut) : t('au.el.' + el), eb = cut > 0 ? et.slice(cut + 1).trim() : et;
  return head + perg(big) + `
  <div class="panel kel"><span class="kico">${elementArt(el)}</span><div><h3>${esc(eh)}</h3><p>${esc(eb)}</p></div></div>
  <div class="panel"><h3>${esc(t('cos.energy'))}</h3>${energy(vals)}</div>
  <div class="panel kluck"><span class="korb" style="--h:${hue}"></span><div><h3>${esc(t('cos.lucky'))}</h3><p>${esc(t('hue.' + hueName(hue)))}</p></div></div>`;
}
