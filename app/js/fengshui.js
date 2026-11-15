// Mancs Feng Shui – a jóváhagyott v1 szövegtár (data/fengshui/<nyelv>.json) és kiválasztási szabályok
// (pet-aura-content/feng_shui/V1_KIVALASZTASI_SZABALYOK.md). A szövegekhez nem nyúlunk; a felület csak összeállítja az olvasást.
// Útvonalak: #feng (kérdések), #feng/olvasas (az olvasás).

const ZONES = ['northwest', 'north', 'northeast', 'west', 'center', 'east', 'southwest', 'south', 'southeast']; // 3×3 iránytű-rács
const ZID = { north: 'eszak', northeast: 'eszakkelet', east: 'kelet', southeast: 'delkelet', south: 'del', southwest: 'delnyugat', west: 'nyugat', northwest: 'eszaknyugat' };
// a zóna Wu Xing-fázisa (2. pont táblázata); a Közép: Föld
const ZEL = { north: 'viz', northeast: 'fold', east: 'fa', southeast: 'fa', south: 'tuz', southwest: 'fold', west: 'fem', northwest: 'fem', center: 'fold' };
// formaiskola-kérdések és a választott szöveg; a sorrend Szonja döntése (2026-11-02). q4 (huzat) nem választ szöveget.
const FORMS = [['q1', 'pihenohely', ['yes']], ['q2', 'fekete_teknos', ['yes', 'no']], ['q3', 'ajto_ablak', ['yes']], ['q5', 'folyoso', ['yes']], ['q6', 'szuk_atjaro', ['yes']], ['q7', 'zsufoltsag', ['yes']]];
const QS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'];

const DATA = new Map();
export const fsData = (lang) => { if (!DATA.has(lang)) DATA.set(lang, fetch(`data/fengshui/${lang}.json?v=0.6.11`).then((r) => (r.ok ? r.json() : null)).catch(() => null)); return DATA.get(lang); };

// a gazdi válaszai kedvencenként, külön tárolva (a kedvenc adatlapjához nem nyúlunk)
const key = (pid) => 'fs.' + (pid || 'x');
export const loadAns = (pid) => { try { return { zone: '', a: {}, ...JSON.parse(localStorage.getItem(key(pid)) || '{}') }; } catch { return { zone: '', a: {} }; } };
const saveAns = (pid, v) => { try { localStorage.setItem(key(pid), JSON.stringify(v)); } catch { /* tárhely tele */ } };

// Az olvasás összeállítása a szabályok szerint: 1. zóna- vagy középpontszöveg, 2. a zóna elemszövege, 3. legfeljebb egy formaiskola-szöveg.
export function compose(ans, sp) {
  const s = sp === 'cat' ? 'macska' : 'kutya', parts = [], z = ans.zone;
  if (z && z !== 'unknown') { parts.push(z === 'center' ? `kozep_${s}` : `zona_${ZID[z]}_${s}`); parts.push(`elem_${ZEL[z]}_${s}`); }
  const f = FORMS.find(([q, , ok]) => ok.includes(ans.a[q])); if (f) parts.push(`forma_${f[1]}_${s}`);
  return { parts, draft: ans.a.q4 === 'yes', zoned: !!(z && z !== 'unknown') };
}

const ui = (d, k) => (d && d.ui[k]) || '';
const cap = (x) => (x ? x.charAt(0).toUpperCase() + x.slice(1) : x);

export function fengView({ t, esc, pet, sub }) {
  return `<h1 class="t">${esc(t('feng.title'))}</h1><div id="fsroot" data-sub="${esc(sub || '')}"><i class="kload">${esc(t('cos.loading'))}</i></div>`;
}

