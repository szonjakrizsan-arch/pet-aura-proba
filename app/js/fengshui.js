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
export const fsData = (lang) => { if (!DATA.has(lang)) DATA.set(lang, fetch(`data/fengshui/${lang}.json?v=0.6.12`).then((r) => (r.ok ? r.json() : null)).catch(() => null)); return DATA.get(lang); };

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
    box.innerHTML = perg(`<h2>${esc(ui(d, 'zone.question'))}</h2>${compassHtml(t, esc, ui(d, 'zone.north').charAt(0).toUpperCase())}<div class="fsgrid">${ZONES.map(zbtn).join('')}</div>
      <div class="fsun">${zbtn('unknown')}</div>`) +
      perg(`${QS.map((q) => `<div class="fsq"><p>${esc(ui(d, 'form.' + q))}</p><div class="fsch">${chips(q)}</div></div>`).join('')}`) +
      `<div class="kbtn fsgo"><button class="btn-gold" id="fsread">${esc(t('fs.show'))}</button></div>`;
    box.querySelectorAll('[data-z]').forEach((b) => { b.onclick = () => { ans.zone = ans.zone === b.dataset.z ? '' : b.dataset.z; saveAns(pet.id, ans); box.querySelectorAll('[data-z]').forEach((x) => { const on = x.dataset.z === ans.zone; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); }; });
    box.querySelectorAll('[data-q]').forEach((b) => { b.onclick = () => { const q = b.dataset.q; ans.a[q] = ans.a[q] === b.dataset.v ? '' : b.dataset.v; saveAns(pet.id, ans);
      box.querySelectorAll(`[data-q="${q}"]`).forEach((x) => { const on = ans.a[q] === x.dataset.v; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); }; });
    box.querySelector('#fsread').onclick = () => go('feng/olvasas');
    const pickZone = (z) => { ans.zone = z; saveAns(pet.id, ans); box.querySelectorAll('[data-z]').forEach((x) => { const on = x.dataset.z === ans.zone; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); };
    mountCompass(box, { t, esc, zoneName: (z) => cap(ui(d, 'zone.' + z)), pickZone });
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

// ---- segéd-iránytű: a telefon hátlapi kamerájának iránya (ugyanaz a számítás, mint az Aura Scanner kameraképernyőjén) ----
const DIR8 = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
const I_MEDAL = '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="25" r="8.5" fill="url(#au)"/><path d="M35 40h22v36h9v8H34v-8h9V48h-8Z" fill="url(#au)"/></svg>';
function compassHtml(t, esc, nl) {
  let ticks = ''; for (let a = 0; a < 360; a += 15) { const k = (a * Math.PI) / 180, L = a % 90 ? 5 : 9; ticks += `M${(50 + 44 * Math.sin(k)).toFixed(1)} ${(50 - 44 * Math.cos(k)).toFixed(1)}L${(50 + (44 - L) * Math.sin(k)).toFixed(1)} ${(50 - (44 - L) * Math.cos(k)).toFixed(1)}`; }
  return `<div class="fscomp">
   <div class="fsdial" aria-hidden="true"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#2a1450" stroke="url(#au)" stroke-width="3"/><g id="fsrose"><path d="${ticks}" stroke="#f3cf7a" stroke-width="1.3" stroke-linecap="round"/>
    <text x="50" y="22" text-anchor="middle" font-size="13" font-weight="700" fill="#ffe7a6" font-family="Cormorant Garamond,serif">${esc(nl)}</text></g>
    <path d="M50 16 57 52 50 47 43 52Z" fill="url(#au)"/><path d="M50 84 43 52 50 57 57 52Z" fill="#8a6fb8"/><circle cx="50" cy="50" r="4" fill="#fff3c8"/></svg></div>
   <div class="fsci"><b id="fsstate">${esc(t('fs.c.hint'))}</b><div class="fscb"><button class="fsbtn" id="fsstart" type="button">${esc(t('fs.c.start'))}</button><button class="fsbtn" id="fsuse" type="button" hidden></button></div></div>
   <button class="zm fsinfo" id="fsinfo" type="button" aria-label="${esc(t('fs.h.title'))}">${I_MEDAL}</button></div>`;
}
function helpHtml(t, esc) {
  const steps = [1, 2, 3, 4, 5].map((i) => `<li><span class="fsn">${i}</span><div><b>${esc(t('fs.h.' + i + 't'))}</b><p>${esc(t('fs.h.' + i))}</p></div></li>`).join('');
  return `<div class="fsmodal" id="fsmodal" role="dialog" aria-modal="true" aria-labelledby="fsmt"><div class="fsmcard"><button class="fsx" id="fsclose" type="button" aria-label="${esc(t('fs.h.close'))}">✕</button>
   <h2 id="fsmt">${esc(t('fs.h.title'))}</h2><ol class="fssteps">${steps}</ol><div class="knote"><b>${esc(t('fs.h.tipt'))}</b> ${esc(t('fs.h.tip'))}</div></div></div>`;
}
function mountCompass(box, { t, esc, zoneName, pickZone }) {
  const st = box.querySelector('#fsstate'), start = box.querySelector('#fsstart'), use = box.querySelector('#fsuse'), rose = box.querySelector('#fsrose'); if (!st) return;
  box.querySelector('#fsinfo').onclick = () => {
    const host = box.closest('.phone') || document.body; host.insertAdjacentHTML('beforeend', helpHtml(t, esc)); const m = host.querySelector('#fsmodal');
    const close = () => { m.remove(); removeEventListener('keydown', esc_); }, esc_ = (e) => { if (e.key === 'Escape') close(); };
    m.onclick = (e) => { if (e.target === m || e.target.id === 'fsclose') close(); }; addEventListener('keydown', esc_); m.querySelector('#fsclose').focus();
  };
  let heading = null, shown = 0, hist = [], locked = null, got = false, raf = 0;
  const angDiff = (a, b) => ((a - b + 540) % 360) - 180;
  const camHeading = (a, b, g) => { const r = Math.PI / 180, ca = Math.cos(a * r), sa = Math.sin(a * r), sb = Math.sin(b * r), cg = Math.cos(g * r), sg = Math.sin(g * r); const E = -(ca * sg + sa * sb * cg), N = -(sa * sg - ca * sb * cg); if (Math.hypot(E, N) < .2) return null; return (Math.atan2(E, N) * 180 / Math.PI + 360) % 360; };
  const onOri = (e) => { let h = null; if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading; else if (e.absolute && e.alpha != null) h = camHeading(e.alpha, e.beta, e.gamma); if (h == null) return; got = true; heading = h; };
  const evName = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
  const tick = () => { if (!document.body.contains(box)) { removeEventListener(evName, onOri); return; }
    if (heading != null) { shown += angDiff(heading, shown) * .12; rose.setAttribute('transform', `rotate(${(-shown).toFixed(1)} 50 50)`);
      const now = performance.now(); hist.push([now, heading]); hist = hist.filter((h) => now - h[0] < 1600); const spread = Math.max(...hist.map((h) => Math.abs(angDiff(h[1], heading))));
      if (!locked) { st.textContent = t('fs.c.hold'); if (hist.length > 12 && now - hist[0][0] > 1400 && spread < 7) { locked = DIR8[Math.round(heading / 45) % 8]; st.textContent = t('fs.c.locked', { dir: zoneName(locked) }) + ' ✦'; st.classList.add('ok'); use.textContent = t('fs.c.use'); use.hidden = false; } }
      else if (Math.abs(angDiff(heading, DIR8.indexOf(locked) * 45)) > 30) { locked = null; st.classList.remove('ok'); use.hidden = true; } }
    raf = requestAnimationFrame(tick); };
  start.onclick = async () => {
    // iPhone-on engedélyt kér; az eredménytől függetlenül figyelünk (ahogy az Aura Scanner is), és 3 mp után jelzünk, ha nincs adat
    if (window.DeviceOrientationEvent?.requestPermission) { try { await DeviceOrientationEvent.requestPermission(); } catch { /* nincs engedély vagy nem kell */ } }
    addEventListener(evName, onOri); start.hidden = true; st.textContent = t('fs.c.hold'); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
    setTimeout(() => { if (!got) { st.textContent = t('fs.c.none'); start.hidden = false; } }, 3000);
  };
  use.onclick = () => { if (locked) pickZone(locked); };
}
