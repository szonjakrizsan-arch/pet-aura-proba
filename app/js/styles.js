// Varázsműhely (Stílusok, 4. funkció): a stílusok galériája a mintaképekkel (Szonja gyűjtése, 2026-11-18/19).
// A mintaképek a Pet Aura kabalafiguráiból készültek; a valódi átalakítás (a gazdi saját fotójából) a 4. szakaszban
// indul, addig a gomb őszintén „hamarosan” feliratú. Az AI-utasítások nem kerülnek az appba (üzleti titok, design/stilusok).
import { CORNER } from './account.js?v=0.6.51';
import { activePet } from './pets.js?v=0.6.51';

const V = '0.6.51';
const SEASON = { karacsony: (d) => (d.getMonth() === 11) || (d.getMonth() === 0 && d.getDate() <= 6) }; // dec. 1. – jan. 6. (Szonja döntése)
// Minden stílusnak cicás és kutyás mintaképe van (Szonja kérése: a cicás gazdi ne higgye, hogy csak kutyáknak szól).
// A kedvenc faja dönt; ha nincs kedvenc / faj, a galériában felváltva látszanak (sakktáblaszerűen).
const FILE = { boszi: 'boszi' };
const cache = {};
const load = (lang) => (cache[lang] ||= fetch(`data/stilusok/${lang}.json?v=${V}`).then((r) => r.json()).catch(() => null));
const corners = () => ['tl', 'tr', 'bl', 'br'].map((c) => `<i class="accor ${c}">${CORNER}</i>`).join('');
// a karácsonyi stílus csak az ünnepi időszakban látszik; teszteléshez a címsorban ?unnep kapcsolja be
const inSeason = (id) => !SEASON[id] || SEASON[id](new Date()) || /[?&]unnep/.test(location.search);

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
        <h2>${esc(one.name)}</h2><p>${esc(one.desc)}</p><p class="vmsample">${esc(d.ui.sample)}</p>
        <button class="btn-gold vmsoon" disabled>✦ ${esc(d.ui.soon)}</button></section>`;
      root.querySelectorAll('[data-a]').forEach((b) => { b.onclick = () => {
        root.querySelectorAll('[data-a]').forEach((x) => x.classList.toggle('on', x === b));
        root.querySelector('.vmbig').src = img(one.id, false, b.dataset.a); }; });
      return;
    }
    root.innerHTML = `<p class="vmintro">${esc(d.ui.intro)}</p><div class="vmgrid">${list.map((s, i) => `<button class="acard vmcard${SEASON[s.id] ? ' season' : ''}" data-go="styles/${s.id}">${corners()}
      <span class="vmimg"><img src="${img(s.id, true, animal(i))}" alt="" loading="lazy"></span>${SEASON[s.id] ? `<span class="vmseason">${esc(d.ui.season)}</span>` : ''}<b>${esc(s.name)}</b></button>`).join('')}</div>`;
  });
  return () => { alive = false; };
}