export function mountFeng(root, { t, esc, lang, pet, go, savePet, render }) {
  const box = root.querySelector('#fsroot'); if (!box) return;
  const sub = box.dataset.sub;
  fsData(lang).then((d) => {
    if (!d || !root.contains(box)) return;
    const sp = pet.species === 'cat' || pet.species === 'dog' ? pet.species : '';
    const perg = (inner, cls = '') => `<div class="kscroll ${cls}"><div class="p-mid"></div><img class="p-top" src="assets/aura/perg_felso.webp" alt=""><img class="p-bot" src="assets/aura/perg_also.webp" alt=""><div class="p-in">${inner}</div></div>`;
    // faj nélkül nincs olvasás (minden szöveg fajspecifikus)
    if (!sp) {
      box.innerHTML = perg(`<h2>${esc(ui(d, 'species.question'))}</h2><div class="kspk"><button class="btn-gold" data-fsp="dog">${esc(cap(ui(d, 'species.dog')))}</button><button class="btn-gold" data-fsp="cat">${esc(cap(ui(d, 'species.cat')))}</button></div>`);
      box.querySelectorAll('[data-fsp]').forEach((b) => { b.onclick = () => { savePet({ species: b.dataset.fsp }); render(); }; });
      return;
    }
    const ans = loadAns(pet.id);
    if (sub === 'olvasas') return reading(box, d, ans, sp, { t, esc, pet, go, perg });
    // ---- kérdések ----
    const zbtn = (z) => `<button class="fsz${ans.zone === z ? ' on' : ''}${z === 'center' ? ' mid' : ''}" data-z="${z}" aria-pressed="${ans.zone === z}">${esc(cap(ui(d, 'zone.' + z)))}</button>`;
    const chips = (q) => ['yes', 'no', 'unknown'].map((v) => `<button class="fsc${ans.a[q] === v ? ' on' : ''}" data-q="${q}" data-v="${v}" aria-pressed="${ans.a[q] === v}">${esc(cap(ui(d, 'answer.' + v)))}</button>`).join('');
    box.innerHTML = perg(`<h2>${esc(ui(d, 'zone.question'))}</h2><div class="fsgrid">${ZONES.map(zbtn).join('')}</div>
      <div class="fsun">${zbtn('unknown')}</div>`) +
      perg(`${QS.map((q) => `<div class="fsq"><p>${esc(ui(d, 'form.' + q))}</p><div class="fsch">${chips(q)}</div></div>`).join('')}`) +
      `<div class="kbtn fsgo"><button class="btn-gold" id="fsread">${esc(t('fs.show'))}</button></div>`;
    box.querySelectorAll('[data-z]').forEach((b) => { b.onclick = () => { ans.zone = ans.zone === b.dataset.z ? '' : b.dataset.z; saveAns(pet.id, ans); box.querySelectorAll('[data-z]').forEach((x) => { const on = x.dataset.z === ans.zone; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); }; });
    box.querySelectorAll('[data-q]').forEach((b) => { b.onclick = () => { const q = b.dataset.q; ans.a[q] = ans.a[q] === b.dataset.v ? '' : b.dataset.v; saveAns(pet.id, ans);
      box.querySelectorAll(`[data-q="${q}"]`).forEach((x) => { const on = ans.a[q] === x.dataset.v; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); }; });
    box.querySelector('#fsread').onclick = () => go('feng/olvasas');
  });
}

function reading(box, d, ans, sp, { t, esc, pet, go, perg }) {
  const r = compose(ans, sp), name = pet.name;
  const back = `<div class="krfoot fsfoot"><button class="krbtn" data-go="feng"><span>${esc(ui(d, 'button.back_to_questions'))}</span></button></div>`;
  const draft = r.draft ? `<div class="kglass fsdraft"><h3>${esc(ui(d, 'label.env_draught'))}</h3><p>${esc(d.draft[sp])}</p></div>` : '';
  if (!r.parts.length) { box.innerHTML = perg(`<p class="kc">${esc(d.empty)}</p>`) + draft + back; return; }
  // a név csak a rögzített címhelyen, és csak az első részben jelenik meg (6. pont)
  const block = (id, i) => { const x = d.texts[id]; const title = name && i === 0 ? x.titleName.replace('{NAME}', name) : x.title;
    return perg(`<h2 class="krt">${esc(title)}</h2>${x.p.map((p) => `<p class="krp">${esc(p)}</p>`).join('')}`, 'fspart'); };
  const note = r.zoned ? `<div class="knote fsnote">${esc(t('fs.zoneNote'))}</div>` : '';
  box.innerHTML = note + r.parts.map(block).join('') + draft + back;
}
