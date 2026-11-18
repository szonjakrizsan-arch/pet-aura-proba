import { SUPPORTED, KB_READY, detect, loadDicts, translate, fmtPct, fmtDate } from './i18n.js?v=0.6.43';
import { birthProfile, todaySky, dailyKeys } from './horoscope.js?v=0.6.43';
import { analyze, chakraScores } from './analysis.js?v=0.6.43';
import { moonPhase, MOON_GLYPHS, GLYPHS, zodiac, luckyHue, hash } from './cosmos.js?v=0.6.43';
import { slot, CHAKRA_HUE, catArt, dogArt, moonSvg, elementArt, compassSvg, ring, curve } from './art.js?v=0.6.43';
import { homeHtml, navHtml, startHome, ICON } from './home.js?v=0.6.43';
import { auraScreen, FLOW } from './aura.js?v=0.6.43';
import { cosmicView as cosmicNew, mountCosmic, readerView, mountReader } from './cosmic.js?v=0.6.43';
import { fengView as fengNew, mountFeng } from './fengshui.js?v=0.6.43';
import { myView, mountMy, leaveMy } from './myview.js?v=0.6.43';
import { accountView as accountNew, mountAccount, leaveAccount, startAccountBg } from './account.js?v=0.6.43';
import { kbView, mountKb } from './kb.js?v=0.6.43';
import { PETS, activePet, saveActive, listView, formView, mountPets, leaveForm, placeLabel } from './pets.js?v=0.6.43';
const $ = (s) => document.querySelector(s);
const S = { lang: 'en', dicts: {}, tab: 'home', sub: '', scan: null, stopHome: null, stopAura: null, busy: false, pk: '', pv: null, shown: '' };
Object.defineProperty(S, 'pet', { get: activePet }); // a kiválasztott kedvenc (Kedvenceim)
const t = (k, v) => translate(S.dicts, S.lang, k, v);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function setLang(l) {
  S.lang = l; S.dicts = await loadDicts(l); localStorage.setItem('lang', l);
  document.documentElement.lang = l; render();
}
// Képernyők: home (kezdőlap) · aura / cosmic / feng (a kártyák) · pets · account · my · kb · styles (alsó menü). Az útvonal a címsor #-részében van, így az Android vissza gomb is működik.
const TOP = ['home', 'my', 'kb', 'styles'];
const langSelect = () => `<select id="lang" aria-label="${esc(t('lang.label'))}">${SUPPORTED.map((s) => `<option value="${s.code}" ${s.code === S.lang ? 'selected' : ''}>${s.label}</option>`).join('')}</select>`;
function chrome() {
  $('#nav').innerHTML = navHtml(t, esc, S.tab);
  $('#nav').hidden = !TOP.includes(S.tab);
  $('#back').innerHTML = ICON.back; $('#back').setAttribute('aria-label', t('back'));
}
// A kezdőlap mancs-gombja a kiválasztott kedvenc portréját mutatja (ha van fotója), így mindig látszik, kié az élmény.
function homePet() {
  const r = document.querySelector('#s-home [data-go="pets"]'); if (!r) return; const p = S.pet;
  let av = r.querySelector('.hpav'); const paw = r.querySelector('svg:not(.chev)');
  if (p.photo) { if (!av) { av = document.createElement('span'); av.className = 'hpav'; r.prepend(av); } av.style.backgroundImage = `url(${p.photo})`; if (paw) paw.style.display = 'none'; }
  else { if (av) av.remove(); if (paw) paw.style.display = ''; }
  const label = p.id ? `${t('top.pets')}: ${p.name || t('au.start.noname')}` : t('top.pets'); r.setAttribute('aria-label', label); r.title = label;
}
// Vissza gomb: a főmenü termeiből mindig a kezdőlapra; az alterületekről az előző logikus szintre (szülő).
const PARENT = { my: 'home', kb: 'home', styles: 'home', aura: 'home', cosmic: 'home', feng: 'home', pets: 'home', account: 'home' };
const savePet = (o) => saveActive(o);
const auraCtx = () => ({ t, esc, pet: S.pet, go, back: (r) => back(r), lang: S.lang, savePet });
const soon = () => `<div class="soon"><div class="star">✦</div><h2>${esc(t('soon.title'))}</h2><p>${esc(t('soon.body'))}</p></div>`;
const sub = (title, body, lead = '') => `<h1 class="t">${esc(title)}</h1>${lead ? `<p class="lead2">${esc(lead)}</p>` : ''}${body}`;
function accountView() {
  return sub(t('top.account'), `<div class="panel"><label for="lang">${esc(t('acc.lang'))}</label>${langSelect()}</div>
  <div class="panel"><h3>${esc(t('disc.title'))}</h3><p>${esc(t('disc.body'))}</p></div>`);
}
const legacy = (html) => `<div class="legacy">${html}</div>`;
const PAL = { red: [28, 135, 100], yellow: [200, 140, 260], green: [135, 160, 50], blue: [210, 230, 270], purple: [270, 200, 320], neutral: [135, 35, 200] };
const note = () => `<p class="note">${esc(t('disc.short'))}</p>`;
function auraView() {
  const sc = S.scan, now = new Date(), m = moonPhase(now);
  if (!sc) return `<div class="hero fade">${slot('hero', `<div class="core">${S.busy ? '<canvas id="cv" width="480" height="480"></canvas>' : catArt()}</div>`, 'core-wrap')}</div>
  <p class="lead">${esc(S.busy ? t('home.scanning') : t('home.empty'))}</p><button class="btn" id="scan">${esc(t('home.scan'))}</button>
  <div class="duo"><div class="glass" data-tab="cosmic">${moonSvg(m.frac)}<small>${esc(t('home.today'))}</small><b>${MOON_GLYPHS[m.idx]}</b></div>
  <div class="glass" data-tab="feng">${compassSvg(160, false)}<small>${esc(t('feng.title'))}</small></div></div>${note()}`;
  const best = sc.scores.indexOf(Math.max(...sc.scores)), name = S.pet.name;
  return `<div class="res fade" style="--glow:hsl(${CHAKRA_HUE[best]} 90% 60% / .45)"><canvas id="cv" width="480" height="480"></canvas>
  <div class="cap"><strong>${esc(name)}</strong><span class="chip">${esc(t('chakra.' + (best + 1)))} ${fmtPct(S.lang, sc.scores[best])}</span></div></div>
  <button class="btn" id="scan">${esc(t('home.again'))}</button>
  <section class="glass soft"><h3>${esc(t('res.spirit'))}</h3><div class="orbs">${sc.scores.map((v, i) => `<div>${ring(v, CHAKRA_HUE[i], v)}<div class="orb"><span>${esc(t('chakra.' + (i + 1)))}</span></div></div>`).join('')}</div></section>
  <section class="glass"><h3>${esc(t('res.observed'))}</h3><div class="stats">
   <div class="stat"><b>${fmtPct(S.lang, sc.obs.brightness)}</b><small class="sub">${esc(t('res.bright'))}</small></div>
   <div class="stat"><b>${fmtPct(S.lang, sc.obs.contrast)}</b><small class="sub">${esc(t('res.contrast'))}</small></div>
   <div class="stat"><i style="background:rgb(${sc.obs.bgRgb})"></i><small class="sub">${esc(t('res.bg'))}: ${esc(t('hue.' + sc.obs.bgHue))}</small></div></div></section>${note()}`;
}
function profile() {
  const p = S.pet; if (!p.bday) return null;
  const k = [p.bday, p.btime, p.place && p.place.lat + ',' + p.place.lon].join('|');
  if (S.pk !== k) { try { S.pv = birthProfile(p); } catch { S.pv = null; } S.pk = k; }
  return S.pv;
}
function kbCards(pf) {
  const row = (lab, i, key) => `<div class="kv big3"><span class="sg">${GLYPHS[i]}</span><div><small class="sub">${esc(t(lab))}</small><b>${esc(t('sign.' + i))}</b><p>${esc(t(key + i))}</p></div></div>`;
  // A napi (és később heti) horoszkóp szünetel, amíg az ingyenes/fizetős rend el nem dől – a motor (dailyKeys) megmarad.
  return `<section class="glass fade"><h3>${esc(t('h.big3'))}</h3>${row('h.sun', pf.sun, 'sun.')}${row('h.moon', pf.moon, 'moon.')}
   ${pf.asc !== null ? row('h.asc', pf.asc, 'asc.') : `<p class="sub">${esc(t('h.noAsc'))}</p>`}${pf.approx ? `<p class="note">${esc(t('h.approx'))}</p>` : ''}</section>`;
}
function cosmicView() {
  const now = new Date(), p = S.pet, m = moonPhase(now), b = p.bday ? new Date(p.bday + 'T12:00:00') : null, ok = b && !isNaN(b), kb = KB_READY.includes(S.lang);
  const pf = kb && ok ? profile() : null;
  const z = ok ? (pf ? { glyph: GLYPHS[pf.sun], idx: pf.sun, element: ['fire', 'earth', 'air', 'water'][pf.sun % 4] } : zodiac(b.getMonth() + 1, b.getDate())) : null, key = now.toISOString().slice(0, 10);
  const hue = z ? luckyHue(key, z.glyph) : 260, vals = z ? Array.from({ length: 8 }, (_, i) => 35 + (hash(key + z.glyph + i) % 55)) : [];
  // Az adatok a Kedvenceim adatlapon vannak; itt csak a kiválasztott kedvenc látszik, váltás és szerkesztés gombbal.
  const pv = p.id ? `<span class="cpav${p.photo ? '' : ' none'}"${p.photo ? ` style="background-image:url(${p.photo})"` : ''}>${p.photo ? '' : ICON.paw}</span>` : '';
  const meta = [p.bday && ok ? fmtDate(S.lang, b) : '', placeLabel(S.lang, p.place)].filter(Boolean).join(' · ');
  const form = p.id ? `<section class="glass cpet">${pv}<div><b>${esc(p.name || t('au.start.noname'))}</b>${meta ? `<small class="sub">${esc(meta)}</small>` : ''}
   <div class="cbtns"><button class="cbtn" data-go="pets/${p.id}">${esc(t('pets.edit'))}</button>${PETS.list.length > 1 ? `<button class="cbtn" data-go="pets">${esc(t('pets.change'))}</button>` : ''}</div></div></section>`
    : `<section class="glass cpet"><div><p>${esc(t('pets.empty'))}</p><div class="cbtns"><button class="cbtn" data-go="pets/uj">${esc(t('pets.add'))}</button></div></div></section>`;
  const scene = `<section class="glass scene slot fade" data-slot="cosmic">${z ? `<span class="sign">${z.glyph}</span>` : dogArt().replace('class="art"', 'class="art" style="width:60px;position:absolute;left:16px;top:14px;color:#ffffff55"')}${moonSvg(m.frac)}<h2>${esc(p.name || t(kb ? 'h.title' : 'cos.title'))}</h2><span class="sub">${esc(fmtDate(S.lang, now))} ${MOON_GLYPHS[m.idx]}</span></section>`;
  if (!z) return scene + form + (p.id ? `<p class="lead">${esc(t('cos.need'))}</p>` : '') + note();
  return scene + form + (pf ? kbCards(pf) : '') + `<section class="glass soft"><div class="kv">${elementArt(z.element)}<p>${esc(t('el.' + z.element))}</p></div></section>
  <section class="glass"><h3>${esc(t('cos.energy'))}</h3>${curve(vals, hue)}</section>
  <section class="glass"><div class="kv"><span class="lucky" style="background:hsl(${hue} 80% 65%);color:hsl(${hue} 80% 65% / .6)"></span><div><b>${esc(t('cos.lucky'))}</b></div></div></section>` + note();
}
function fengView() {
  const sc = S.scan, hn = sc?.obs.bgHue, pal = PAL[hn];
  const hero = `<section class="glass scene slot fade" data-slot="feng">${compassSvg(pal ? pal[1] : 160, !!sc)}<h2>${esc(t('feng.title'))}</h2><span class="sub">${esc(t('feng.north'))}</span></section>`;
  if (!sc) return hero + `<p class="lead">${esc(t('feng.need'))}</p><button class="btn" id="goscan">${esc(t('feng.go'))}</button>` + note();
  return hero + `<section class="glass soft"><p>${esc(t('tip.' + hn))}</p></section>
  <section class="glass"><h3>${esc(t('feng.palette'))}</h3><div class="pal">${pal.map((h) => `<i style="background:hsl(${h} ${hn === 'neutral' ? 30 : 55}% 55%)"></i>`).join('')}</div></section>` + note();
}
function render() {
  chrome();
  const home = S.tab === 'home', aura = S.tab === 'aura';
  $('#s-home').classList.toggle('on', home); $('#s-sub').classList.toggle('on', !home && !aura); $('#s-aura').classList.toggle('on', aura);
  if (S.stopAura) { S.stopAura(); S.stopAura = null; $('#s-aura').innerHTML = ''; }
  if (S.tab !== 'cosmic' && S.stopCosmic) { S.stopCosmic(); S.stopCosmic = null; }
  if (aura) { const scr = auraScreen(S.sub, auraCtx()); if (!scr) return; $('#s-aura').innerHTML = scr.html; S.stopAura = scr.mount($('#s-aura')); return; }
  $('#s-sub').classList.toggle('nonav', !TOP.includes(S.tab));
  if (!(S.tab === 'pets' && S.sub)) leaveForm();
  if (S.stopAccBg && S.accBgKind !== S.tab) { S.stopAccBg(); S.stopAccBg = null; } // Fiók és Elemzéseim: mindkettőnek saját élő háttere van
  if (S.stopMy && !(S.tab === 'my' && !S.sub)) { S.stopMy(); S.stopMy = null; } if (S.tab !== 'my') leaveMy();
  // A kezdőlap animációi csak akkor futnak, amikor a kezdőlap látszik (különben a rejtett vásznak is terhelnék a telefont, és akadna a görgetés).
  if (!home && S.stopHome) { S.stopHome(); S.stopHome = null; }
  if (home) {
    if (!$('#s-home').childElementCount || $('#s-home').dataset.lang !== S.lang) { if (S.stopHome) { S.stopHome(); S.stopHome = null; } $('#s-home').innerHTML = homeHtml(t, esc); $('#s-home').dataset.lang = S.lang; }
    if (!S.stopHome) S.stopHome = startHome($('#s-home'));
    homePet(); S.shown = 'home';
    return;
  }
  const views = { 'regi-aura': () => legacy(auraView()), cosmic: () => `<div class="km" data-more="${esc(t('cos.read'))}">${S.sub ? readerView({ t, esc, id: S.sub }) : cosmicNew({ t, esc, lang: S.lang, pet: S.pet, multi: PETS.list.length > 1 })}</div>`, 'regi-kozmikus': () => legacy(cosmicView()), feng: () => `<div class="km">${fengNew({ t, esc, pet: S.pet, sub: S.sub })}</div>`, 'regi-feng': () => legacy(fengView()), pets: () => (S.sub ? formView({ t, esc, lang: S.lang }, S.sub) : listView({ t, esc, lang: S.lang })), account: () => `<div class="km">${accountNew({ t, esc, lang: S.lang })}</div>`, 'regi-fiok': accountView, my: () => `<div class="km">${myView({ t, esc, sub: S.sub })}</div>`, kb: () => `<div class="km">${kbView({ t, esc, sub: S.sub })}</div>`, styles: () => sub(t('nav.styles'), soon()) };
  const html = (views[S.tab] || views.home)(); if (html == null) { back('pets'); return; }
  $('#view').innerHTML = html;
  const route = curRoute(); if (S.shown !== route) { const sc = $('#s-sub'); SCROLL[S.shown] = sc.scrollTop; const y = SCROLL[route] || 0; sc.scrollTop = y; if (y) setTimeout(() => { if (curRoute() === route) sc.scrollTop = y; }, 250); S.shown = route; } // ugyanazon az oldalon (pl. faj választása) nem ugrik a tetejére
  if (S.stopCosmic) { S.stopCosmic(); S.stopCosmic = null; }
  if (S.tab === 'cosmic' && S.sub) mountReader($('#view'), S.lang, S.sub, esc);
  else if (S.tab === 'cosmic') S.stopCosmic = mountCosmic($('#view'), S.lang, esc, { pet: S.pet, t });
  if (S.tab !== 'feng') document.getElementById('fsbg')?.remove();
  if (S.tab === 'account') { mountAccount($('#view'), { setLang, render }); if (!S.stopAccBg) { S.stopAccBg = startAccountBg($('#s-sub')); S.accBgKind = 'account'; } }
  else leaveAccount();
  if (S.stopKb) { S.stopKb(); S.stopKb = null; }
  if (S.tab === 'kb') { S.stopKb = mountKb($('#view'), { t, esc, lang: S.lang, sub: S.sub, go, setRoute }); if (!S.stopAccBg) { S.stopAccBg = startAccountBg($('#s-sub')); S.accBgKind = 'kb'; } }
  if (S.tab === 'my') { if (S.stopMy) S.stopMy(); S.stopMy = mountMy($('#view'), { t, esc, lang: S.lang, go, back, render }); if (!S.stopAccBg) { S.stopAccBg = startAccountBg($('#s-sub'), { colors: true }); S.accBgKind = 'my'; } }
  if (S.tab === 'feng') mountFeng($('#view'), { t, esc, lang: S.lang, pet: S.pet, go, savePet, render });
  if (S.tab === 'pets' && !S.stopAccBg) { S.stopAccBg = startAccountBg($('#s-sub')); S.accBgKind = 'pets'; } // élő fénypor-háttér, mint a Fiókban
  if (S.tab === 'pets') mountPets($('#view'), { t, esc, lang: S.lang, go, back, render }, S.sub);
  if (S.tab === 'regi-aura' && S.scan) drawAura($('#cv'), S.scan);
}
// Navigáció: saját útvonal-verem, hogy a vissza gomb (arany medál) és a telefon vissza gombja ugyanoda vigyen.
const STACK = [], SCROLL = {}; // SCROLL: oldalankénti görgetési helyzet (az olvasóból visszatérve ugyanott folytatódik)
function go(route, replace = false) {
  const [tab, sub = ''] = route.split('/'); if (!route || (tab === S.tab && sub === S.sub)) return; S.tab = tab; S.sub = sub;
  if (replace) { history.replaceState(null, '', '#' + route); STACK[STACK.length - 1] = route; } else { history.pushState(null, '', '#' + route); STACK.push(route); }
  render();
}
// Kedvenceim: oda tér vissza, ahonnan jött (pl. az aura-indító névcsere-gombjáról vagy a Kozmikus Mancsból); az adatlapról a listára.
function petsBack() {
  if (S.tab === 'kb' && S.sub) { const m = KB_TOPIC.exec(S.sub); return m ? 'kb/' + m[1] : 'kb'; } // Tudástár: témaoldal → fejezet tartalomjegyzéke → címlap
  if ((S.tab === 'cosmic' || S.tab === 'feng' || S.tab === 'my') && S.sub) return S.tab;
  if (S.tab !== 'pets') return PARENT[S.tab] || 'home';
  if (S.sub) return S.tab;
  const prev = STACK[STACK.length - 2]; return prev && !prev.startsWith('pets') ? prev : 'home';
}
// Vissza egy logikai szülőre: ha az előző lépés éppen az, valódi „vissza” (a telefon gombjával egyezően); különben odaugrik.
function back(target) { if (STACK.length > 1 && STACK[STACK.length - 2] === target) { history.back(); return; } go(target, true); }
// Tudástár: a lapozás nem rajzol újra, csak a címsort írja át. A címlap mindig külön előzménylépés alatta marad, így a
// vissza (medál és telefon) szintenként lép: témaoldal → a fejezet tartalomjegyzéke → címlap → Kezdőlap (Szonja kérése).
const KB_TOPIC = /^([hf])-\d+$/;
function setRoute(route) {
  const [tab, sub = ''] = route.split('/'), top = STACK[STACK.length - 1];
  S.tab = tab; S.sub = sub; S.shown = route;
  if (route === 'kb' && STACK[STACK.length - 2] === 'kb') { S.kbQuiet = true; history.back(); return; } // vissza a címlap-bejegyzésre
  if (top === 'kb' && route !== 'kb') { history.pushState(null, '', '#' + route); STACK.push(route); return; }
  history.replaceState(null, '', '#' + route); STACK[STACK.length - 1] = route;
}
const curRoute = () => S.tab + (S.sub ? '/' + S.sub : '');
addEventListener('popstate', () => { const r = location.hash.slice(1) || 'home', [tab, sub = ''] = r.split('/');
  if (STACK.length > 1 && STACK[STACK.length - 2] === r) STACK.pop(); else STACK.push(r);
  if (S.kbQuiet) { S.kbQuiet = false; return; } // a könyv már maga lapozott a címlapra
  const m = S.tab === 'kb' && KB_TOPIC.exec(S.sub); // témaoldalról a telefon vissza gombja a fejezet tartalomjegyzékére visz
  if (m && r === 'kb') { history.pushState(null, '', '#kb/' + m[1]); STACK.push('kb/' + m[1]); S.sub = m[1]; render(); return; }
  if (tab !== S.tab || sub !== S.sub) { S.tab = tab; S.sub = sub; render(); } });
