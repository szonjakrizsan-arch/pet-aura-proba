// Tudástár – régi, értékes kódex (Szonja leírása, 2026-11-18): világos, meleg pergamenlap, lila és arany díszítés,
// címlap a három fejezettel, a fejezetekben lapozható oldalak (ujjal húzva vagy a kis arany nyilakkal), nagy díszes
// iniciálé, és a könyv gerincénél mindig ott a lila selyem könyvjelzőszalag.
// Az első változat teljesen kódból készül (pergamen, díszek); a rajzolt rétegekről a képernyőképek után döntünk.
// A szövegek a data/tudastar/<nyelv>.json-ból jönnek; a live:false témák (bevezető, aura) a 4. szakaszig nem jelennek meg.
const V = '0.6.33';
const CH = { h: { name: 'nav.cosmic', sub: 'kb.ch.h', jel: 'jel_horo' }, f: { name: 'nav.feng', sub: 'kb.ch.f', jel: 'jel_feng' }, a: { name: 'home.card.aura', sub: 'kb.ch.a', jel: 'jel_aura' } };
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const cache = {};
async function load(lang) {
  if (!cache[lang]) cache[lang] = fetch(`data/tudastar/${lang}.json?v=${V}`).then((r) => r.json()).catch(() => null);
  return cache[lang];
}
// arany sarokdísz (SVG, a lap négy sarkába tükrözve)
const corner = (cls) => `<svg class="kbcorner ${cls}" viewBox="0 0 60 60" aria-hidden="true"><path d="M4 56V14Q4 4 14 4H56" fill="none" stroke="url(#kbgold)" stroke-width="2.2"/><path d="M10 56V18Q10 10 18 10H56" fill="none" stroke="url(#kbgold)" stroke-width=".9"/><path d="M14 24q8-2 10-10M24 14q2 8 10 10M14 24q6 4 4 12M34 24q-4 6-12 4" fill="none" stroke="url(#kbgold)" stroke-width="1.1" stroke-linecap="round"/><circle cx="20" cy="20" r="2.6" fill="url(#kbgold)"/></svg>`;
const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="kbgold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9c46a"/><stop offset=".5" stop-color="#b8862e"/><stop offset="1" stop-color="#8a5d17"/></linearGradient></defs></svg>`;
// a pergamenlap (ChatGPT rajza, Szonja jóváhagyta): felső és alsó szelet, köztük a varrat nélkül ismételhető középső sáv
const PAPER = '<i class="kpp kpm"></i><i class="kpp kpt"></i><i class="kpp kpb"></i>';
const divider = () => `<img class="kbdiv" src="assets/elemzeseim/ablak_valaszto.webp?v=${V}" alt="">`;
// lila selyemszalag fecskefarok véggel, a könyv gerincénél
const ribbon = () => `<svg class="kbribbon" viewBox="0 0 26 300" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="kbrib" x1="0" x2="1"><stop offset="0" stop-color="#34105a"/><stop offset=".3" stop-color="#6e32a8"/><stop offset=".5" stop-color="#a46ad8"/><stop offset=".7" stop-color="#6e32a8"/><stop offset="1" stop-color="#2e0e50"/></linearGradient><pattern id="kbweave" width="4" height="3" patternUnits="userSpaceOnUse"><path d="M0 1.5H4" stroke="#ffffff" stroke-width=".35" opacity=".12"/></pattern></defs><path d="M2 0H24V300L13 284L2 300Z" fill="url(#kbrib)"/><path d="M2 0H24V300L13 284L2 300Z" fill="url(#kbweave)"/><path d="M3.6 0V294M22.4 0V294" stroke="#e9c46a" stroke-width="1.2"/><path d="M5.6 0V291M20.4 0V291" stroke="#e9c46a" stroke-width=".5" stroke-dasharray="1.6 1.6" opacity=".85"/></svg><svg class="kbcharm" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="11" fill="url(#kbgold)" stroke="#6b4512" stroke-width=".8"/><circle cx="15" cy="15" r="8" fill="#4a1c78"/><path d="M15 8.5Q15.8 14.2 21.5 15Q15.8 15.8 15 21.5Q14.2 15.8 8.5 15Q14.2 14.2 15 8.5Z" fill="#f6dc8c"/></svg>`;

const md = (s, esc) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b class="kbem">$1</b>'); // a szövegtár **kiemelései** félkövér lila tintával
function paras(ps, esc, ja) { // az első bekezdés díszes iniciáléval kezdődik (a japánban nincs iniciálé – ott nem szokás)
  return ps.map((p, i) => {
    if (i || ja || p.startsWith('*')) return `<p>${md(p, esc)}</p>`;
    // Az első szó egyben marad: a rövid első szó (A, Az, El, The, Das…) egészében kerül az iniciáléba; hosszabb szónál a nagy
    // kezdőbetű után a szó többi része kiskapitálissal, szorosan folytatódik (régi kódexek szokása), így sosem válik szét („A | z”).
    const w = /^\S+/.exec(p)[0].replace(/[,.:;!?]+$/, ''), chars = [...w];
    const big = chars.length <= 3 ? w : chars[0], tail = chars.length <= 3 ? '' : w.slice(chars[0].length), rest = p.slice(w.length);
    return `<p class="kbfirst"><span class="kbini${[...big].length > 1 ? ' word' : ''}" aria-hidden="true"><b>${esc(big)}</b></span><span class="sr">${esc(big)}</span>${tail ? `<span class="kbsc">${esc(tail)}</span>` : ''}${md(rest, esc)}</p>`;
  }).join('');
}

export function kbView({ t, esc, sub }) {
  const cover = !/^[hf]/.test(sub || '');
  return `<h1 class="t">${esc(t('nav.kb'))}</h1>${DEFS}<div id="kbroot" class="kbk${cover ? ' cov' : ''}"><div class="kbbook"><div class="kbleft"></div><div class="kbpage">${PAPER}<div class="kbscr"><div class="kbin"><i class="kload">${esc(t('cos.loading'))}</i></div></div></div>${ribbon()}</div></div>`;
}

export function mountKb(view, { t, esc, lang, sub, setRoute, go }) {
  const root = view.querySelector('#kbroot'); if (!root) return () => {};
  const book = root.querySelector('.kbbook'), page = root.querySelector('.kbpage');
  const ja = lang === 'ja'; root.classList.toggle('ja', ja);
  let alive = true, pages = [], idx = 0, ch = '', busy = false;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fit = () => { const r = book.getBoundingClientRect(), nav = document.getElementById('nav'), nb = nav && !nav.hidden ? nav.getBoundingClientRect().height : 0;
    book.style.setProperty('--kbh', Math.max(420, innerHeight - r.top - nb - 70) + 'px'); };
  const frame = (inner, cls = '') => `<div class="kbin ${cls}">${inner}</div>`;

  function cover(d) {
    const row = (k) => { const c = CH[k], live = d.topics.some((x) => x.part === k && x.live);
      return `<button class="kbch${live ? '' : ' sealed'}" ${live ? `data-kbch="${k}"` : 'disabled'}><img src="assets/elemzeseim/${c.jel}.webp?v=${V}" alt=""><span><b>${esc(t(c.name))}</b><i>${esc(t(c.sub))}</i>${live ? '' : `<em>${esc(t('kb.soon'))}</em>`}</span>${live ? '<svg class="kbgo" viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4l6 6-6 6" fill="none" stroke="url(#kbgold)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '<span class="kbseal" aria-hidden="true"></span>'}</button>`; };
    return frame(`<div class="kbcov"><div class="kbstar" aria-hidden="true">✦</div><h2 class="kbtitle">${esc(t('nav.kb'))}</h2>${divider()}<div class="kbchs">${['h', 'f', 'a'].map(row).join('')}</div></div>`, 'cover');
  }
  function chapterPages(d, k) {
    const ts = d.topics.filter((x) => x.part === k && x.live), c = CH[k];
    const toc = `<div class="kbopen"><img class="kbjel" src="assets/elemzeseim/${c.jel}.webp?v=${V}" alt=""><h2 class="kbchn">${esc(t(c.name))}</h2><p class="kbchs2">${esc(t(c.sub))}</p>${divider()}<h3 class="kbtoch">${esc(t('kb.toc'))}</h3><ol class="kbtoc">${ts.map((x, i) => `<li><button data-kbp="${i + 1}"><span>${esc(x.title)}</span><i>${ROMAN[i + 1]}</i></button></li>`).join('')}</ol></div>`;
    return [frame(toc, 'open'), ...ts.map((x, i) => frame(`<article class="kbart"><div class="kbnum">${ROMAN[i + 1]}</div><h2 class="kbh">${esc(x.title)}</h2>${divider()}${paras(x.p, esc, ja)}<aside class="kbsee"><h3>${esc(d.see_title)}</h3><p>${md(x.see, esc)}</p></aside></article>`))];
  }
  const foot = () => `<div class="kbfoot"><button class="kbarr" data-kbt="-1" ${idx ? '' : 'disabled'} aria-label="${esc(t('kb.prev'))}"><svg viewBox="0 0 20 20"><path d="M13 4l-6 6 6 6"/></svg></button><span class="kbpn">${idx ? ROMAN[idx] + ' / ' + ROMAN[pages.length - 1] : '✦'}</span><button class="kbarr" data-kbt="1" ${idx < pages.length - 1 ? '' : 'disabled'} aria-label="${esc(t('kb.next'))}"><svg viewBox="0 0 20 20"><path d="M7 4l6 6-6 6"/></svg></button></div>`;
  const show = () => { page.innerHTML = PAPER + `<div class="kbscr${ch ? ' withfoot' : ''}">${pages[idx]}</div>${ch ? foot() : ''}`; };
  const scr = (el) => el.querySelector('.kbscr');

  function turn(to) {
    if (busy || to < 0 || to >= pages.length || to === idx) return;
    const fwd = to > idx, old = page.innerHTML, oy = scr(page)?.scrollTop || 0; idx = to; setRoute('kb/' + ch + (idx ? '-' + idx : ''));
    if (still) { show(); return; }
    busy = true;
    const leaf = document.createElement('div'); leaf.className = 'kbleaf ' + (fwd ? 'fwd' : 'back');
    if (fwd) { leaf.innerHTML = `<div class="kbface front">${old}</div><div class="kbface rear"></div>`; const y = scr(page).scrollTop; show(); scr(leaf.querySelector('.front')).scrollTop = y; }
    else { show(); leaf.innerHTML = `<div class="kbface front">${page.innerHTML}</div><div class="kbface rear">${PAPER}</div>`; page.innerHTML = old; scr(page).scrollTop = oy; }
    book.appendChild(leaf);
    const done = () => { if (!fwd) show(); leaf.remove(); busy = false; };
    leaf.addEventListener('animationend', done, { once: true }); setTimeout(() => { if (leaf.isConnected) done(); }, 1400);
  }

  load(lang).then((d) => {
    if (!alive) return;
    if (!d) { page.innerHTML = PAPER + `<div class="kbscr">${frame('<p class="kbmiss">✦</p>')}</div>`; return; }
    const m = /^([hf])(?:-(\d+))?$/.exec(sub || '');
    if (m) { ch = m[1]; pages = chapterPages(d, ch); idx = Math.min(+(m[2] || 0), pages.length - 1); book.classList.add('chapter'); }
    else { ch = ''; pages = [cover(d)]; idx = 0; }
    show(); fit();
  });

  const click = (e) => {
    const c = e.target.closest('[data-kbch]'); if (c) { go('kb/' + c.dataset.kbch); return; }
    const p = e.target.closest('[data-kbp]'); if (p) { turn(+p.dataset.kbp); return; }
    const a = e.target.closest('[data-kbt]'); if (a) turn(idx + +a.dataset.kbt);
  };
  let sx = 0, sy = 0, st = 0;
  const down = (e) => { sx = e.clientX; sy = e.clientY; st = Date.now(); };
  const up = (e) => { if (!ch || !st) return; const dx = e.clientX - sx, dy = e.clientY - sy; st = 0;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.6) turn(idx + (dx < 0 ? 1 : -1)); };
  const key = (e) => { if (!ch) return; if (e.key === 'ArrowRight') turn(idx + 1); if (e.key === 'ArrowLeft') turn(idx - 1); };
  root.addEventListener('click', click); book.addEventListener('pointerdown', down); book.addEventListener('pointerup', up);
  addEventListener('keydown', key); addEventListener('resize', fit); fit();
  return () => { alive = false; removeEventListener('keydown', key); removeEventListener('resize', fit); };
}
