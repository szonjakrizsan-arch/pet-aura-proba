// Elemzéseim oldal (alcím: Pet Aura-napló): lista (#my) és egy elemzés visszanézése (#my/<id>).
// Minden bejegyzésen: dátum, elemzéstípus, a kedvenc neve; az utolsó látogatás óta készültek „Új” jelzést kapnak.
import { listEntries, getEntry, deleteEntry } from './journal.js?v=0.6.50';
import { PETS } from './pets.js?v=0.6.50';
import { glass, CORNER } from './account.js?v=0.6.50';
import { astrolabe } from './astrolabe.js?v=0.6.50';

const SEEN = 'my.seen';
const JEL = (type, cls = 'myjel') => `<img class="${cls}" src="assets/elemzeseim/jel_${type}.webp?v=0.6.50" alt="">`;
const when = (lang, ms) => new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeStyle: 'short' }).format(new Date(ms));
let filter = 'all';

export function myView({ t, esc, sub }) {
  return `<h1 class="t">${esc(t('nav.my'))}</h1><p class="mysub">${esc(t('my.sub'))}</p><div id="myroot" data-sub="${esc(sub || '')}"><i class="kload">${esc(t('cos.loading'))}</i></div>`;
}

export function mountMy(root, { t, esc, lang, go, back, render }) {
  const box = root.querySelector('#myroot'); if (!box) return () => {};
  const sub = box.dataset.sub; let seenAt = 0; try { seenAt = +localStorage.getItem(SEEN) || 0; } catch { /* nincs tárhely */ }
  if (sub) { detail(box, sub, { t, esc, lang, back, render }); return () => {}; }
  listEntries().then((all) => {
    if (!document.body.contains(box)) return;
    const pets = PETS.list; if (filter !== 'all' && !pets.some((p) => p.id === filter)) filter = 'all';
    const shown = filter === 'all' ? all : all.filter((e) => e.petId === filter);
    const chips = pets.length > 1 ? `<div class="aclangs mychips">${[['all', t('my.all')], ...pets.map((p) => [p.id, p.name || t('au.start.noname')])].map(([id, n]) => `<button class="aclang${filter === id ? ' on' : ''}" data-f="${id}" aria-pressed="${filter === id}">${filter === id ? '<span class="acstar" aria-hidden="true">✦</span>' : ''}${esc(n)}</button>`).join('')}</div>` : '';
    if (!all.length) { box.innerHTML = glass(esc(t('my.emptyt')), `<p>${esc(t('my.empty'))}</p>`, 'myempty') + astrolabe(); return; }
    box.innerHTML = chips + shown.map((e) => `<a class="acard myrow${e.date > seenAt ? ' new' : ''}" data-go="${e.type === 'aura' && e.portrait ? 'aura/naplo-' + e.id : 'my/' + e.id}" role="button" tabindex="0">${['tl', 'tr', 'bl', 'br'].map((c) => `<i class="accor ${c}">${CORNER}</i>`).join('')}
      ${JEL(e.type)}<span class="pinfo"><b>${esc(t('my.t.' + e.type))}</b><small>${esc(e.petName || '')} · ${esc(when(lang, e.date))}</small>${e.date > seenAt ? `<span class="pon">✦ ${esc(t('my.new'))}</span>` : ''}</span>
      <img class="acarrow" src="assets/fiok/nyil.webp?v=0.6.50" alt=""></a>`).join('') + astrolabe();
    const shine = (el) => { el.classList.remove('shine'); void el.offsetWidth; el.classList.add('shine'); };
    box.querySelectorAll('.aclang').forEach((b) => b.addEventListener('pointerdown', () => shine(b)));
    box.querySelectorAll('[data-f]').forEach((b) => { b.onclick = () => { filter = b.dataset.f; setTimeout(render, 300); }; }); // előbb lefut a csillanás
  });
  // a látogatás végén minden eddigi bejegyzés „látott” lesz
  return () => { try { localStorage.setItem(SEEN, String(Date.now())); } catch { /* nincs tárhely */ } };
}

