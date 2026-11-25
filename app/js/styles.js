// Varázsműhely (Stílusok, 4. funkció): a stílusok galériája a mintaképekkel (Szonja gyűjtése, 2026-11-18/19).
// A stílus oldalán a gazdi saját fotójából kép készül (2026-11-24, Szonja: a próbaoldal helyett az igazi oldalra bekötve, minden választási
// lehetőség nélkül – egy modell, egy utasítás). Az AI-utasítások nem kerülnek az appba (üzleti titok, csak a szerverfüggvényben vannak).
// AMÍG NINCS FIZETÉS ÉS NAPI KERET: a képkészítő rész csak azon a telefonon látszik, ahol a fejlesztői jelszó el van mentve
// (localStorage 'pa.devpass'), mert a szerver jelszó nélkül nem dolgozik – így más nem tudja a krediteket elhasználni. Máshol nincs semmi
// (Szonja: nincs „hamarosan”-szöveg). VÍZJEL: még nincs a kész képen (vm.h.3 ígéri) – a Tarot ✦ XIX ✦ feliratával együtt épül be.
import { CORNER } from './account.js?v=0.6.86';
import { SUPABASE_URL, SUPABASE_KEY, session } from './auth.js?v=0.6.86';
import { activePet } from './pets.js?v=0.6.86';

const V = '0.6.86';
const SEASON = { karacsony: (d) => (d.getMonth() === 11) || (d.getMonth() === 0 && d.getDate() <= 6) }; // dec. 1. – jan. 6. (Szonja döntése)
// Minden stílusnak cicás és kutyás mintaképe van (Szonja kérése: a cicás gazdi ne higgye, hogy csak kutyáknak szól).
// A kedvenc faja dönt; ha nincs kedvenc / faj, a galériában felváltva látszanak (sakktáblaszerűen).
const FILE = { boszi: 'boszi' };
const cache = {};
const load = (lang) => (cache[lang] ||= fetch(`data/stilusok/${lang}.json?v=${V}`).then((r) => r.json()).catch(() => null));
const corners = () => ['tl', 'tr', 'bl', 'br'].map((c) => `<i class="accor ${c}">${CORNER}</i>`).join('');
// a karácsonyi stílus csak az ünnepi időszakban látszik; teszteléshez a címsorban ?unnep kapcsolja be
const inSeason = (id) => !SEASON[id] || SEASON[id](new Date()) || /[?&]unnep/.test(location.search);
const devPass = () => { try { return localStorage.getItem('pa.devpass') || ''; } catch { return ''; } };

// a fotó kicsinyítése a telefonon (leghosszabb oldal 1024 px, JPEG) – kisebb feltöltés, gyorsabb válasz
async function shrink(file) {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, 1024 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.9);
}

export function stylesView({ t, esc }) {
  return `<h1 class="t vmhd">${esc(t('nav.styles'))}</h1><div id="vmroot" class="vm"><i class="kload">${esc(t('cos.loading'))}</i></div>`;
}

