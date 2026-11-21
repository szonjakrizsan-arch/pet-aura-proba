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

let inflight = null;
// Érvényes munkamenet: a meglévő, ha még él; lejárat előtt frissítve; ha nincs (vagy a frissítő kulcs érvénytelen), új névtelen fiók.
// Hálózati hibánál null – soha nem dob, és nem írja felül a meglévő munkamenetet.
export function session() {
  if (inflight) return inflight;
  inflight = (async () => {
    const s = load(); const now = Math.floor(Date.now() / 1000);
    if (s && s.expires_at - 60 > now) return s;
    try {
      if (s && s.refresh_token) {
        const r = await call('token?grant_type=refresh_token', { refresh_token: s.refresh_token });
        if (r.ok && keep(r.d)) { const n = keep(r.d); save(n); return n; }
        if (r.status >= 500) return null; // szerverhiba: a régi munkamenet megmarad, később újrapróbáljuk
      }
      const r = await call('signup', {});
      const n = r.ok ? keep(r.d) : null; if (n) save(n); return n;
    } catch { return null; } // nincs internet
  })().finally(() => { inflight = null; });
  return inflight;
}
export const userId = () => load()?.uid || '';
export const forgetSession = () => save(null);
