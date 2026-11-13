import { SUPPORTED, KB_READY, detect, loadDicts, translate, fmtPct, fmtDate } from './i18n.js?v=0.6.0';
import { searchCities, norm } from './geo.js?v=0.6.0';
import { birthProfile, todaySky, dailyKeys } from './horoscope.js?v=0.6.0';
import { analyze, chakraScores } from './analysis.js?v=0.6.0';
import { moonPhase, MOON_GLYPHS, GLYPHS, zodiac, luckyHue, hash } from './cosmos.js?v=0.6.0';
import { slot, CHAKRA_HUE, catArt, dogArt, moonSvg, elementArt, compassSvg, ring, curve } from './art.js?v=0.6.0';
import { homeHtml, navHtml, startHome, ICON } from './home.js?v=0.6.0';
const $ = (s) => document.querySelector(s);
const S = { lang: 'en', dicts: {}, tab: 'home', scan: null, stopHome: null, busy: false, cities: null, pk: '', pv: null, pet: { name: '', bday: '', btime: '', place: null, daily: true, ...JSON.parse(localStorage.getItem('pet') || '{}') } };
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
// Vissza gomb: a főmenü termeiből mindig a kezdőlapra; az alterületekről az előző logikus szintre (szülő).
const PARENT = { my: 'home', kb: 'home', styles: 'home', aura: 'home', cosmic: 'home', feng: 'home', pets: 'home', account: 'home' };
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
  const sky = todaySky(new Date());
  return `<section class="glass fade"><h3>${esc(t('h.big3'))}</h3>${row('h.sun', pf.sun, 'sun.')}${row('h.moon', pf.moon, 'moon.')}
   ${pf.asc !== null ? row('h.asc', pf.asc, 'asc.') : `<p class="sub">${esc(t('h.noAsc'))}</p>`}${pf.approx ? `<p class="note">${esc(t('h.approx'))}</p>` : ''}</section>` +
  (S.pet.daily ? `<section class="glass soft fade"><h3>${esc(t('h.daily'))}</h3><p>${dailyKeys(pf.sun, sky).map((k) => esc(t(k))).join(' ')}</p></section>` : '');
}
function kbForm(p) {
  return `<details class="more" ${p.btime || p.place ? 'open' : ''}><summary>${esc(t('h.more'))}</summary>
   <label for="pt">${esc(t('h.time'))}</label><input id="pt" type="time" value="${esc(p.btime)}">
   <label for="pp">${esc(t('h.place'))}</label>${p.place ? `<div class="chip">📍 ${esc(p.place.n)}, ${esc(p.place.cc)} <button id="pclear" aria-label="${esc(t('h.clear'))}">✕</button></div>`
     : `<input id="pp" type="text" placeholder="${esc(t('h.placeph'))}" autocomplete="off"><div id="pr"></div>`}
   <p class="note">${esc(t('h.attr'))}</p></details>
   <label class="chk"><input id="dly" type="checkbox" ${p.daily ? 'checked' : ''}> ${esc(t('h.dailyOn'))}</label>`;
}
function cosmicView() {
  const now = new Date(), p = S.pet, m = moonPhase(now), b = p.bday ? new Date(p.bday + 'T12:00:00') : null, ok = b && !isNaN(b), kb = KB_READY.includes(S.lang);
  const pf = kb && ok ? profile() : null;
  const z = ok ? (pf ? { glyph: GLYPHS[pf.sun], idx: pf.sun, element: ['fire', 'earth', 'air', 'water'][pf.sun % 4] } : zodiac(b.getMonth() + 1, b.getDate())) : null, key = now.toISOString().slice(0, 10);
  const hue = z ? luckyHue(key, z.glyph) : 260, vals = z ? Array.from({ length: 8 }, (_, i) => 35 + (hash(key + z.glyph + i) % 55)) : [];
  const form = `<section class="glass"><label for="pn">${esc(t('cos.name'))}</label><input id="pn" type="text" value="${esc(p.name)}">
   <label for="pb">${esc(t('cos.bday'))}</label><input id="pb" type="date" value="${esc(p.bday)}">${kb ? kbForm(p) : ''}</section>`;
  const scene = `<section class="glass scene slot fade" data-slot="cosmic">${z ? `<span class="sign">${z.glyph}</span>` : dogArt().replace('class="art"', 'class="art" style="width:60px;position:absolute;left:16px;top:14px;color:#ffffff55"')}${moonSvg(m.frac)}<h2>${esc(p.name || t(kb ? 'h.title' : 'cos.title'))}</h2><span class="sub">${esc(fmtDate(S.lang, now))} ${MOON_GLYPHS[m.idx]}</span></section>`;
  if (!z) return scene + `<p class="lead">${esc(t('cos.need'))}</p>` + form + note();
  return scene + (pf ? kbCards(pf) : '') + `<section class="glass soft"><div class="kv">${elementArt(z.element)}<p>${esc(t('el.' + z.element))}</p></div></section>
  <section class="glass"><h3>${esc(t('cos.energy'))}</h3>${curve(vals, hue)}</section>
  <section class="glass"><div class="kv"><span class="lucky" style="background:hsl(${hue} 80% 65%);color:hsl(${hue} 80% 65% / .6)"></span><div><b>${esc(t('cos.lucky'))}</b></div></div></section>` + form + note();
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
  const home = S.tab === 'home';
  $('#s-home').classList.toggle('on', home); $('#s-sub').classList.toggle('on', !home);
  $('#s-sub').classList.toggle('nonav', !TOP.includes(S.tab));
  if (home) {
    if (!$('#s-home').childElementCount || $('#s-home').dataset.lang !== S.lang) { if (S.stopHome) S.stopHome(); $('#s-home').innerHTML = homeHtml(t, esc); $('#s-home').dataset.lang = S.lang; S.stopHome = startHome($('#s-home')); }
    return;
  }
  const views = { aura: () => legacy(auraView()), cosmic: () => legacy(cosmicView()), feng: () => legacy(fengView()), pets: () => legacy(cosmicView()), account: accountView, my: () => sub(t('nav.my'), soon()), kb: () => sub(t('nav.kb'), soon()), styles: () => sub(t('nav.styles'), soon()) };
  $('#view').innerHTML = (views[S.tab] || views.home)(); $('#s-sub').scrollTop = 0;
  if (S.tab === 'aura' && S.scan) drawAura($('#cv'), S.scan);
}
function go(route, replace = false) {
  if (!route || route === S.tab) return; S.tab = route;
  if (replace) history.replaceState(null, '', '#' + route); else location.hash = route;
  render();
}
addEventListener('hashchange', () => { const r = location.hash.slice(1) || 'home'; if (r !== S.tab) { S.tab = r; render(); } });
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
  if (e.target.closest('#back')) { go(PARENT[S.tab] || 'home'); return; }
  const tab = e.target.closest('[data-tab]'); if (tab && tab.dataset.tab) { go(tab.dataset.tab); }
  if (e.target.id === 'scan') $('#file').click();
  const city = e.target.closest('[data-city]'); if (city) { const c = S.cities[+city.dataset.city]; S.pet = { ...S.pet, place: { n: c[0], cc: c[1], lat: c[2], lon: c[3] } }; localStorage.setItem('pet', JSON.stringify(S.pet)); render(); }
  if (e.target.id === 'pclear') { S.pet = { ...S.pet, place: null }; localStorage.setItem('pet', JSON.stringify(S.pet)); render(); }
  if (e.target.id === 'goscan') go('aura');
});
document.addEventListener('input', async (e) => {
  if (e.target.id !== 'pp') return;
  if (!S.cities) S.cities = (await (await fetch('data/cities.json?v=0.6.0')).json()).map((c) => [...c, norm(c[0])]);
  const r = searchCities(S.cities, e.target.value), box = $('#pr'); if (!box) return;
  box.innerHTML = e.target.value.trim().length < 2 ? '' : r.length ? r.map((c, i) => `<button class="city" data-city="${S.cities.indexOf(c)}">${esc(c[0])}, ${esc(c[1])}</button>`).join('') : `<p class="note">${esc(t('h.nocity'))}</p>`;
});
document.addEventListener('change', (e) => {
  if (e.target.id === 'lang') setLang(e.target.value);
  if (e.target.id === 'file' && e.target.files[0]) { scan(e.target.files[0]); e.target.value = ''; }
  const id = e.target.id, sv = (o, re = true) => { S.pet = { ...S.pet, ...o }; localStorage.setItem('pet', JSON.stringify(S.pet)); if (re) render(); };
  if (id === 'pn') sv({ name: e.target.value }, false);
  if (id === 'pb') sv({ bday: e.target.value });
  if (id === 'pt') sv({ btime: e.target.value });
  if (id === 'dly') sv({ daily: e.target.checked });
});
document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.dataset && e.target.dataset.go) go(e.target.dataset.go); });
S.tab = location.hash.slice(1) || 'home'; if (!location.hash) history.replaceState(null, '', '#home');
setLang(detect(navigator.languages, localStorage.getItem('lang')));
