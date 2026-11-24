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

// ---- díszítés: trigramok (a jóváhagyott táblázat szerint), Yin-Yang, Luo Shu, a háttér Bagua-nyolcszöge ----
// a trigram vonalai fentről lefelé: 1 = folytonos (yang), 0 = megszakított (yin)
const TRI = { north: [0, 1, 0], northeast: [1, 0, 0], east: [0, 0, 1], southeast: [1, 1, 0], south: [1, 0, 1], southwest: [0, 0, 0], west: [0, 1, 1], northwest: [1, 1, 1] };
const ZEL_OF_ZONE = ZEL;
function trigram(lines, x, y, w, h, fill) { // x,y: bal felső sarok
  const lh = h / 5; return lines.map((l, i) => { const yy = y + i * lh * 2; return l ? `<rect x="${x}" y="${yy}" width="${w}" height="${lh}" rx="${lh / 3}" fill="${fill}"/>` : `<rect x="${x}" y="${yy}" width="${w * .42}" height="${lh}" rx="${lh / 3}" fill="${fill}"/><rect x="${x + w * .58}" y="${yy}" width="${w * .42}" height="${lh}" rx="${lh / 3}" fill="${fill}"/>`; }).join('');
}
const yinyang = (cx, cy, r, a = '#f6d27a', b = 'none', stroke = '') => `<g>${stroke ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${stroke}" stroke-width="${r * .06}"/>` : ''}
  <path d="M${cx} ${cy - r}A${r} ${r} 0 0 1 ${cx} ${cy + r}A${r / 2} ${r / 2} 0 0 1 ${cx} ${cy}A${r / 2} ${r / 2} 0 0 0 ${cx} ${cy - r}Z" fill="${a}"/>
  <circle cx="${cx}" cy="${cy - r / 2}" r="${r / 7}" fill="${b === 'none' ? '#2a1450' : b}"/><circle cx="${cx}" cy="${cy + r / 2}" r="${r / 7}" fill="${a}"/></g>`;
const svgUrl = (svg) => `url('data:image/svg+xml,${encodeURIComponent(svg)}')`;
// halvány vízjelek a rács gombjaiba
const triMark = (z) => svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 30">${trigram(TRI[z], 6, 5, 28, 20, '#b07a26')}</svg>`);
const yyMark = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">${yinyang(20, 20, 16, '#b07a26', '#fff6dc', '#b07a26')}</svg>`);
// érmék a pergamen tetejére (ugyanaz a lila-arany érme, mint a horoszkópban)
const coin = (inner) => `<span class="zm fsm"><svg viewBox="0 0 100 100" aria-hidden="true">${inner}</svg></span>`;
const triCoin = (z) => coin(trigram(TRI[z], 26, 27, 48, 46, 'url(#au)'));
const yyCoin = () => coin(yinyang(50, 50, 30, 'url(#au)', 'none', '#f6d27a'));
const luoCoin = () => coin([0, 1, 2].map((r) => [0, 1, 2].map((c) => `<circle cx="${30 + c * 20}" cy="${30 + r * 20}" r="${r === 1 && c === 1 ? 8 : 4.5}" fill="url(#au)"/>`).join('')).join('') + '<rect x="21" y="21" width="58" height="58" rx="6" fill="none" stroke="#f6d27a" stroke-width="1.6" opacity=".6"/>');
const elemCoin = (el) => `<span class="fsem"><img src="assets/fengshui/ko_elem_${el}.webp?v=0.6.79" alt=""></span>`;
// a háttérben lassan forgó Bagua: nyolcszög, a nyolc trigram, középen Yin-Yang
function baguaBg() {
  const C = 150, R1 = 128, R2 = 98, oct = (r) => Array.from({ length: 8 }, (_, i) => { const a = (i * 45 - 22.5) * Math.PI / 180; return `${(C + r * Math.cos(a)).toFixed(1)},${(C + r * Math.sin(a)).toFixed(1)}`; }).join(' ');
  const order = ['south', 'southwest', 'west', 'northwest', 'north', 'northeast', 'east', 'southeast']; // hagyományos körsorrend
  const tris = order.map((z, i) => `<g transform="rotate(${i * 45 - 90} ${C} ${C}) translate(${C + 113} ${C}) rotate(90)">${trigram(TRI[z], -14, -10, 28, 20, '#f6d27a')}</g>`).join('');
  return `<svg class="fsbagua" viewBox="0 0 300 300" aria-hidden="true"><g class="rot"><polygon points="${oct(R1 + 16)}" fill="none" stroke="#f6d27a" stroke-width="2.4"/><polygon points="${oct(R1 + 10)}" fill="none" stroke="#f6d27a" stroke-width=".8"/><polygon points="${oct(R2)}" fill="none" stroke="#f6d27a" stroke-width="1.8"/>
   <circle cx="${C}" cy="${C}" r="70" fill="none" stroke="#f6d27a" stroke-width=".8" stroke-dasharray="1 5"/>${tris}${yinyang(C, C, 46, '#f6d27a', 'none', '#f6d27a')}</g></svg>`;
}