function drawAura(cv, sc, scanY = null) {
  const g = cv.getContext('2d'), W = cv.width; g.clearRect(0, 0, W, W);
  const r = Math.max(W / sc.img.width, W / sc.img.height), w = sc.img.width * r, h = sc.img.height * r;
  g.drawImage(sc.img, (W - w) / 2, (W - h) / 2, w, h);
  const top = sc.scores.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).slice(0, 3).map(([, i]) => CHAKRA_HUE[i]);
  const gr = g.createRadialGradient(W / 2, W / 2, W * 0.28, W / 2, W / 2, W * 0.72);
  gr.addColorStop(0, 'transparent'); gr.addColorStop(0.6, `hsla(${top[0]} 90% 65% / .45)`); gr.addColorStop(0.85, `hsla(${top[1]} 90% 65% / .55)`); gr.addColorStop(1, `hsla(${top[2]} 90% 70% / .7)`);
  g.fillStyle = gr; g.fillRect(0, 0, W, W);
  if (scanY !== null) { g.fillStyle = 'rgba(127,240,207,.85)'; g.fillRect(0, scanY, W, 4); }
}
function readImage(file) {
  return new Promise((res, rej) => { const u = URL.createObjectURL(file), img = new Image(); img.onload = () => res(img); img.onerror = () => rej(new Error('img')); img.src = u; });
}
async function scan(file) {
  try {
    S.busy = true; render(); const hv = $('#cv'); if (hv) { const g = hv.getContext('2d'); g.fillStyle = '#7ff0cf33'; g.fillRect(0, 0, 480, 480); }
    const img = await readImage(file), c = document.createElement('canvas'); c.width = c.height = 64;
    c.getContext('2d').drawImage(img, 0, 0, 64, 64);
    const obs = analyze(c.getContext('2d').getImageData(0, 0, 64, 64).data, 64, 64);
    const scores = chakraScores(obs, S.pet.name || 'pet', moonPhase(new Date()).frac);
    S.scan = { img, obs, scores }; S.busy = false; render();
    const cv = $('#cv'); for (let y = 0; y <= 480; y += 24) { drawAura(cv, S.scan, y); await new Promise((r) => setTimeout(r, 16)); } drawAura(cv, S.scan);
  } catch { S.busy = false; render(); alert(t('err.img')); }
}
document.addEventListener('click', (e) => {
  const g = e.target.closest('[data-go]'); if (g) { go(g.dataset.go); return; }
  const ksp = e.target.closest('[data-ksp]'); if (ksp) { savePet({ species: ksp.dataset.ksp }); render(); return; }
  if (e.target.closest('#s-sub #back')) { back(petsBack()); return; }
  const tab = e.target.closest('[data-tab]'); if (tab && tab.dataset.tab) { go(tab.dataset.tab); }
  if (e.target.id === 'scan') $('#file').click();
  if (e.target.id === 'goscan') go('regi-aura');
});
document.addEventListener('change', (e) => {
  if (e.target.id === 'lang') setLang(e.target.value);
  if (e.target.id === 'file' && e.target.files[0]) { scan(e.target.files[0]); e.target.value = ''; }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.dataset && e.target.dataset.go) go(e.target.dataset.go); });
{ const [tab, sub = ''] = (location.hash.slice(1) || 'home').split('/'); S.tab = tab; S.sub = sub; } if (!location.hash) history.replaceState(null, '', '#home'); STACK.push(curRoute());
// Indulás: a takarás csak akkor tűnik el, amikor a kezdőlap minden képe és a betűk betöltöttek – így nem rétegenként jelenik meg.
const imgReady = (src) => new Promise((r) => { const i = new Image(); i.onload = i.onerror = r; i.src = src; });
const boot = () => { const b = $('#boot'); if (!b || b.classList.contains('out')) return; b.classList.add('out'); setTimeout(() => b.remove(), 700); };
setLang(detect(navigator.languages, localStorage.getItem('lang'))).then(() => {
  const imgs = [...document.querySelectorAll('#s-home img, #s-aura img')].map((i) => i.src);
  ['bg.webp', 'frame2.webp', 'scene_aura.webp', 'scene_horo.webp', 'scene_feng.webp'].forEach((f) => imgs.push('assets/kezdolap/' + f));
  // A takarás csak a kezdőlap képeire és a betűkre vár; az aloldalak képei a megjelenés után, a háttérben töltődnek.
  const later = () => ['assets/ui/hatter_aura.webp', 'assets/ui/arany_medal.webp', 'assets/aura/portrekeret.webp', 'assets/aura/perg_felso.webp', 'assets/aura/perg_kozep.webp', 'assets/aura/perg_also.webp'].forEach(imgReady);
  Promise.all([...imgs.map(imgReady), document.fonts ? document.fonts.ready : null]).then(() => requestAnimationFrame(() => requestAnimationFrame(() => { boot(); setTimeout(later, 300); })));
  setTimeout(boot, 5000);
});
