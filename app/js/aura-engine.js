// Aura Scanner – színmotor (AURA_V1_DONTESEK.md, 2026-11-08, Szonja jóváhagyta). A színeket SOHA nem az AI találja ki:
// a rögzített táblákból és a súlyszabályokból számoljuk. Keverés: sRGB → lineáris RGB → súlyozott átlag → sRGB.
// Hiányzó adatot nem pótolunk: a kimaradó réteg egyszerűen nem vesz részt (a súlyok a 5. pont táblája szerint).
import { birthProfile } from './horoscope.js?v=0.6.87';

export const RULES_VERSION = 'aura-v1-2026-11-08';

// 2. Asztrológiai mag – elemszínek (jegy % 4: 0 tűz, 1 föld, 2 levegő, 3 víz)
export const ELEM = ['fire', 'earth', 'air', 'water'];
export const ELEM_COL = { fire: '#D66A4A', earth: '#65875C', air: '#E3C56D', water: '#468DAB' };
// 3. Környezeti Qi – égtáj → elem → szín
export const QI_ELEM = { N: 'water', NE: 'earth', E: 'wood', SE: 'wood', S: 'fire', SW: 'earth', W: 'metal', NW: 'metal' };
export const QI_COL = { water: '#468DAB', earth: '#65875C', wood: '#329B78', fire: '#D66A4A', metal: '#B8C3CC' };
// 4.2 Etológiai pillanat – kategóriaszínek fajonként
export const ETHO_COL = {
  cat: { relaxed: '#83BFA6', curious: '#E8C66A', alert: '#A58DBB', withdrawn: '#7887B8', defensive: '#C96B66' },
  dog: { relaxed: '#79A98A', playful: '#F2A65A', curious: '#6FA9C8', withdrawn: '#7E82B5', defensive: '#C27A45' },
};
// 5. Végső súlyok a részt vevő rétegek szerint (az AI nem módosíthatja)
const WEIGHTS = {
  'astro,qi,etho': { astro: 0.30, qi: 0.30, etho: 0.40 },
  'astro,etho': { astro: 0.4286, etho: 0.5714 },
  'qi,etho': { qi: 0.4286, etho: 0.5714 },
  'astro,qi': { astro: 0.50, qi: 0.50 },
};

const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toLin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const toSrgb = (l) => { const c = l <= 0.0031308 ? l * 12.92 : 1.055 * l ** (1 / 2.4) - 0.055; return Math.max(0, Math.min(255, Math.round(c * 255))); };
const rgb2hex = (r) => '#' + r.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
// colors: [[hex, súly], …] – a súlyokat normáljuk
export function mix(colors) {
  const W = colors.reduce((s, [, w]) => s + w, 0); const acc = [0, 0, 0];
  for (const [h, w] of colors) hex2rgb(h).forEach((v, i) => { acc[i] += toLin(v) * w / W; });
  return rgb2hex(acc.map(toSrgb));
}

// Asztrológiai mag: Nap, Hold, Aszcendens egyenlő súllyal; születési dátum nélkül null.
// Aszcendens csak idővel és hellyel; dátumnál, ha a Hold aznap jegyet váltott, a Hold kimarad (a déli értéket nem használjuk).
export function cosmicLayer(pet) {
  if (!pet || !pet.bday) return null;
  let p; try { p = birthProfile(pet); } catch { return null; }
  const f = [['sun', p.sun]];
  if (!(p.level === 'date' && p.moonShift)) f.push(['moon', p.moon]);
  if (p.level === 'full' && p.asc != null) f.push(['asc', p.asc]);
  const factors = f.map(([k, sign]) => ({ k, sign, elem: ELEM[sign % 4] }));
  return { layer: 'astro', factors, color: mix(factors.map((x) => [ELEM_COL[x.elem], 1])), level: p.level, moonShift: !!p.moonShift, sunShift: !!p.sunShift };
}
// Környezeti Qi: csak élő kamerás fotónál, megbízható méréssel (dir: 'N' … 'NW'); különben null.
export function qiLayer(dir) {
  const elem = QI_ELEM[dir]; if (!elem) return null;
  return { layer: 'qi', dir, elem, color: QI_COL[elem] };
}
// Etológiai pillanat: 1 kategória → színe; 2 → 50–50% keverék; 0 vagy ≥3 → null (nem meghatározható).
export function ethoLayer(species, cats) {
  const tab = ETHO_COL[species]; const c = (cats || []).filter((x) => tab && tab[x]);
  if (!tab || c.length < 1 || c.length > 2 || c.length !== (cats || []).length) return null;
  return { layer: 'etho', species, cats: c, color: c.length === 1 ? tab[c[0]] : mix([[tab[c[0]], 1], [tab[c[1]], 1]]) };
}
// Végső aura: a részt vevő rétegek a rögzített súlyokkal. Egyik réteg sincs → null (nincs eredmény, 8. döntés).
export function finalAura(layers) {
  const L = ['astro', 'qi', 'etho'].map((k) => layers.find((x) => x && x.layer === k)).filter(Boolean);
  if (!L.length) return null;
  const w = L.length === 1 ? { [L[0].layer]: 1 } : WEIGHTS[L.map((x) => x.layer).join(',')];
  return { version: RULES_VERSION, layers: L, weights: w, color: mix(L.map((x) => [x.color, w[x.layer]])) };
}