import { saveWithNotice, lastOf, sig } from './journal.js?v=0.6.79';
const DATA = new Map();
export const fsData = (lang) => { if (!DATA.has(lang)) DATA.set(lang, fetch(`data/fengshui/${lang}.json?v=0.6.79`).then((r) => (r.ok ? r.json() : null)).catch(() => null)); return DATA.get(lang); };

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
  // a háttér-Bagua a lap hátterébe kerül (a .bgsub mellé), így a pergamenek mellett és között, görgetéstől függetlenül látszik
  const pane = root.closest('#s-sub'); if (pane && !pane.querySelector('#fsbg')) pane.querySelector('.bgsub').insertAdjacentHTML('afterend', `<div id="fsbg" class="fsbgw">${baguaBg()}</div>`);
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
    if (sub === 'olvasas') return reading(box, d, ans, sp, { t, esc, pet, go, perg, lang });
    // ---- kérdések ----
    const zbtn = (z) => `<button class="fsz${ans.zone === z ? ' on' : ''}${z === 'center' ? ' mid' : ''}${z === 'unknown' ? ' unk' : ''}" data-z="${z}" aria-pressed="${ans.zone === z}"${TRI[z] ? ` style="--wm:${triMark(z)}"` : z === 'center' ? ` style="--wm:${yyMark}"` : ''}><i class="fstri" aria-hidden="true">${TRI[z] ? `<svg viewBox="0 0 40 30">${trigram(TRI[z], 4, 3, 32, 24, 'url(#fsg)')}</svg>` : z === 'center' ? `<svg viewBox="0 0 40 40">${yinyang(20, 20, 15, 'url(#fsg)', 'none', '#e8b552')}</svg>` : ''}</i><span>${esc(cap(ui(d, 'zone.' + z)))}</span></button>`;
    const chips = (q) => ['yes', 'no', 'unknown'].map((v) => `<button class="fsc${ans.a[q] === v ? ' on' : ''}" data-q="${q}" data-v="${v}" aria-pressed="${ans.a[q] === v}">${esc(cap(ui(d, 'answer.' + v)))}</button>`).join('');
    box.innerHTML = perg(`<h2>${esc(ui(d, 'zone.question'))}</h2>${compassHtml(t, esc, ui(d, 'zone.north').charAt(0).toUpperCase())}<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="fsg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3c8"/><stop offset=".45" stop-color="#e8b552"/><stop offset="1" stop-color="#8a5a16"/></linearGradient></defs></svg><div class="fsgrid">${ZONES.map(zbtn).join('')}</div>
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

const ORN = (pos) => `<svg class="korn ${pos}" viewBox="0 0 280 20" aria-hidden="true"><path d="M6 10Q70 9.4 140 8.4Q210 9.4 274 10Q210 10.6 140 11.6Q70 10.6 6 10Z" fill="#f6d27a" opacity=".85"/><path d="M112 10c4-6 10-6 12 0-2 4-6 4-7 1M168 10c-4-6-10-6-12 0 2 4 6 4 7 1" stroke="url(#au)" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M140 2 143.4 10 140 18 136.6 10Z" fill="url(#au)"/></svg>`;
const HANZI = { fa: '木', tuz: '火', fold: '土', fem: '金', viz: '水' };
const ZFROM = Object.fromEntries(Object.entries(ZID).map(([k, v]) => [v, k]));
const DIV = '<svg class="kdiv" viewBox="0 0 260 18" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path d="M12 9H100M160 9H248" stroke="#b07a26" stroke-width="1.2" fill="none" opacity=".8"/><path d="M100 9c4-6 10-6 12 0-2 4-6 4-7 1M160 9c-4-6-10-6-12 0 2 4 6 4 7 1" stroke="#b07a26" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M130 1.5 133 9 130 16.5 127 9Z" fill="#c08a32"/><path d="M122.5 9 130 6.5 137.5 9 130 11.5Z" fill="#d9a64a"/><circle cx="118" cy="9" r="1.4" fill="#b07a26"/><circle cx="142" cy="9" r="1.4" fill="#b07a26"/></svg>';
function reading(box, d, ans, sp, { t, esc, pet, go, perg, lang }) {
  const r = compose(ans, sp), name = pet.name;
  const back = `<div class="krfoot fsfoot">${baguaBg()}<img class="kcry l" src="assets/kezdolap/crystals.webp" alt=""><img class="kcry r" src="assets/kezdolap/crystals.webp" alt=""><button class="krbtn" data-go="feng"><span>${esc(ui(d, 'button.back_to_questions'))}</span></button></div>`;
  const draft = r.draft ? `<div class="kglass fsdraft">${ORN('t')}<h3>${esc(ui(d, 'label.env_draught'))}</h3><p>${esc(d.draft[sp])}</p>${ORN('b')}</div>` : '';
  if (!r.parts.length) { box.innerHTML = perg(`<p class="kc">${esc(d.empty)}</p>`) + draft + back; return; }
  // a név csak a rögzített címhelyen, és csak az első részben jelenik meg (6. pont)
  // érme a pergamen peremén: zóna → trigram, Közép → Luo Shu, elem → elemérme írásjellel, formaiskola → Yin-Yang
  // minden érme fényszimulációval renderelt ékszer (design/feng_shui/forras/medal_render.py)
  const img = (f) => `<span class="fsem"><img src="assets/fengshui/${f}.webp?v=0.6.79" alt=""></span>`;
  const medalFor = (id) => { const q = id.split('_'); if (q[0] === 'zona') return img('ko_zona_' + ZFROM[q[1]]); if (q[0] === 'kozep') return img('ko_kozep'); if (q[0] === 'elem') return img('ko_elem_' + q[1]); return img('ko_forma_' + q.slice(1, -1).join('_')); };
  const el = (r.parts.find((x) => x.startsWith('elem_')) || '').split('_')[1];
  const block = (id, i) => { const x = d.texts[id]; const title = name && i === 0 ? x.titleName.replace('{NAME}', name) : x.title, n = x.p.length;
    // díszvonal a harmadánál és kétharmadánál (rövidebb szövegben csak középen)
    const marks = n >= 6 ? [Math.round(n / 3), Math.round((2 * n) / 3)] : n >= 4 ? [Math.round(n / 2)] : [];
    const first = (p) => (i !== 0 ? `<p class="krp">${esc(p)}</p>` : lang === 'ja' ? `<p class="krp"><span class="kseal fsseal" aria-hidden="true"><span class="ksealt">${el ? HANZI[el] : '☯'}</span></span>${esc(p)}</p>` : `<p class="krp kdrop">${esc(p)}</p>`);
    return perg(`<span class="krsym">${medalFor(id)}</span><h2 class="krt">${esc(title)}</h2>${DIV}${x.p.map((p, k) => (marks.includes(k) ? DIV : '') + (k === 0 ? first(p) : `<p class="krp">${esc(p)}</p>`)).join('')}`, 'fspart'); };
  const note = r.zoned ? `<div class="fsnote">${ORN('t')}<p>${esc(t('fs.zoneNote').replace(/^✦\s*/, ''))}</p>${ORN('b')}</div>` : '';
  box.innerHTML = note + r.parts.map(block).join('') + draft + back;
  // Elemzéseim: az akkori olvasás tartalma (címek a névvel, teljes bekezdések, megjegyzések) – csak ha új
  if (pet.id) {
    const parts = r.parts.map((id, i) => { const x = d.texts[id]; return { id, title: name && i === 0 ? x.titleName.replace('{NAME}', name) : x.title, p: x.p }; });
    const snap = { zone: ans.zone, answers: ans.a, zoneLabel: ans.zone && ans.zone !== 'unknown' ? cap(ui(d, 'zone.' + ans.zone)) : '', parts, note: r.zoned ? t('fs.zoneNote') : '', draft: r.draft ? { title: ui(d, 'label.env_draught'), p: d.draft[sp] } : null, empty: r.parts.length ? '' : d.empty };
    const sg = sig(JSON.stringify([lang, sp, snap]));
    lastOf(pet.id, 'feng').then((last) => { if (!last || last.sig !== sg) saveWithNotice({ type: 'feng', petId: pet.id, petName: name || t('au.start.noname'), lang, ...snap, sig: sg }, t); });
  }
}

// ---- segéd-iránytű: a telefon hátlapi kamerájának iránya (ugyanaz a számítás, mint az Aura Scanner kameraképernyőjén) ----
const DIR8 = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
function compassHtml(t, esc, nl) {
  // élő luopan: a számlap (Szonja képe, hagyományos Later Heaven elrendezés, Dél felül) úgy fordul, hogy a Kan (Észak) mindig a tű piros hegye alatt legyen;
  // a tű a valódi északra mutat; a fenti arany jelző mutatja, merre néz a telefon hátlapi kamerája
  return `<div class="fscomp">
   <div class="fsdial" aria-hidden="true"><i class="fslub"></i><img class="fsplate" id="fsplate" src="assets/fengshui/szamlap.webp?v=0.6.79" alt=""><img class="fsneedle" id="fsneedle" src="assets/fengshui/tu.webp?v=0.6.79" alt=""></div>
   <div class="fsci"><b id="fsstate">${esc(t('fs.c.hint'))}</b><div class="fscb"><button class="fsbtn" id="fsstart" type="button">${esc(t('fs.c.start'))}</button><button class="fsbtn" id="fsuse" type="button" hidden></button></div></div>
   <button class="fsinfo" id="fsinfo" type="button" aria-label="${esc(t('fs.h.title'))}"><img src="assets/fengshui/pecset_i.webp?v=0.6.79" alt=""></button></div>`;
}
function helpHtml(t, esc) {
  const steps = [1, 2, 3].map((i) => `<li><span class="fsn">${i}</span><div><b>${esc(t('fs.h.' + i + 't'))}</b><p>${esc(t('fs.h.' + i))}</p></div></li>`).join('');
  return `<div class="fsmodal" id="fsmodal" role="dialog" aria-modal="true" aria-labelledby="fsmt"><div class="fsmcard kscroll"><div class="p-mid"></div><img class="p-top" src="assets/aura/perg_felso.webp" alt=""><img class="p-bot" src="assets/aura/perg_also.webp" alt="">
   <button class="zm fsx" id="fsclose" type="button" aria-label="${esc(t('fs.h.close'))}"><svg viewBox="0 0 100 100" aria-hidden="true"><path d="M34 34 66 66M66 34 34 66" stroke="url(#au)" stroke-width="9" stroke-linecap="round"/></svg></button>
   <div class="p-in"><h2 id="fsmt">${esc(t('fs.h.title'))}</h2><ol class="fssteps">${steps}</ol><p class="fstip">${esc(t('fs.h.tip'))}</p></div></div></div>`;
}
function mountCompass(box, { t, esc, zoneName, pickZone }) {
  const st = box.querySelector('#fsstate'), start = box.querySelector('#fsstart'), use = box.querySelector('#fsuse'), plate = box.querySelector('#fsplate'), needle = box.querySelector('#fsneedle'); if (!st) return;
  box.querySelector('#fsinfo').onclick = () => {
    const host = box.closest('.phone') || document.body; host.insertAdjacentHTML('beforeend', helpHtml(t, esc)); const m = host.querySelector('#fsmodal');
    const close = () => { m.remove(); removeEventListener('keydown', esc_); }, esc_ = (e) => { if (e.key === 'Escape') close(); };
    m.onclick = (e) => { if (e.target === m || e.target.closest('#fsclose')) close(); }; addEventListener('keydown', esc_); m.querySelector('#fsclose').focus();
  };
  let heading = null, shown = 0, hist = [], locked = null, got = false, raf = 0;
  const angDiff = (a, b) => ((a - b + 540) % 360) - 180;
  const camHeading = (a, b, g) => { const r = Math.PI / 180, ca = Math.cos(a * r), sa = Math.sin(a * r), sb = Math.sin(b * r), cg = Math.cos(g * r), sg = Math.sin(g * r); const E = -(ca * sg + sa * sb * cg), N = -(sa * sg - ca * sb * cg); if (Math.hypot(E, N) < .2) return null; return (Math.atan2(E, N) * 180 / Math.PI + 360) % 360; };
  const onOri = (e) => { let h = null; if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading; else if (e.absolute && e.alpha != null) h = camHeading(e.alpha, e.beta, e.gamma); if (h == null) return; got = true; heading = h; };
  const evName = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
  const tick = () => { if (!document.body.contains(box)) { removeEventListener(evName, onOri); return; }
    if (heading != null) { shown += angDiff(heading, shown) * .12; needle.style.transform = `rotate(${(-shown).toFixed(1)}deg)`; plate.style.transform = `rotate(${(180 - shown).toFixed(1)}deg)`;
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
