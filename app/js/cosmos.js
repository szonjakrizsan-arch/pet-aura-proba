// Real astronomy-based values (moon phase, sun sign); only the interpretation is playful.
const SYNODIC = 29.530588853, NEW_MOON_2000 = Date.UTC(2000, 0, 6, 18, 14);
export function moonPhase(date) {
  const age = (((date.getTime() - NEW_MOON_2000) / 86400000) % SYNODIC + SYNODIC) % SYNODIC;
  return { age, frac: age / SYNODIC, idx: Math.floor((age / SYNODIC) * 8 + 0.5) % 8 };
}
export const MOON_GLYPHS = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
export const GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const STARTS = [[120, 10], [219, 11], [321, 0], [420, 1], [521, 2], [621, 3], [723, 4], [823, 5], [923, 6], [1023, 7], [1122, 8], [1222, 9]];
export function zodiac(month, day) {
  const k = month * 100 + day; let idx = 9;
  for (const [s, i] of STARTS) if (k >= s) idx = i;
  return { glyph: GLYPHS[idx], idx, element: ['fire', 'earth', 'air', 'water'][idx % 4] };
}
export function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
export const luckyHue = (dateKey, sign) => hash(dateKey + sign) % 360;
