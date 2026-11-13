// Offline place search + historical timezone offset (DST-aware via the browser/Node Intl tz database).
export const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function searchCities(list, q, limit = 6) { // list rows: [name, cc, lat, lon, pop, normName], sorted by population
  const n = norm(q.trim()); if (n.length < 2) return [];
  const starts = [], inside = [];
  for (const c of list) { const i = c[5].indexOf(n); if (i === 0) starts.push(c); else if (i > 0) inside.push(c); if (starts.length >= limit) break; }
  return [...starts, ...inside].slice(0, limit);
}
// Offset (hours east of UTC) of IANA zone `tz` at the given LOCAL wall-clock time.
export function tzOffsetHours(tz, y, mo, d, h = 12, mi = 0) {
  const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
  const asUtc = (ms) => { const p = Object.fromEntries(f.formatToParts(ms).filter((x) => x.type !== 'literal').map((x) => [x.type, +x.value])); return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute); };
  const wall = Date.UTC(y, mo - 1, d, h, mi); let off = asUtc(wall) - wall;
  off = asUtc(wall - off) - (wall - off); return off / 3600000;
}
