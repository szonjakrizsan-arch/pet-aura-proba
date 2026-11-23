// Kedvencek: több kedvenc tárolása (localStorage 'pets' + 'activePet'), a Kedvenceim lista és az adatlap-űrlap.
import { searchCities, norm } from './geo.js?v=0.6.63';
import { fmtDate } from './i18n.js?v=0.6.63';
import { deleteByPet } from './journal.js?v=0.6.63';
import { ICON } from './home.js?v=0.6.63';
import { CORNER } from './account.js?v=0.6.63';
import { astrolabe } from './astrolabe.js?v=0.6.63';
// Szonja kérése: a Kedvenceim kártyái és az adatlap ugyanabban a díszes, aranykeretes stílusban, mint az Elemzéseim és a Fiók
const CORS = () => ['tl', 'tr', 'bl', 'br'].map((c) => `<i class="accor ${c}">${CORNER}</i>`).join('');

const KEY = 'pets', AKEY = 'activePet';
const BLANK = { id: '', name: '', species: '', bday: '', btime: '', place: null, photo: '' };
const newId = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const store = (k, v) => { try { localStorage.setItem(k, v); return true; } catch { return false; } };

// Betöltés + egyszeri átköltöztetés a régi egyetlen 'pet' bejegyzésből (a meglévő adat nem vész el).
function load() {
  let list = null; try { list = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { /* sérült adat */ }
  if (!Array.isArray(list)) {
    list = [];
    try { const old = JSON.parse(localStorage.getItem('pet') || 'null'); if (old && (old.name || old.bday || old.photo || old.species)) { const { daily, ...o } = old; list.push({ ...BLANK, ...o, id: newId() }); } } catch { /* nincs régi adat */ }
    store(KEY, JSON.stringify(list));
  }
  let active = localStorage.getItem(AKEY) || ''; if (!list.some((p) => p.id === active)) active = list[0]?.id || '';
  return { list, active };
}
export const PETS = load();
const persist = () => store(KEY, JSON.stringify(PETS.list)) && store(AKEY, PETS.active);
export const activePet = () => PETS.list.find((p) => p.id === PETS.active) || BLANK;
export function selectPet(id) { if (PETS.list.some((p) => p.id === id)) { PETS.active = id; persist(); } }
// A kiválasztott kedvenc frissítése; ha még egy sincs (pl. az Aura Szkennerben fotót tesz be), létrejön az első.
export function saveActive(o) {
  let p = PETS.list.find((x) => x.id === PETS.active);
  if (!p) { p = { ...BLANK, id: newId() }; PETS.list.push(p); PETS.active = p.id; }
  Object.assign(p, o); return persist();
}
function upsert(d) {
  const i = PETS.list.findIndex((p) => p.id === d.id), rec = { ...BLANK, ...d, id: d.id || newId() };
  if (i < 0) PETS.list.push(rec); else PETS.list[i] = rec;
  PETS.active = rec.id; return persist();
}
function remove(id) { deleteByPet(id); PETS.list = PETS.list.filter((p) => p.id !== id); if (PETS.active === id) PETS.active = PETS.list[0]?.id || ''; persist(); }

const regionName = (lang, cc) => { try { return new Intl.DisplayNames([lang], { type: 'region' }).of(cc) || cc; } catch { return cc; } };
export const placeLabel = (lang, pl) => pl ? `${pl.n}, ${regionName(lang, pl.cc)}` : '';
// fotó nélkül: faj szerinti antik kámea (ChatGPT rajza, Szonja ötletére); ha nincs megadva a faj, marad a mancs
const KAMEA = { cat: 'kamea_macska', dog: 'kamea_kutya' };
export const cameoUrl = (p) => `assets/kedvenceim/${KAMEA[p && p.species] || 'kamea_mancs'}.webp?v=0.6.63`; // faj nélkül: mancsos kámea
export const portrait = (p, cls = 'pav') => p.photo ? `<span class="${cls}" style="background-image:url(${p.photo})"></span>`
  : `<span class="${cls} cameo" style="background-image:url(${cameoUrl(p)})"></span>`;
const PENCIL = '<img src="assets/kedvenceim/toll.webp?v=0.6.63" alt="">'; // szerkesztés: aranyozott lúdtollas érme (ChatGPT, a kámeák párja)

// ---- Kedvenceim lista ----
export function listView({ t, esc, lang }) {
  const spec = (p) => (p.species ? t(p.species === 'cat' ? 'au.al.cat' : 'au.al.dog') : '');
  const born = (p) => { if (!p.bday) return ''; const d = new Date(p.bday + 'T12:00:00'); return isNaN(d) ? '' : fmtDate(lang, d); };
  const head = `<h1 class="t">${esc(t('top.pets'))}</h1>`;
  if (!PETS.list.length) return head + `<section class="acard pempty">${CORS()}<div class="pbig none">${ICON.paw}</div><p>${esc(t('pets.empty'))}</p><button class="btn-gold" data-go="pets/uj">${esc(t('pets.add'))}</button></section>${astrolabe()}`;
  const cards = PETS.list.map((p) => { const on = p.id === PETS.active, meta = [spec(p), born(p)].filter(Boolean).join(' · ');
    return `<div class="acard myrow pcard${on ? ' on' : ''}" data-pick="${p.id}" role="button" tabindex="0" aria-pressed="${on}">${CORS()}${portrait(p)}<div class="pinfo"><b>${esc(p.name || t('au.start.noname'))}</b>${meta ? `<small>${esc(meta)}</small>` : ''}${on ? `<span class="pon">✦ ${esc(t('pets.active'))}</span>` : `<span class="poff">${esc(t('pets.pick'))}</span>`}</div><button class="pedit" data-edit="${p.id}" aria-label="${esc(t('pets.edit'))}">${PENCIL}</button></div>`; }).join('');
  return head + `<p class="lead2">${esc(t('pets.lead'))}</p>${cards}<div class="pact"><button class="btn-gold" data-go="pets/uj">+ ${esc(t('pets.add'))}</button></div>${astrolabe()}`; // a forgó csillagjel az Elemzéseimből (Szonja kérése)
}

// ---- Adatlap (új vagy szerkesztés) ----
let draft = null, draftKey = null, confirmDel = false, cities = null;
export function formView({ t, esc, lang }, sub) {
  if (draftKey !== sub) { const src = sub === 'uj' ? BLANK : PETS.list.find((p) => p.id === sub); if (!src) return null; draft = { ...src }; draftKey = sub; confirmDel = false; }
  const isNew = sub === 'uj', d = draft;
  const sp = (k) => `<button class="sp${d.species === k ? ' on' : ''}" data-sp2="${k}" type="button" aria-pressed="${d.species === k}">${esc(t(k === 'cat' ? 'au.al.cat' : 'au.al.dog'))}</button>`;
  const place = d.place ? `<div class="pchip">${esc(placeLabel(lang, d.place))}<button id="pclr" type="button" aria-label="${esc(t('pets.clear'))}">✕</button></div>`
    : `<input id="pp2" type="text" placeholder="${esc(t('pets.placeph'))}" autocomplete="off" enterkeyhint="search"><div id="pr2" class="pres"></div>`;
  const del = isNew ? '' : confirmDel
    ? `<div class="panel pdel"><p>${esc(t('pets.delq', { name: d.name || t('au.start.noname') }))}</p><div class="prow"><button class="pbtn danger" id="delyes" type="button">${esc(t('pets.delyes'))}</button><button class="pbtn" id="delno" type="button">${esc(t('pets.cancel'))}</button></div></div>`
    : `<button class="plink danger" id="del" type="button">${esc(t('pets.del'))}</button>`;
  return `<h1 class="t">${esc(t(isNew ? 'pets.new' : 'pets.edit'))}</h1>
  <div class="pphoto" id="pph" role="button" tabindex="0" aria-label="${esc(t('pets.photo'))}">${portrait(d, 'pbig')}<small>${esc(t('pets.photo'))}</small></div>
  <section class="acard pform">${CORS()}
   <label for="pn2">${esc(t('cos.name'))}</label><input id="pn2" type="text" value="${esc(d.name)}" maxlength="40" autocomplete="off">
   <p class="perr" id="perr" hidden>${esc(t('pets.needname'))}</p>
   <label>${esc(t('cos.species'))}</label><div class="sprow2">${sp('dog')}${sp('cat')}</div>
   <label for="pb2">${esc(t('cos.bday'))}</label><input id="pb2" type="date" value="${esc(d.bday)}">
   <label for="pt2">${esc(t('pets.time'))}</label><input id="pt2" type="time" value="${esc(d.btime)}">
   <label for="pp2">${esc(t('pets.place'))}</label>${place}
   <p class="pattr">© GeoNames · CC BY 4.0</p>
  </section>
  <div class="prow"><button class="btn-gold" id="psave" type="button">${esc(t('pets.save'))}</button><button class="pbtn" id="pcancel" type="button">${esc(t('pets.cancel'))}</button></div>
  ${del}`;
}

const fileToData = (f, max = 512, q = 0.85) => new Promise((res, rej) => { const u = URL.createObjectURL(f), im = new Image(); im.onload = () => { const k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight)), cv = document.createElement('canvas'); cv.width = Math.round(im.naturalWidth * k); cv.height = Math.round(im.naturalHeight * k); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); URL.revokeObjectURL(u); res(cv.toDataURL('image/jpeg', q)); }; im.onerror = rej; im.src = u; });

