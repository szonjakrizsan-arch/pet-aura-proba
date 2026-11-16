// Elemzéseim (Pet Aura-napló): az elkészült elemzések pillanatképei a telefonon, IndexedDB-ben.
// Egy régi elemzés soha nem változik meg: a mentéskor látott szövegek, képek és adatok maguk kerülnek a naplóba.
const DB = 'petaura', STORE = 'entries';
let dbp = null;
function open() {
  if (dbp) return dbp;
  dbp = new Promise((res, rej) => {
    if (!('indexedDB' in window)) { rej(new Error('noidb')); return; }
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => { const s = r.result.createObjectStore(STORE, { keyPath: 'id' }); s.createIndex('pet', 'petId'); s.createIndex('date', 'date'); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  dbp.catch(() => { dbp = null; });
  return dbp;
}
const tx = async (mode, fn) => { const db = await open(); return new Promise((res, rej) => { const t = db.transaction(STORE, mode), s = t.objectStore(STORE); let out; Promise.resolve(fn(s)).then((v) => { out = v; }); t.oncomplete = () => res(out); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); }); };
const req = (r) => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

// mentés; a megtelt tárhelyet külön jelezzük (a hívó érthető üzenetet mutat)
export async function addEntry(e) {
  const id = 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), rec = { ...e, id, date: e.date || Date.now() };
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); await tx('readwrite', (s) => s.put(rec)); return { ok: true, id }; }
  catch (err) { const q = err && (err.name === 'QuotaExceededError' || /quota/i.test(String(err.message || err))); return { ok: false, error: q ? 'quota' : 'other' }; }
}
export const listEntries = async () => { try { const all = await tx('readonly', (s) => req(s.getAll())); return (all || []).sort((a, b) => b.date - a.date); } catch { return []; } };
export const getEntry = async (id) => { try { return await tx('readonly', (s) => req(s.get(id))); } catch { return null; } };
export const deleteEntry = async (id) => { try { await tx('readwrite', (s) => s.delete(id)); return true; } catch { return false; } };
export async function deleteByPet(petId) {
  try { const all = await listEntries(); await tx('readwrite', (s) => { all.filter((e) => e.petId === petId).forEach((e) => s.delete(e.id)); }); return true; } catch { return false; }
}
export async function lastOf(petId, type) { const all = await listEntries(); return all.find((e) => e.petId === petId && e.type === type) || null; }
export function wipeAll() {
  return new Promise((res) => { try { if (dbp) dbp.then((d) => d.close()).catch(() => {}); dbp = null; const r = indexedDB.deleteDatabase(DB); r.onsuccess = r.onerror = r.onblocked = () => res(); } catch { res(); } });
}
// rövid, egyszerű ujjlenyomat a pillanatképek összevetéséhez (azonos tartalom → nincs új bejegyzés)
export function sig(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36) + ':' + str.length; }

// kis értesítés a képernyő alján (mentés sikerült / nem sikerült)
export function toast(text, bad = false) {
  const host = document.querySelector('.phone') || document.body; host.querySelector('.jtoast')?.remove();
  host.insertAdjacentHTML('beforeend', `<div class="jtoast${bad ? ' bad' : ''}" role="status"></div>`); const el = host.querySelector('.jtoast'); el.textContent = text;
  setTimeout(() => el.classList.add('out'), bad ? 6500 : 2600); setTimeout(() => el.remove(), bad ? 7200 : 3300);
}
export async function saveWithNotice(entry, t) {
  const r = await addEntry(entry);
  if (r.ok) toast(t('my.saved')); else toast(t(r.error === 'quota' ? 'my.full' : 'my.fail'), true);
  return r;
}
