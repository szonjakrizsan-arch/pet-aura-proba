// Birth profile + today's sky from Celestine (positions); texts come from the knowledge base (locales/kb.*.json).
import { calculateChart } from './vendor/celestine.js?v=0.6.5';
import tzlookup from './vendor/tzlookup.js?v=0.6.5';
import { tzOffsetHours } from './geo.js?v=0.6.5';
const OPT = { includeAsteroids: false, includeChiron: false, includeLilith: false, includeNodes: false, includeLots: false, aspectTypes: 'major' };
const body = (c, n) => c.planets.find((p) => p.name === n);
// pet: { bday:'YYYY-MM-DD', btime:'HH:MM'|'', place:{lat,lon}|null }
export function birthProfile({ bday, btime, place }) {
  const [y, m, d] = bday.split('-').map(Number);
  if (btime && place) {
    const [h, mi] = btime.split(':').map(Number), tz = tzlookup(place.lat, place.lon), off = tzOffsetHours(tz, y, m, d, h, mi);
    const c = calculateChart({ year: y, month: m, day: d, hour: h, minute: mi, second: 0, timezone: off, latitude: place.lat, longitude: place.lon }, OPT);
    return { sun: body(c, 'Sun').sign, moon: body(c, 'Moon').sign, asc: c.angles.ascendant.sign, approx: false, level: 'full', tz };
  }
  const off = place ? tzOffsetHours(tzlookup(place.lat, place.lon), y, m, d, 12, 0) : 0;
  const at = (h, mi) => calculateChart({ year: y, month: m, day: d, hour: h, minute: mi, second: 0, timezone: off, latitude: 0, longitude: 0 }, OPT);
  const noon = at(12, 0), a = at(0, 0), b = at(23, 59);
  const approx = body(a, 'Moon').sign !== body(b, 'Moon').sign || body(a, 'Sun').sign !== body(b, 'Sun').sign;
  return { sun: body(noon, 'Sun').sign, moon: body(noon, 'Moon').sign, asc: null, approx, level: 'date' };
}
export function todaySky(now = new Date()) {
  const c = calculateChart({ year: now.getUTCFullYear(), month: now.getUTCMonth() + 1, day: now.getUTCDate(), hour: now.getUTCHours(), minute: now.getUTCMinutes(), second: 0, timezone: 0, latitude: 0, longitude: 0 }, OPT);
  return { moon: body(c, 'Moon').sign, mercuryRx: !!body(c, 'Mercury').isRetrograde };
}
// element = sign % 4 (fire, earth, air, water); same parity = harmonious (fire-air, earth-water, same element)
export const harmony = (a, b) => a % 2 === b % 2;
export const dailyKeys = (sunSign, sky) => ['day.' + sky.moon, harmony(sunSign % 4, sky.moon % 4) ? 'day.harmony' : 'day.tension', ...(sky.mercuryRx ? ['day.rx'] : [])];
