// Tudástár – régi, értékes kódex (Szonja leírása, 2026-11-18): világos, meleg pergamenlap, lila és arany díszítés,
// címlap a három fejezettel, a fejezetekben lapozható oldalak (ujjal húzva vagy a kis arany nyilakkal), nagy díszes
// iniciálé, és a könyv gerincénél mindig ott a lila selyem könyvjelzőszalag.
// Az első változat teljesen kódból készül (pergamen, díszek); a rajzolt rétegekről a képernyőképek után döntünk.
// A szövegek a data/tudastar/<nyelv>.json-ból jönnek; a live:false témák (bevezető, aura) a 4. szakaszig nem jelennek meg.
const V = '0.6.50';
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
// selyem-bársony könyvjelzőszalag (ChatGPT rajza): felső vég, nyújtható középső szakasz, alsó vég a medállal
const ribbon = () => '<div class="kbribbon" aria-hidden="true"><i class="rt"></i><i class="rm"></i><i class="rb"></i></div>';

const md = (s, esc) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b class="kbem">$1</b>'); // a szövegtár **kiemelései** félkövér lila tintával
// a szövegtár felsorolásai („\n- …”) kódexes listaként, apró arany csillaggal
const block = (p, esc) => { const [head, ...items] = p.split('\n- '); return `<p>${md(head, esc)}</p>` + (items.length ? `<ul class="kblist">${items.map((x) => `<li>${md(x, esc)}</li>`).join('')}</ul>` : ''); };
function paras(ps, esc, ja) { // az első bekezdés díszes iniciáléval kezdődik (a japánban nincs iniciálé – ott nem szokás)
  return ps.map((p, i) => {
    if (i || ja || p.startsWith('*')) return block(p, esc);
    // Az első szó egyben marad: a rövid első szó (A, Az, El, The, Das…) egészében kerül az iniciáléba; hosszabb szónál a nagy
    // kezdőbetű után a szó többi része kiskapitálissal, szorosan folytatódik (régi kódexek szokása), így sosem válik szét („A | z”).
    const w = /^\S+/.exec(p)[0].replace(/[,.:;!?]+$/, ''), chars = [...w];
    // Szonja kérése: az első betű a díszes iniciálé (az inda csak ezt öleli), a rövid szó további betűi ugyanígy aranyozva,
    // de kisebben csatlakoznak hozzá; hosszabb szónál a többi betű kiskapitálissal folytatódik a szövegben.
    const L = (c, cls) => `<span class="kbl${cls}"><b class="k1">${esc(c)}</b><b class="k2">${esc(c)}</b><b class="k3">${esc(c)}</b></span>`;
    const short = chars.length <= 3, more = short ? chars.slice(1).join('') : '', tail = short ? '' : chars.slice(1).join(''), rest = p.slice(w.length);
    return `<p class="kbfirst"><span class="kbini" aria-hidden="true"><span class="kbw">${L(chars[0], '')}${more ? L(more, ' sm') : ''}</span></span><span class="sr">${esc(chars[0] + more)}</span>${tail ? `<span class="kbsc">${esc(tail)}</span>` : ''}${md(rest, esc)}</p>`;
  }).join('');
}

export function kbView({ t, esc, sub }) {
  const cover = !/^[hf]/.test(sub || '');
  return `<h1 class="t kbhd"><i class="kbfl" aria-hidden="true"></i><span>${esc(t('nav.kb'))}</span><i class="kbfl r" aria-hidden="true"></i></h1>${DEFS}<div id="kbroot" class="kbk${cover ? ' cov' : ''}"><div class="kbbook"><div class="kbleft"></div><div class="kbpage">${PAPER}<div class="kbscr"><div class="kbin"><i class="kload">${esc(t('cos.loading'))}</i></div></div></div>${ribbon()}</div></div>`;
}

