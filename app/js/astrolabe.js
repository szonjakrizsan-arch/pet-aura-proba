// Lassan mozgó csillagjel az Elemzéseim oldal üres részére (Szonja képe alapján: állatövi kör, iránytűcsillag ametiszttel,
// körülötte két ferde pálya). A jelek a valódi állatövi jelek helyes sorrendben; minden gyűrű a saját ütemében forog.
import { ZG } from './zodiac-glyphs.js?v=0.6.74';

const C = 200, CY = 150; // középpont a 400×300-as rajzon
const ring = (r, w, o = 1) => `<circle cx="${C}" cy="${CY}" r="${r}" fill="none" stroke="url(#alg)" stroke-width="${w}" opacity="${o}"/>`;
function ticks(r0, r1, n, w) {
  let d = ''; for (let i = 0; i < n; i++) { const a = (i / n) * 2 * Math.PI, c = Math.cos(a), s = Math.sin(a); d += `M${(C + r0 * c).toFixed(1)} ${(CY + r0 * s).toFixed(1)}L${(C + r1 * c).toFixed(1)} ${(CY + r1 * s).toFixed(1)}`; }
  return `<path d="${d}" stroke="url(#alg)" stroke-width="${w}" opacity=".8"/>`;
}
function zodiac() {
  let g = '';
  for (let i = 0; i < 12; i++) {
    const a = -90 + i * 30 + 15, rad = (a * Math.PI) / 180, x = C + 97 * Math.cos(rad), y = CY + 97 * Math.sin(rad), s = 0.15;
    g += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a + 90}) translate(${-50 * s} ${-50 * s}) scale(${s})"><path d="${ZG[i]}" fill="url(#alg)"/></g>`;
  }
  return g + ticks(84, 110, 12, 1.1);
}
function star() { // nyolcágú iránytűcsillag: minden ág egy világos és egy árnyékos félből
  let d = '';
  for (let i = 0; i < 8; i++) {
    const long = i % 2 === 0, R = long ? 66 : 40, w = long ? 11 : 9, a = (i * 45 - 90) * Math.PI / 180;
    const tip = [C + R * Math.cos(a), CY + R * Math.sin(a)], l = [C + w * Math.cos(a - Math.PI / 2), CY + w * Math.sin(a - Math.PI / 2)], r = [C + w * Math.cos(a + Math.PI / 2), CY + w * Math.sin(a + Math.PI / 2)];
    const p = (q) => q.map((v) => v.toFixed(1)).join(' ');
    d += `<path d="M${C} ${CY}L${p(l)}L${p(tip)}Z" fill="url(#alhi)"/><path d="M${C} ${CY}L${p(r)}L${p(tip)}Z" fill="url(#allo)"/>`;
  }
  return d;
}
const orbit = (cls, tilt, dur) => { // ferde pálya: a hátsó fele a kör mögött, az első előtte; rajta egy fénypont fut körbe
  const e = (half) => `<path d="M${C - 172} ${CY}A172 40 0 0 ${half} ${C + 172} ${CY}" fill="none" stroke="url(#alg)" stroke-width="5" stroke-linecap="round"/><path d="M${C - 172} ${CY}A172 40 0 0 ${half} ${C + 172} ${CY}" fill="none" stroke="#fff3c8" stroke-width="1" opacity=".55" stroke-dasharray="2 6"/>`;
  return [`<g class="alorb ${cls}" style="--t:${tilt}deg;--d:${dur}s">${e(1)}</g>`,
    `<g class="alorb ${cls}" style="--t:${tilt}deg;--d:${dur}s">${e(0)}<circle r="3.2" fill="#fff6d8" filter="url(#alblur)"><animateMotion dur="${dur / 2}s" repeatCount="indefinite" path="M${C - 172} ${CY}A172 40 0 1 0 ${C + 172} ${CY}A172 40 0 1 0 ${C - 172} ${CY}"/></circle></g>`];
};
const sparks = [[52, 48, 5], [350, 64, 4], [318, 232, 5.5], [78, 238, 4], [204, 14, 4.5], [380, 160, 3.5], [22, 150, 3.5]]
  .map(([x, y, s], i) => `<path class="alsp" style="--dl:${(i * 1.7).toFixed(1)}s" d="M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z" fill="#fff3cf"/>`).join('');

export function astrolabe() {
  const [b1, f1] = orbit('o1', -16, 46), [b2, f2] = orbit('o2', 21, 64);
  return `<div class="myastro" aria-hidden="true"><svg viewBox="0 0 400 300">
  <defs>
    <linearGradient id="alg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3c8"/><stop offset=".4" stop-color="#f6d27a"/><stop offset=".75" stop-color="#d79a3a"/><stop offset="1" stop-color="#a86f20"/></linearGradient>
    <linearGradient id="alhi" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6d6"/><stop offset="1" stop-color="#f2c665"/></linearGradient>
    <linearGradient id="allo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9973a"/><stop offset="1" stop-color="#8a5a16"/></linearGradient>
    <radialGradient id="aldisc"><stop offset="0" stop-color="#5a2a8f"/><stop offset=".75" stop-color="#2e1260"/><stop offset="1" stop-color="#1c0a3e"/></radialGradient>
    <radialGradient id="alhalo"><stop offset="0" stop-color="#c79bff" stop-opacity=".55"/><stop offset=".55" stop-color="#8c5ad8" stop-opacity=".18"/><stop offset="1" stop-color="#8c5ad8" stop-opacity="0"/></radialGradient>
    <filter id="alblur" x="-2" y="-2" width="5" height="5"><feGaussianBlur stdDeviation="1.6"/></filter>
  </defs>
  <circle class="alhalo" cx="${C}" cy="${CY}" r="150" fill="url(#alhalo)"/>
  ${b1}${b2}
  <circle cx="${C}" cy="${CY}" r="118" fill="#1c0a3e" opacity=".55"/>
  <g class="alrot r1">${ring(121, 3)}${ring(115, 1.2)}${ticks(115, 121, 72, .9)}</g>
  <g class="alrot r2">${ring(110, 1.4)}${zodiac()}${ring(84, 1.4)}</g>
  <circle cx="${C}" cy="${CY}" r="78" fill="url(#aldisc)"/>
  <g class="alrot r3">${ring(78, 2.6)}<circle cx="${C}" cy="${CY}" r="73" fill="none" stroke="url(#alg)" stroke-width="3.5" stroke-dasharray="1.6 3.2" opacity=".85"/>${ring(68, 1)}</g>
  <g class="alstar">${star()}</g>
  <circle cx="${C}" cy="${CY}" r="22.5" fill="#2a1048" stroke="url(#alg)" stroke-width="3.2"/><image href="assets/elemzeseim/ko_kerek.webp?v=0.6.74" x="${C - 19.5}" y="${CY - 19}" width="39" height="38"/>
  ${f1}${f2}${sparks}
  </svg></div>`;
}
