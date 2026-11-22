// Megosztási kártya (Szonja jóváhagyott terve, „minta_c”): 1080×1920-as álló kép, külön, nagy felbontásban rajzolva
// (nem képernyőkép). Felül a nagy auraportré, alatta a kézírásos név ragyogással, csillagjegy · dátum, díszvonal,
// az aura címe, kétsoros idézet, a felhasznált rétegek kis fénygörbéi, legalul a Pet Aura márkajelzés.
// A cím és az idézet a 4. szakaszig mintaszöveg; a valódiakat az elemzőmotor adja a jóváhagyott címtárból és mondattárból.
const W = 1080, H = 1920;
const img = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
const GOLD = (x, y0, y1) => { const g = x.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#fff0b8'); g.addColorStop(1, '#d9a34a'); return g; };

function wrap(x, text, maxW) { // sortörés szavanként (japánnál karakterenként)
  const cjk = /[　-鿿]/.test(text), parts = cjk ? [...text] : text.split(' '), lines = []; let cur = '';
  for (const p of parts) { const tryS = cur ? cur + (cjk ? '' : ' ') + p : p; if (x.measureText(tryS).width > maxW && cur) { lines.push(cur); cur = p; } else cur = tryS; }
  if (cur) lines.push(cur); return lines;
}
function fitFont(x, text, family, weight, style, size, maxW, min) { // ha nem fér ki egy sorba, kisebb betű
  let s = size; do { x.font = `${style} ${weight} ${s}px ${family}`; if (x.measureText(text).width <= maxW) break; s -= 2; } while (s > min); return s;
}
function star(x, cx, cy, r, a) { x.save(); x.globalAlpha = a; x.fillStyle = '#fff6d8'; x.shadowColor = '#fff'; x.shadowBlur = r * 1.4;
  x.beginPath(); x.moveTo(cx, cy - r); x.quadraticCurveTo(cx, cy, cx + r, cy); x.quadraticCurveTo(cx, cy, cx, cy + r); x.quadraticCurveTo(cx, cy, cx - r, cy); x.quadraticCurveTo(cx, cy, cx, cy - r); x.fill(); x.restore(); }
const ICON = { // a fénygörbék közepén: hold (csillagjegy), iránytű (égtáj), mancs (viselkedés) – 32-es rácson
  astro: (x) => { x.beginPath(); x.moveTo(19, 5); x.arc(14, 16, 11, -1.1, 1.75, true); x.arc(21.5, 13, 9, 2.25, -1.3, false); x.closePath(); x.fill(); },
  qi: (x) => { x.lineWidth = 2; x.beginPath(); x.arc(16, 16, 12, 0, 7); x.stroke(); x.beginPath(); x.moveTo(16, 5); x.lineTo(19, 16); x.lineTo(16, 27); x.lineTo(13, 16); x.closePath(); x.fill(); },
  etho: (x) => { [[16, 21, 6.5, 5.5], [8, 13.5, 2.6, 3.3], [13, 8.5, 2.7, 3.5], [19, 8.5, 2.7, 3.5], [24, 13.5, 2.6, 3.3]].forEach(([a, b, c, d]) => { x.beginPath(); x.ellipse(a, b, c, d, 0, 0, 7); x.fill(); }); },
};

export async function makeShareCard({ lang, aura, name, sub, title, quote, quotes, layers, brand, tagline, noBehaviour }) {
  await Promise.all([document.fonts.load('400 170px "Great Vibes"'), document.fonts.load('600 58px "Cormorant Garamond"'), document.fonts.load('italic 600 40px "Cormorant Garamond"'), document.fonts.load('700 52px "Cormorant Garamond"')].map((p) => p.catch(() => {})));
  const [bg, div, paw] = await Promise.all([img('assets/kezdolap/bg.webp?v=0.6.58'), img('assets/elemzeseim/ablak_valaszto.webp?v=0.6.58'), img('assets/fiok/mancs.webp?v=0.6.58')]);
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  // háttér: a kezdőlap galaktikus képe, kitöltve; alul sötétedő ív, hogy a szöveg jól olvasható legyen
  x.fillStyle = '#1c1240'; x.fillRect(0, 0, W, H);
  if (bg) { const s = Math.max(W / bg.width, H / bg.height), w = bg.width * s, h = bg.height * s; x.drawImage(bg, (W - w) / 2, (H - h) / 2, w, h); }
  let g = x.createRadialGradient(W / 2, H * .3, W * .2, W / 2, H * .3, W * 1.1); g.addColorStop(0, 'rgba(20,9,48,0)'); g.addColorStop(1, 'rgba(20,9,48,.67)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  g = x.createLinearGradient(0, H * .5, 0, H * .78); g.addColorStop(0, 'rgba(20,9,48,0)'); g.addColorStop(1, 'rgba(20,9,48,.88)'); x.fillStyle = g; x.fillRect(0, H * .5, W, H * .5);
  // auraportré: a kártya felső részén nagyban (a keret a szélesség kb. háromnegyede)
  if (aura) { const s = 1260; x.drawImage(aura, (W - s) / 2, -40, s, s); }
  x.textAlign = 'center'; x.textBaseline = 'alphabetic';
  // név – kézírás, meleg arany fény
  fitFont(x, name, '"Great Vibes"', 400, 'normal', 170, W - 160, 90);
  x.save(); x.fillStyle = '#ffe7a6'; x.shadowColor = 'rgba(255,207,122,.75)'; x.shadowBlur = 26; x.fillText(name, W / 2, 1270); x.shadowColor = 'rgba(185,140,255,.55)'; x.shadowBlur = 60; x.fillText(name, W / 2, 1270); x.restore();
  const nw = x.measureText(name).width; star(x, W / 2 - nw / 2 - 40, 1150, 18, .95); star(x, W / 2 + nw / 2 + 30, 1250, 12, .9);
  // csillagjegy · dátum
  x.font = 'italic 500 40px "Cormorant Garamond"'; x.fillStyle = '#eadcf8'; x.fillText(sub, W / 2, 1342);
  if (div) { const dw = 640, dh = div.height * dw / div.width; x.drawImage(div, (W - dw) / 2, 1372, dw, dh); }
  // aura címe
  fitFont(x, title, '"Cormorant Garamond"', 600, 'italic', 58, W - 120, 36);
  x.save(); x.fillStyle = '#f6dca0'; x.shadowColor = 'rgba(255,207,122,.45)'; x.shadowBlur = 16; x.fillText(title, W / 2, 1478); x.restore();
  // idézet: legfeljebb két sor; ha nem fér ki, előbb kisebb betű, végső esetben csak az utolsó mondat
  const QM = { ja: ['「', '」'], de: ['„', '“'], hu: ['„', '”'], pl: ['„', '”'] }[lang] || ['“', '”'];
  let q = [], qs = 38;
  for (const [txt, size] of [[quote, 38], [quote, 34], [quote, 31], [(quotes || [quote]).slice(-1)[0], 38]]) {
    x.font = `italic 500 ${size}px "Cormorant Garamond"`; q = wrap(x, QM[0] + txt + QM[1], W - 180); qs = size; if (q.length <= 2) break; }
  q = q.slice(0, 2); x.fillStyle = '#efe3f6'; const lh = Math.round(qs * 1.26); q.forEach((l, i) => x.fillText(l, W / 2, 1546 + i * lh));
  // fénygörbék: csak a ténylegesen felhasznált rétegek
  const top = 1546 + (q.length - 1) * lh + 22, n = layers.length, rx = 150, ry = 52, gap = 260, x0 = W / 2 - (n - 1) * gap / 2, cy = top + ry;
  x.save(); x.globalAlpha = .55; x.strokeStyle = '#ffe3a8'; x.lineWidth = 1.6; x.beginPath();
  for (let i = 0; i <= 80; i++) { const px = x0 - rx + i * ((n - 1) * gap + 2 * rx) / 80, py = cy + Math.sin(i / 80 * Math.PI * (n + 1)) * 22; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); x.restore();
  layers.forEach((L, i) => { const ex = x0 + i * gap;
    x.save(); x.strokeStyle = L.col; x.lineWidth = 4; x.shadowColor = L.col; x.shadowBlur = 18; x.beginPath(); x.ellipse(ex, cy, rx, ry, 0, 0, 7); x.stroke(); x.stroke(); x.restore();
    x.save(); x.translate(ex - 17.6, cy - 17.6); x.scale(1.1, 1.1); x.fillStyle = GOLD(x, 0, 32); x.strokeStyle = GOLD(x, 0, 32); (ICON[L.k] || ICON.etho)(x); x.restore();
    x.font = '600 29px "Cormorant Garamond"'; x.fillStyle = '#f3e3bd'; fitFont(x, L.label, '"Cormorant Garamond"', 600, 'normal', 29, gap - 12, 20); x.fillText(L.label, ex, cy + ry + 40); });
  let fy = cy + ry + 40;
  if (noBehaviour) { x.font = 'italic 500 28px "Cormorant Garamond"'; x.fillStyle = '#d9c9ee'; x.fillText(noBehaviour, W / 2, fy + 42); fy += 42; }
  // márkajelzés legalul
  const by = H - 92; // a márkajelzés mindig a kép alján, teljesen látszik
  x.font = '700 52px "Cormorant Garamond"'; const bw = x.measureText(brand).width; x.font = 'italic 500 28px "Cormorant Garamond"'; const tw = x.measureText(tagline).width;
  const blockW = 92 + 22 + Math.max(bw, tw), bx = (W - blockW) / 2;
  if (paw) x.drawImage(paw, bx, by - 46, 92, 92 * paw.height / paw.width);
  x.textAlign = 'left'; x.font = '700 52px "Cormorant Garamond"'; x.fillStyle = '#f6d27a'; x.fillText(brand, bx + 114, by + 2);
  x.font = 'italic 500 28px "Cormorant Garamond"'; x.fillStyle = '#e3d3f2'; x.fillText(tagline, bx + 114, by + 40);
  return new Promise((res) => c.toBlob(res, 'image/jpeg', .92));
}
