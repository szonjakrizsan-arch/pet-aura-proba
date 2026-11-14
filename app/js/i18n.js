// Pure i18n core: no DOM, no hardcoded UI text. Add a language = add locales/<code>.json + list it here.
export const SUPPORTED = [
  { code: 'hu', label: 'Magyar' }, { code: 'en', label: 'English' }, { code: 'de', label: 'Deutsch' },
  { code: 'pt-BR', label: 'Português (BR)' }, { code: 'es', label: 'Español' }, { code: 'pl', label: 'Polski' }, { code: 'ja', label: '日本語' }];
export const FALLBACK = 'en';
export const KB_READY = ['hu', 'en']; // languages with the full horoscope knowledge base (locales/kb.<code>.json)
export const chain = (lang) => [...new Set([lang, lang.split('-')[0], FALLBACK])];
export function detect(preferred = [], saved) {
  const codes = SUPPORTED.map((s) => s.code);
  if (saved && codes.includes(saved)) return saved;
  for (const p of preferred) {
    const hit = codes.find((c) => c.toLowerCase() === p.toLowerCase()) || codes.find((c) => c.split('-')[0].toLowerCase() === p.split('-')[0].toLowerCase());
    if (hit) return hit;
  }
  return FALLBACK;
}
// dicts: { code: {key: text} }. Falls back lang -> base -> en -> key.
export function translate(dicts, lang, key, vars = {}) {
  for (const c of chain(lang)) {
    const s = dicts[c]?.[key];
    if (s !== undefined) return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
  }
  console.warn('[i18n] missing', lang, key);
  return key;
}
export const fmtPct = (lang, n) => new Intl.NumberFormat(lang, { style: 'percent' }).format(n / 100);
export const fmtDate = (lang, d) => new Intl.DateTimeFormat(lang, { dateStyle: 'long' }).format(d);
// Only codes listed in SUPPORTED have a file (e.g. "pt" is just a lookup step, never fetched).
export async function loadDicts(lang, fetchJson = (u) => fetch(u).then((r) => (r.ok ? r.json() : Promise.reject(new Error(u))))) {
  const known = SUPPORTED.map((s) => s.code), out = {};
  for (const c of chain(lang).filter((c) => known.includes(c))) { try { out[c] = await fetchJson(`locales/${c}.json?v=0.6.6`); } catch { continue; }
    if (KB_READY.includes(c)) { try { Object.assign(out[c], await fetchJson(`locales/kb.${c}.json?v=0.6.6`)); } catch { /* optional */ } } }
  return out;
}