export function mountKb(view, { t, esc, lang, sub, setRoute, go }) {
  const root = view.querySelector('#kbroot'); if (!root) return () => {};
  const book = root.querySelector('.kbbook'), page = root.querySelector('.kbpage');
  const ja = lang === 'ja'; root.classList.toggle('ja', ja);
  let alive = true, pages = [], idx = 0, busy = false; // a teljes könyv egyetlen lapsor: címlap → Kozmikus Mancs → Mancs Feng Shui
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fit = () => { const r = book.getBoundingClientRect(), nav = document.getElementById('nav'), nb = nav && !nav.hidden ? nav.getBoundingClientRect().height : 0;
    book.style.setProperty('--kbh', Math.max(420, innerHeight - r.top - nb - 70) + 'px'); };
  const frame = (inner, cls = '') => `<div class="kbin ${cls}">${inner}</div>`;

  function cover(d) {
    const row = (k) => { const c = CH[k], live = d.topics.some((x) => x.part === k && x.live);
      return `<button class="kbch${live ? '' : ' sealed'}" ${live ? `data-kbch="${k}"` : 'disabled'}><img src="assets/elemzeseim/${c.jel}.webp?v=${V}" alt=""><span><b>${esc(t(c.name))}</b><i>${esc(t(c.sub))}</i>${live ? '' : `<em>${esc(t('kb.soon'))}</em>`}</span>${live ? '<svg class="kbgo" viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4l6 6-6 6" fill="none" stroke="url(#kbgold)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '<span class="kbseal" aria-hidden="true"></span>'}</button>`; };
    return frame(`<div class="kbcov"><div class="kbstar" aria-hidden="true">✦</div><h2 class="kbtitle">${esc(t('nav.kb'))}</h2>${divider()}<div class="kbchs">${['h', 'f', 'a'].map(row).join('')}</div></div>`, 'cover');
  }
  // Szonja kérése: a fejezet végén tovább lehet lapozni a következő fejezetbe, és bárhonnan vissza lehet ugrani a tartalomjegyzékhez (címlap).
  function buildBook(d) {
    const out = [{ r: '', html: cover(d) }];
    for (const k of ['h', 'f']) {
      const ts = d.topics.filter((x) => x.part === k && x.live), c = CH[k]; if (!ts.length) continue;
      const base = out.length;
      const toc = `<div class="kbopen"><img class="kbjel" src="assets/elemzeseim/${c.jel}.webp?v=${V}" alt=""><h2 class="kbchn">${esc(t(c.name))}</h2><p class="kbchs2">${esc(t(c.sub))}</p>${divider()}<h3 class="kbtoch">${esc(t('kb.toc'))}</h3><ol class="kbtoc">${ts.map((x, i) => `<li><button data-kbp="${base + 1 + i}"><span>${esc(x.title)}</span><i>${ROMAN[i + 1]}</i></button></li>`).join('')}</ol></div>`;
      out.push({ r: k, ch: k, html: frame(toc, 'open') });
      ts.forEach((x, i) => out.push({ r: k + '-' + (i + 1), ch: k, n: i + 1, of: ts.length, html: frame(`<article class="kbart"><div class="kbnum">${ROMAN[i + 1]}</div><h2 class="kbh">${esc(x.title)}</h2>${divider()}${paras(x.p, esc, ja)}<aside class="kbsee"><h3>${esc(d.see_title)}</h3>${block(x.see, esc)}</aside></article>`) }));
    }
    return out;
  }
  const foot = () => { const P = pages[idx];
    const mid = idx ? `<button class="kbtocb" data-kbt="toc" aria-label="${esc(t('kb.contents.aria'))}"><b>${esc(t('kb.contents'))}</b><span>${P.n ? ROMAN[P.n] + ' / ' + ROMAN[P.of] : '✦'}</span></button>` : '<span class="kbpn">✦</span>';
    return `<div class="kbfoot"><button class="kbarr" data-kbt="-1" ${idx ? '' : 'disabled'} aria-label="${esc(t('kb.prev'))}"><svg viewBox="0 0 20 20"><path d="M13 4l-6 6 6 6"/></svg></button>${mid}<button class="kbarr" data-kbt="1" ${idx < pages.length - 1 ? '' : 'disabled'} aria-label="${esc(t('kb.next'))}"><svg viewBox="0 0 20 20"><path d="M7 4l6 6-6 6"/></svg></button></div>`; };
  const show = () => { root.classList.toggle('cov', !idx); page.innerHTML = PAPER + `<div class="kbscr withfoot">${pages[idx].html}</div>${foot()}`; };
  const scr = (el) => el.querySelector('.kbscr');

  function turn(to) {
    if (busy || to < 0 || to >= pages.length || to === idx) return;
    const fwd = to > idx, old = page.innerHTML, oy = scr(page)?.scrollTop || 0; idx = to; setRoute('kb' + (pages[idx].r ? '/' + pages[idx].r : ''));
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
    pages = buildBook(d); idx = Math.max(0, pages.findIndex((x) => x.r === (sub || '')));
    show(); fit();
  });

  const click = (e) => {
    const c = e.target.closest('[data-kbch]'); if (c) { turn(pages.findIndex((x) => x.r === c.dataset.kbch)); return; }
    const p = e.target.closest('[data-kbp]'); if (p) { turn(+p.dataset.kbp); return; }
    const a = e.target.closest('[data-kbt]'); if (a) turn(a.dataset.kbt === 'toc' ? (pages[idx].n ? pages.findIndex((x) => x.r === pages[idx].ch) : 0) : idx + +a.dataset.kbt); // „Tartalom”: témaoldalról a fejezet tartalomjegyzéke, onnan a címlap
  };
  let sx = 0, sy = 0, st = 0;
  const down = (e) => { sx = e.clientX; sy = e.clientY; st = Date.now(); };
  const up = (e) => { if (!st) return; const dx = e.clientX - sx, dy = e.clientY - sy; st = 0;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.6) turn(idx + (dx < 0 ? 1 : -1)); };
  const key = (e) => { if (e.key === 'ArrowRight') turn(idx + 1); if (e.key === 'ArrowLeft') turn(idx - 1); };
  root.addEventListener('click', click); book.addEventListener('pointerdown', down); book.addEventListener('pointerup', up);
  addEventListener('keydown', key); addEventListener('resize', fit); fit();
  return () => { alive = false; removeEventListener('keydown', key); removeEventListener('resize', fit); };
}