// Események a #view-ban; a ctx.render() újrarajzol (a piszkozat megmarad).
export function mountPets(root, ctx, sub) {
  const q = (s) => root.querySelector(s), { t, esc, lang, go, back, render } = ctx;
  if (!sub) {
    root.querySelectorAll('[data-pick]').forEach((el) => { const pick = (e) => { if (e.target.closest('[data-edit]')) return; if (PETS.active !== el.dataset.pick) { selectPet(el.dataset.pick); render(); } }; el.onclick = pick; el.onkeydown = (e) => { if (e.key === 'Enter') pick(e); }; });
    root.querySelectorAll('[data-edit]').forEach((el) => { el.onclick = () => go('pets/' + el.dataset.edit); });
    return;
  }
  if (!draft) return;
  const keep = () => { const n = q('#pn2'), b = q('#pb2'), tm = q('#pt2'); if (n) draft.name = n.value.trim(); if (b) draft.bday = b.value; if (tm) draft.btime = tm.value; };
  q('#pn2').oninput = () => { draft.name = q('#pn2').value.trim(); q('#perr').hidden = true; };
  q('#pb2').onchange = keep; q('#pt2').onchange = keep;
  root.querySelectorAll('[data-sp2]').forEach((el) => { el.onclick = () => { keep(); draft.species = draft.species === el.dataset.sp2 ? '' : el.dataset.sp2; render(); }; });
  const ph = q('#pph'); ph.onclick = () => { const i = document.getElementById('file'); i.onchange = async (e) => { const f = e.target.files[0]; i.value = ''; if (!f) return; try { keep(); draft.photo = await fileToData(f); render(); } catch { /* nem kép */ } }; i.click(); };
  const clr = q('#pclr'); if (clr) clr.onclick = () => { keep(); draft.place = null; render(); setTimeout(() => q('#pp2')?.focus(), 0); };
  const pp = q('#pp2');
  if (pp) pp.oninput = async () => {
    if (!cities) cities = (await (await fetch('data/cities.json?v=0.6.63')).json()).map((c) => [...c, norm(c[0])]);
    const box = q('#pr2'); if (!box) return; const v = pp.value;
    const r = v.trim().length < 2 ? [] : searchCities(cities, v);
    box.innerHTML = v.trim().length < 2 ? '' : r.length ? r.map((c) => `<button class="pcity" type="button" data-ci="${cities.indexOf(c)}">${esc(c[0])}<small>${esc(regionName(lang, c[1]))}</small></button>`).join('') : `<p class="pnote">${esc(t('pets.nocity'))}</p>`;
    box.querySelectorAll('[data-ci]').forEach((b) => { b.onclick = () => { const c = cities[+b.dataset.ci]; keep(); draft.place = { n: c[0], cc: c[1], lat: c[2], lon: c[3] }; render(); }; });
  };
  q('#psave').onclick = () => {
    keep(); if (!draft.name) { q('#perr').hidden = false; q('#pn2').focus(); return; }
    upsert(draft); draft = null; draftKey = null; back('pets');
  };
  q('#pcancel').onclick = () => { draft = null; draftKey = null; back('pets'); };
  const del = q('#del'); if (del) del.onclick = () => { keep(); confirmDel = true; render(); setTimeout(() => q('#delyes')?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 0); };
  const no = q('#delno'); if (no) no.onclick = () => { confirmDel = false; render(); };
  const yes = q('#delyes'); if (yes) yes.onclick = () => { remove(draft.id); draft = null; draftKey = null; back('pets'); };
}
// Ha elhagyja az űrlapot (pl. a telefon vissza gombjával), a félbehagyott piszkozat elvész – ahogy a Mégse gombnál.
export function leaveForm() { draft = null; draftKey = null; confirmDel = false; }