function detail(box, id, { t, esc, lang, back, render }) {
  getEntry(id).then((e) => {
    if (!document.body.contains(box)) return;
    if (!e) { box.innerHTML = `<section class="acard"><p>${esc(t('my.gone'))}</p></section>`; return; }
    const head = `<div class="myhead">${JEL(e.type, 'myjel big')}<b>${esc(t('my.t.' + e.type))}</b><span>${esc(e.petName || '')} · ${esc(when(lang, e.date))}</span></div>`;
    const perg = (inner, cls = '') => `<div class="kscroll ${cls}"><div class="p-mid"></div><img class="p-top" src="assets/aura/perg_felso.webp" alt=""><img class="p-bot" src="assets/aura/perg_also.webp" alt=""><div class="p-in">${inner}</div></div>`;
    const para = (arr) => arr.map(([k, x]) => (k === 'h' ? `<h3 class="krh">${esc(x)}</h3>` : k === 'q' ? `<blockquote class="krq">${esc(x)}</blockquote>` : `<p class="krp">${esc(x)}</p>`)).join('');
    let body = '';
    if (e.type === 'aura') {
      const url = e.img ? URL.createObjectURL(e.img) : '';
      body = `${e.sample ? `<p class="mysample">${esc(t('my.sample'))}</p>` : ''}<img class="myaura" src="${url}" alt="">
        <section class="acard"><h3>${esc(t('au.res.comp'))}</h3>${(e.comp || []).map((c) => `<div class="mybar"><span><b>${esc(c.name)}</b> · ${esc(c.lab)}</span><i style="--c:${c.col};--w:${Math.round(c.w * 100)}%"></i></div>`).join('')}</section>
        ${perg(`<h2>${esc(t('au.res.msg'))}</h2><p class="krp">${esc(e.msg || '')}</p>`)}`;
    } else if (e.type === 'horo') {
      body = e.sections.map((sc) => perg(`<h2>${esc(sc.title)}</h2>${sc.items.map((it) => { const d = e.texts[it.id]; if (!d) return '';
        let n = d.n; while (n.length && n[0][1].trim() === d.title.trim()) n = n.slice(1);
        return `<details class="mydet"><summary><b>${esc(it.label)}</b>${it.pairs ? `<small>${esc(it.pairs)}</small>` : ''}<i>${esc(d.title)}</i></summary>${para(n)}${d.sig ? `<p class="krs">${esc(d.sig)}</p>` : ''}</details>`; }).join('')}`)).join('');
    } else if (e.type === 'feng') {
      body = (e.note ? `<div class="fsnote"><p>${esc(e.note.replace(/^✦\s*/, ''))}</p></div>` : '') + (e.zoneLabel ? `<p class="mysub">${esc(e.zoneLabel)}</p>` : '')
        + (e.parts.length ? e.parts.map((x) => perg(`<h2 class="krt">${esc(x.title)}</h2>${x.p.map((p) => `<p class="krp">${esc(p)}</p>`).join('')}`, 'fspart')).join('') : `<section class="acard"><p>${esc(e.empty)}</p></section>`)
        + (e.draft ? `<section class="acard"><h3>${esc(e.draft.title)}</h3><p>${esc(e.draft.p)}</p></section>` : '');
    }
    box.innerHTML = head + body + '<div class="mydelc" id="mydelbox"></div>';
    mountDelete(box.querySelector('#mydelbox'), id, { t, esc, done: () => back('my') });
  });
}
// díszes törlősáv és megerősítő ablak egy elemzéshez (az Elemzéseim részleteinél és az aura-eredményképernyőn is)
export function mountDelete(holder, id, { t, esc, done }) {
  if (!holder) return;
  const draw = (ask) => {
    holder.innerHTML = ask
      ? `<div class="mywin" role="alert">${['fb', 'fj', 'lb', 'lj'].map((c) => `<img class="mywc ${c}" src="assets/elemzeseim/ablak_sarok_${c}.webp?v=0.6.50" alt="">`).join('')}
         <img class="mywsig" src="assets/elemzeseim/ablak_jel.webp?v=0.6.50" alt=""><p class="mywq">${esc(t('my.delq'))}</p><p class="mywr">${esc(t('my.delsub'))}</p>
         <img class="mywdiv" src="assets/elemzeseim/ablak_valaszto.webp?v=0.6.50" alt="">
         <div class="acbtns"><button class="acbtn danger" id="mydelyes" type="button">${esc(t('my.delyes'))}</button><button class="acbtn" id="mydelno" type="button">${esc(t('pets.cancel'))}</button></div></div>`
      : `<button class="mydel" id="mydel" type="button"><img class="mydm" src="assets/elemzeseim/torles_kozep.webp?v=0.6.50" alt=""><img class="mydl" src="assets/elemzeseim/torles_bal.webp?v=0.6.50" alt=""><img class="mydr" src="assets/elemzeseim/torles_jobb.webp?v=0.6.50" alt=""><img class="mydt" src="assets/elemzeseim/torles_disz_fent.webp?v=0.6.50" alt=""><img class="mydb" src="assets/elemzeseim/torles_disz_lent.webp?v=0.6.50" alt=""><span>${esc(t('my.del'))}</span></button>`;
    const q = (s) => holder.querySelector(s);
    const shine = (el) => { el.classList.remove('shine'); void el.offsetWidth; el.classList.add('shine'); };
    holder.querySelectorAll('.mydel,.acbtn').forEach((b) => b.addEventListener('pointerdown', () => shine(b)));
    if (q('#mydel')) q('#mydel').onclick = () => setTimeout(() => { draw(true); setTimeout(() => q('#mydelyes')?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 60); }, 280); // előbb lefut a fénycsík
    if (q('#mydelno')) q('#mydelno').onclick = () => draw(false);
    if (q('#mydelyes')) q('#mydelyes').onclick = async () => { await deleteEntry(id); done(); };
  };
  draw(false);
}
export const leaveMy = () => {};

