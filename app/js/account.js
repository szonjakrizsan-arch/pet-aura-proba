// Fiók (3. szakasz): nyelv, kedvencek, adatok (minden csak ezen a telefonon), tájékoztató, névjegy.
// Bejelentkezés és előfizetés a 4. szakaszban (háttérrendszer) jön; addig itt csak a jelzésük látszik.
import { SUPPORTED } from './i18n.js?v=0.6.20';
import { PETS } from './pets.js?v=0.6.20';

const VERSION = '0.6.20';
const ORN = (pos) => `<svg class="korn ${pos}" viewBox="0 0 280 20" aria-hidden="true"><path d="M6 10Q70 9.4 140 8.4Q210 9.4 274 10Q210 10.6 140 11.6Q70 10.6 6 10Z" fill="#f6d27a" opacity=".85"/><path d="M112 10c4-6 10-6 12 0-2 4-6 4-7 1M168 10c-4-6-10-6-12 0 2 4 6 4 7 1" stroke="url(#au)" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M140 2 143.4 10 140 18 136.6 10Z" fill="url(#au)"/></svg>`;
const glass = (title, body, cls = '') => `<section class="kglass acg ${cls}">${ORN('t')}<h3>${title}</h3>${body}${ORN('b')}</section>`;
const PAW = '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="url(#au)"><ellipse cx="12" cy="16" rx="5" ry="4.2"/><ellipse cx="5.6" cy="10.4" rx="2" ry="2.5"/><ellipse cx="9.4" cy="6.6" rx="2" ry="2.6"/><ellipse cx="14.6" cy="6.6" rx="2" ry="2.6"/><ellipse cx="18.4" cy="10.4" rx="2" ry="2.5"/></g></svg>';

let confirmWipe = false;
export function accountView({ t, esc, lang }) {
  const langs = SUPPORTED.map((s) => `<button class="aclang${s.code === lang ? ' on' : ''}" data-lang="${s.code}" lang="${s.code}" aria-pressed="${s.code === lang}">${esc(s.label)}</button>`).join('');
  const n = PETS.list.length;
  const wipe = confirmWipe
    ? `<p class="acwarn">${esc(t('acc.wipeq'))}</p><div class="prow"><button class="pbtn danger" id="acwipeyes" type="button">${esc(t('acc.wipeyes'))}</button><button class="pbtn" id="acwipeno" type="button">${esc(t('pets.cancel'))}</button></div>`
    : `<button class="plink danger" id="acwipe" type="button">${esc(t('acc.wipe'))}</button>`;
  return `<h1 class="t">${esc(t('top.account'))}</h1>
  <div class="accrest"><span class="zm accoin">${PAW}</span><p>${esc(t('acc.soon'))}</p></div>
  ${glass(esc(t('acc.lang')), `<div class="aclangs">${langs}</div>`)}
  ${glass(esc(t('top.pets')), `<a class="acrow" data-go="pets" role="button" tabindex="0"><span>${esc(t('acc.pets', { n }))}</span><span class="karr">›</span></a>`)}
  ${glass(esc(t('acc.data')), `<p>${esc(t('acc.local'))}</p>${wipe}`)}
  ${glass(esc(t('disc.title')), `<p>${esc(t('disc.body'))}</p>`)}
  ${glass(esc(t('acc.about')), `<p>Pet Aura · v${VERSION}</p><p class="acsrc">${esc(t('acc.sources'))}<br>© GeoNames · CC BY 4.0<br>Noto Sans Symbols · SIL OFL 1.1</p>`)}`;
}

export function mountAccount(root, { setLang, render }) {
  root.querySelectorAll('[data-lang]').forEach((b) => { b.onclick = () => setLang(b.dataset.lang); });
  const w = root.querySelector('#acwipe'); if (w) w.onclick = () => { confirmWipe = true; render(); setTimeout(() => root.querySelector('#acwipeyes')?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 0); };
  const no = root.querySelector('#acwipeno'); if (no) no.onclick = () => { confirmWipe = false; render(); };
  const yes = root.querySelector('#acwipeyes'); if (yes) yes.onclick = () => {
    // minden Pet Aura-adat törlése erről a telefonról (a választott nyelv megmarad)
    const keep = localStorage.getItem('lang'); try { localStorage.clear(); if (keep) localStorage.setItem('lang', keep); } catch { /* nincs tárhely */ }
    location.replace(location.pathname + '#home'); location.reload();
  };
}
export const leaveAccount = () => { confirmWipe = false; };
