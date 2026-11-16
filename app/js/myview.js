// Elemzéseim oldal (alcím: Pet Aura-napló): lista (#my) és egy elemzés visszanézése (#my/<id>).
// Minden bejegyzésen: dátum, elemzéstípus, a kedvenc neve; az utolsó látogatás óta készültek „Új” jelzést kapnak.
import { listEntries, getEntry, deleteEntry } from './journal.js?v=0.6.24';
import { PETS } from './pets.js?v=0.6.24';

const SEEN = 'my.seen';
const ORN = (pos) => `<svg class="korn ${pos}" viewBox="0 0 280 20" aria-hidden="true"><path d="M6 10Q70 9.4 140 8.4Q210 9.4 274 10Q210 10.6 140 11.6Q70 10.6 6 10Z" fill="#f6d27a" opacity=".85"/><path d="M112 10c4-6 10-6 12 0-2 4-6 4-7 1M168 10c-4-6-10-6-12 0 2 4 6 4 7 1" stroke="url(#au)" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M140 2 143.4 10 140 18 136.6 10Z" fill="url(#au)"/></svg>`;
const ICO = {
  aura: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="url(#au)" stroke-width="1.6"/><circle cx="12" cy="12" r="5" fill="none" stroke="url(#au)" stroke-width="1.2" opacity=".7"/><g fill="url(#au)"><ellipse cx="12" cy="13.6" rx="2.4" ry="2"/><circle cx="9.3" cy="11" r=".95"/><circle cx="11" cy="9.6" r=".95"/><circle cx="13" cy="9.6" r=".95"/><circle cx="14.7" cy="11" r=".95"/></g></svg>',
  horo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 4.2a8 8 0 1 0 4.3 12.2 6.4 6.4 0 1 1-4.3-12.2Z" fill="url(#au)"/><path d="M17 3l.7 1.8 1.8.7-1.8.7L17 8l-.7-1.8-1.8-.7 1.8-.7Z" fill="url(#au)"/></svg>',
  feng: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5 18.7 5.3 21.5 12 18.7 18.7 12 21.5 5.3 18.7 2.5 12 5.3 5.3Z" fill="none" stroke="url(#au)" stroke-width="1.4"/><path d="M12 7a5 5 0 0 1 0 10 2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 0 0-5Z" fill="url(#au)"/><circle cx="12" cy="7" r="5" fill="none" stroke="url(#au)" stroke-width="0" /><circle cx="12" cy="12" r="5" fill="none" stroke="url(#au)" stroke-width="1"/></svg>',
};
const when = (lang, ms) => new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeStyle: 'short' }).format(new Date(ms));
let filter = 'all', confirmDel = false;

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
    if (!all.length) { box.innerHTML = `<section class="acard myempty"><h3>${esc(t('my.emptyt'))}</h3><p>${esc(t('my.empty'))}</p></section>`; return; }
    box.innerHTML = chips + shown.map((e) => `<a class="acard myrow${e.date > seenAt ? ' new' : ''}" data-go="my/${e.id}" role="button" tabindex="0">
      <span class="zm myico">${ICO[e.type] || ''}</span><span class="myl"><b>${esc(t('my.t.' + e.type))}</b><span class="mymeta">${esc(e.petName || '')} · ${esc(when(lang, e.date))}</span></span>
      ${e.date > seenAt ? `<span class="mynew">${esc(t('my.new'))}</span>` : ''}<img class="acarrow" src="assets/fiok/nyil.webp?v=0.6.24" alt=""></a>`).join('');
    box.querySelectorAll('[data-f]').forEach((b) => { b.onclick = () => { filter = b.dataset.f; render(); }; });
  });
  // a látogatás végén minden eddigi bejegyzés „látott” lesz
  return () => { try { localStorage.setItem(SEEN, String(Date.now())); } catch { /* nincs tárhely */ } };
}

function detail(box, id, { t, esc, lang, back, render }) {
  getEntry(id).then((e) => {
    if (!document.body.contains(box)) return;
    if (!e) { box.innerHTML = `<section class="acard"><p>${esc(t('my.gone'))}</p></section>`; return; }
    const head = `<div class="myhead"><span class="zm myico big">${ICO[e.type] || ''}</span><b>${esc(t('my.t.' + e.type))}</b><span>${esc(e.petName || '')} · ${esc(when(lang, e.date))}</span></div>`;
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
    const del = confirmDel
      ? `<div class="acwarnp" role="alert"><p class="acwq">${esc(t('my.delq'))}</p></div><div class="acbtns"><button class="acbtn danger" id="mydelyes" type="button">${esc(t('my.delyes'))}</button><button class="acbtn" id="mydelno" type="button">${esc(t('pets.cancel'))}</button></div>`
      : `<button class="plink danger" id="mydel" type="button">${esc(t('my.del'))}</button>`;
    box.innerHTML = head + body + `<section class="acard mydelc">${del}</section>`;
    const q = (s) => box.querySelector(s);
    if (q('#mydel')) q('#mydel').onclick = () => { confirmDel = true; render(); };
    if (q('#mydelno')) q('#mydelno').onclick = () => { confirmDel = false; render(); };
    if (q('#mydelyes')) q('#mydelyes').onclick = async () => { await deleteEntry(id); confirmDel = false; back('my'); };
  });
}
export const leaveMy = () => { confirmDel = false; };