export function mountStyles(view, { t, esc, lang, sub, go }) {
  const root = view.querySelector('#vmroot'); if (!root) return () => {};
  let alive = true;
  const sp = (activePet() || {}).species;
  const animal = (i) => (sp === 'dog' ? 'kutya' : sp === 'cat' ? 'macska' : ((i + Math.floor(i / 2)) % 2 ? 'kutya' : 'macska')) // sakktábla: két oszlopban is váltakozik;
  const img = (id, small, a) => `assets/stilusok/${FILE[id] || id}_${a}${small ? '_kicsi' : ''}.webp?v=${V}`;
  load(lang).then((d) => {
    if (!alive || !d) return;
    const list = d.styles.filter((s) => inSeason(s.id));
    const one = sub && list.find((s) => s.id === sub);
    if (one) {
      const a0 = sp === 'dog' ? 'kutya' : 'macska';
      const pair = `<div class="vmpair">${[['cat', 'macska'], ['dog', 'kutya']].map(([x, a]) => `<button class="vmsp${a === a0 ? ' on' : ''}" data-a="${a}">${esc(t('au.al.' + x))}</button>`).join('')}</div>`;
      root.innerHTML = `<section class="acard vmone">${corners()}${SEASON[one.id] ? `<span class="vmseason">${esc(d.ui.season)}</span>` : ''}
        <img class="vmbig" src="${img(one.id, false, a0)}" alt="${esc(one.name)}">${pair}
        <h2>${esc(one.name)}</h2><p>${esc(one.desc)}</p><p class="vmsample">${esc(d.ui.sample)}</p></section>${devPass() ? makeView(t, esc) : ''}`;
      let species = sp === 'dog' ? 'dog' : 'cat';
      root.querySelectorAll('[data-a]').forEach((b) => { b.onclick = () => {
        root.querySelectorAll('[data-a]').forEach((x) => x.classList.toggle('on', x === b));
        species = b.dataset.a === 'kutya' ? 'dog' : 'cat';
        root.querySelector('.vmbig').src = img(one.id, false, b.dataset.a); }; });
      if (devPass()) mountMake(root, t, one.id, one.name, () => species, () => alive);
      return;
    }
    root.innerHTML = `<div class="vmtop"><p class="vmintro">${esc(d.ui.intro)}</p><button class="fsinfo vminfo" id="vminfo" type="button" aria-label="${esc(t('vm.h.aria'))}"><img src="assets/fengshui/pecset_i.webp?v=${V}" alt=""></button></div><div class="vmgrid">${list.map((s, i) => `<button class="acard vmcard${SEASON[s.id] ? ' season' : ''}" data-go="styles/${s.id}">${corners()}
      <span class="vmimg"><img src="${img(s.id, true, animal(i))}" alt="" loading="lazy"></span>${SEASON[s.id] ? `<span class="vmseason">${esc(d.ui.season)}</span>` : ''}<b>${esc(s.name)}</b></button>`).join('')}</div>`;
    root.querySelector('#vminfo').onclick = () => help(root, t, esc);
  });
  return () => { alive = false; };
}
// A gazdi saját fotójából készülő kép: fotó választása → „Elkészítem” → a kész kép, alatta Mentés és Megosztás gomb
// (Szonja kérése, 2026-11-24: sokaknak nem menne a hosszan nyomás). Ugyanúgy működik, mint az Aura Scanner eredményénél:
// a mentés a képet fájlként tölti le (nem navigál el – a korábbi letöltő LINK ugrasztotta el az oldalt), a megosztás a telefon
// megosztó paneljét nyitja; ahol a böngésző nem tud fájlt megosztani, ott a mentés fut le.
function makeView(t, esc) {
  return `<section class="acard vmmake">${corners()}<p class="vmpose">${esc(t('vm.mk.pose'))}</p>
    <label class="fsbtn vmpick"><input type="file" accept="image/*" hidden><span>${esc(t('vm.mk.pick'))}</span></label>
    <img class="vmprev" alt="" hidden><button class="fsbtn vmgo" type="button" hidden>${esc(t('vm.mk.go'))}</button>
    <p class="vmst" aria-live="polite"></p><img class="vmres" alt="" hidden>
    <div class="vmacts" hidden><button class="fsbtn" type="button" data-act="save">${esc(t('au.res.save'))}</button><button class="fsbtn" type="button" data-act="share">${esc(t('au.res.share'))}</button></div></section>`;
}
function mountMake(root, t, style, sname, species, alive) {
  const q = (s) => root.querySelector('.vmmake ' + s);
  let photo = '', busy = false, url = '', blob = null;
  // fájlnév a stílus nevéből, a gazdi nyelvén (pl. pet-aura-mesekonyv.jpg) – a belső azonosító (kawaii) ne látsszon
  const slug = String(sname || style).replace(/ł/g, 'l').replace(/Ł/g, 'L').replace(/ß/g, 'ss').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '') || style;
  const fname = () => `pet-aura-${slug}.jpg`;
  const save = () => { if (!blob) return; const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fname(); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
  q('[data-act="save"]').onclick = save;
  q('[data-act="share"]').onclick = async () => {
    if (!blob) return; const f = new File([blob], fname(), { type: 'image/jpeg' });
    if (navigator.canShare && navigator.canShare({ files: [f] })) { try { await navigator.share({ files: [f], title: 'Pet Aura' }); } catch { /* a gazdi bezárta */ } } else save();
  };
  const st = (m, err) => { q('.vmst').textContent = m; q('.vmst').classList.toggle('err', !!err); };
  q('input').onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { photo = await shrink(f); } catch { photo = ''; st(t('vm.mk.bad'), true); return; }
    q('.vmprev').src = photo; q('.vmprev').hidden = false; q('.vmgo').hidden = false;
    q('.vmpick span').textContent = t('vm.mk.change'); st('');
  };
  q('.vmgo').onclick = async () => {
    if (busy || !photo) return; busy = true; q('.vmgo').disabled = true; st(t('vm.mk.wait'));
    try {
      const s = await session(); if (!s) throw new Error('auth');
      const r = await fetch(SUPABASE_URL + '/functions/v1/varazs', { method: 'POST',
        headers: { Authorization: 'Bearer ' + s.access_token, apikey: SUPABASE_KEY, 'Content-Type': 'application/json', 'x-pa-dev': devPass() },
        body: JSON.stringify({ style, species: species(), image: photo }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.image) throw new Error(d.error || String(r.status));
      // a visszakapott szöveges képet (data URI) fájlként kezeljük – így nem akadozik a telefon, és hosszan nyomva menthető
      const b = await (await fetch(d.image)).blob();
      if (!alive()) return;
      blob = b; if (url) URL.revokeObjectURL(url); url = URL.createObjectURL(b);
      q('.vmres').src = url; q('.vmres').hidden = false; q('.vmacts').hidden = false; st('');
      q('.vmres').scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (e) { if (alive()) st(t('vm.mk.err') + (devPass() ? ' (' + String(e && e.message || e).slice(0, 40) + ')' : ''), true); }
    busy = false; if (alive()) q('.vmgo').disabled = false;
  };
}
// „i” pecsét: rövid magyarázat a pergamenlapon, ugyanúgy, mint a Feng Shui iránytűjénél
function help(root, t, esc) {
  const steps = [1, 2, 3, 4].map((i) => `<li><span class="fsn">${i}</span><div><b>${esc(t('vm.h.' + i + 't'))}</b><p>${esc(t('vm.h.' + i))}</p></div></li>`).join('');
  const host = root.closest('.phone') || document.body;
  host.insertAdjacentHTML('beforeend', `<div class="fsmodal" id="vmmodal" role="dialog" aria-modal="true" aria-labelledby="vmmt"><div class="fsmcard kscroll"><div class="p-mid"></div><img class="p-top" src="assets/aura/perg_felso.webp" alt=""><img class="p-bot" src="assets/aura/perg_also.webp" alt="">
   <button class="zm fsx" id="vmclose" type="button" aria-label="${esc(t('fs.h.close'))}"><svg viewBox="0 0 100 100" aria-hidden="true"><path d="M34 34 66 66M66 34 34 66" stroke="url(#au)" stroke-width="9" stroke-linecap="round"/></svg></button>
   <div class="p-in"><h2 id="vmmt">${esc(t('vm.h.title'))}</h2><ol class="fssteps">${steps}</ol><p class="fstip">${esc(t('vm.h.priv'))}</p><p class="fstip">${esc(t('vm.h.tip'))}</p></div></div></div>`);
  const m = host.querySelector('#vmmodal');
  const close = () => { m.remove(); removeEventListener('keydown', k); }, k = (e) => { if (e.key === 'Escape') close(); };
  m.onclick = (e) => { if (e.target === m || e.target.closest('#vmclose')) close(); }; addEventListener('keydown', k); m.querySelector('#vmclose').focus();
}
