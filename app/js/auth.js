// Névtelen fiók (Supabase Auth, REST – külső könyvtár nélkül).
// Az első indításkor a háttérben létrejön egy e-mail nélküli fiók; a munkamenet a telefonon marad (localStorage 'pa.session').
// A felhasználó ebből semmit nem lát. Internet nélkül az app ugyanúgy működik, a fiók a következő indításkor jön létre.
// A kulcs NYILVÁNOS (publishable): böngészőbe szánt, a táblákat a sorszintű védelem (RLS) véd. Titkos kulcs SOHA nem kerül ide.
export const SUPABASE_URL = 'https://rjyzioicvplvguzkselg.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_0qlYsmL2r1hbDqkTMkMUpw_6Pke3kbj';
const KEY = 'pa.session';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } };
const save = (s) => { try { if (s) localStorage.setItem(KEY, JSON.stringify(s)); else localStorage.removeItem(KEY); } catch { /* nincs tárhely */ } };
const keep = (d) => d && d.access_token && d.refresh_token && d.user ? { access_token: d.access_token, refresh_token: d.refresh_token, expires_at: d.expires_at || Math.floor(Date.now() / 1000) + (d.expires_in || 3600), uid: d.user.id } : null;

async function call(path, body) {
  const r = await fetch(SUPABASE_URL + '/auth/v1/' + path, { method: 'POST', headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => null);
  return { ok: r.ok, status: r.status, d };
}

const fresh = (s) => s && s.expires_at - 60 > Math.floor(Date.now() / 1000);
async function obtain() {
  // A zár ALATT mindig újraolvassuk a tárhelyet: ha közben egy másik lap már létrehozta vagy frissítette, azt használjuk.
  const s = load(); if (fresh(s)) return s;
  try {
    if (s && s.refresh_token) {
      const r = await call('token?grant_type=refresh_token', { refresh_token: s.refresh_token });
      if (r.ok && keep(r.d)) { const n = keep(r.d); save(n); return n; }
      // Meglévő fióknál SOHA nem hozunk létre csendben újat: hálózati vagy szerverhibánál a régi megmarad, később újrapróbáljuk.
      // Új fiók csak akkor, ha a szerver kifejezetten érvénytelennek mondja a frissítő kulcsot (a fiók törölve vagy visszavonva).
      if (!(r.status === 400 || r.status === 401)) return null;
    }
    const r = await call('signup', {});
    const n = r.ok ? keep(r.d) : null; if (n) save(n); return n;
  } catch { return null; } // nincs internet
}
let inflight = null;
// Érvényes munkamenet. Egy böngészőn belül a lapok/ablakok sorban állnak (Web Locks), így egyszerre megnyitott lapok
// sem hozhatnak létre két fiókot, és nem frissíthetik ugyanazt a kulcsot kétszer. Soha nem dob.
export function session() {
  if (fresh(load())) return Promise.resolve(load());
  if (inflight) return inflight;
  const run = () => (navigator.locks ? navigator.locks.request('pa-auth', obtain) : obtain());
  inflight = run().catch(() => null).finally(() => { inflight = null; });
  return inflight;
}
export const userId = () => load()?.uid || '';
export const forgetSession = () => save(null);
