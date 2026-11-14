// Kezdőlap: a jóváhagyott jelenet (design/kezdolap) felépítése és finom animációi.
// Minden felirat a szótárból jön (t), a képek az assets/kezdolap mappából.
const IMG = (f) => `assets/kezdolap/${f}`;
// Az arany színátmenet (#au) az index.html-ben van, mindig látható helyen: így az alsó menü ikonjai minden képernyőn aranyak (korábban a rejtett kezdőlapban volt, és aloldalakon kiesett).
const G = 'fill="url(#au)" stroke="#7a4c12" stroke-width=".6" stroke-linejoin="round"';
export const ICON = {
  paw: `<svg viewBox="0 0 24 24"><g ${G}><ellipse cx="5.6" cy="10" rx="2.1" ry="2.6" transform="rotate(-20 5.6 10)"/><ellipse cx="9.4" cy="5.8" rx="2.1" ry="2.7"/><ellipse cx="14.6" cy="5.8" rx="2.1" ry="2.7"/><ellipse cx="18.4" cy="10" rx="2.1" ry="2.6" transform="rotate(20 18.4 10)"/><path d="M12 10.6c-3.4 0-6.4 4-6.4 6.6 0 2 1.7 2.8 3.3 2.3 1.2-.4 2-.8 3.1-.8s1.9.4 3.1.8c1.6.5 3.3-.3 3.3-2.3 0-2.6-3-6.6-6.4-6.6Z"/></g></svg>`,
  user: `<svg viewBox="0 0 24 24"><g ${G}><circle cx="12" cy="8" r="4.2"/><path d="M3.8 21c.4-4.6 3.9-7.3 8.2-7.3s7.8 2.7 8.2 7.3Z"/></g></svg>`,
  home: `<svg viewBox="0 0 24 24"><g ${G}><path d="M12 2.6 1.8 11.2l1.3 1.5L12 5.3l8.9 7.4 1.3-1.5Z"/><path d="M5 12.2 12 6.4l7 5.8V21h-4.6v-5.6H9.6V21H5Z"/><path d="M16.3 4.2h2.2v3.6l-2.2-1.8Z"/></g><path d="M12 9.3l.5 1.1 1.2.1-.9.8.3 1.2-1.1-.6-1.1.6.3-1.2-.9-.8 1.2-.1Z" fill="#fff6d8"/></svg>`,
  my: `<svg viewBox="0 0 24 24"><g ${G}><rect x="3" y="20" width="18" height="1.8" rx=".9"/><rect x="4.6" y="12" width="3.6" height="7" rx="1.2"/><rect x="10.2" y="8" width="3.6" height="11" rx="1.2"/><rect x="15.8" y="4.5" width="3.6" height="14.5" rx="1.2"/></g><path d="M7 3.2l.45 1.1 1.1.45-1.1.45L7 6.3l-.45-1.1-1.1-.45 1.1-.45Z" fill="#fff6d8"/></svg>`,
  kb: `<svg viewBox="0 0 24 24"><g ${G}><path d="M11.4 9.2C9 7.9 5.6 7.6 2.4 8.1v11.4c3.2-.5 6.6-.2 9 1.1Z"/><path d="M12.6 9.2c2.4-1.3 5.8-1.6 9-1.1v11.4c-3.2-.5-6.6-.2-9 1.1Z"/><path d="M12 8.6c-.2-2.6.8-4.7 3.2-6 .4 2.6-.8 4.7-3.2 6Z"/><path d="M11.8 8.4c-1.8-.9-2.7-2.4-2.5-4.3 1.8.6 2.7 2.2 2.5 4.3Z"/></g><path d="M4.4 11c1.9-.2 3.8 0 5.3.6M4.4 13.6c1.9-.2 3.8 0 5.3.6M14.3 11.6c1.5-.6 3.4-.8 5.3-.6M14.3 14.2c1.5-.6 3.4-.8 5.3-.6" stroke="#8a5a16" stroke-width=".7" fill="none" stroke-linecap="round"/></svg>`,
  styles: `<svg viewBox="0 0 24 24"><g ${G}><path d="M3.2 19.4 14.6 8l1.6 1.6L4.8 21Z"/><path d="M17 1.8l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1Z"/><path d="M8.2 3.2l.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5-1.5-.6 1.5-.6Z"/><path d="M20.4 10.6l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5Z"/></g><path d="M13.4 9.2 14.6 8l1.6 1.6-1.2 1.2Z" fill="#fff6d8"/></svg>`,
  back: `<svg viewBox="0 0 24 24"><path d="M14.5 5.5 8 12l6.5 6.5" fill="none" stroke="#f0c66a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};
// t: fordító függvény, esc: HTML-escape
export function homeHtml(t, esc) {
  const card = (route, scene, label) => `<div class="card" data-go="${route}" role="button" tabindex="0"><div class="glow"></div><div class="fill scene" style="background-image:url(${IMG(scene)})"></div><div class="frame"></div><div class="in"><b>${esc(label)}</b></div></div>`;
  return `<div class="bg"></div><div class="moonglow"></div><canvas id="stars"></canvas>
  <div class="top">
    <div class="round" data-go="pets" role="button" tabindex="0" title="${esc(t('top.pets'))}" aria-label="${esc(t('top.pets'))}">${ICON.paw}<svg class="chev" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" fill="none" stroke="#f6d27a" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
    <div class="round" data-go="account" role="button" tabindex="0" title="${esc(t('top.account'))}" aria-label="${esc(t('top.account'))}">${ICON.user}</div>
  </div>
  <div class="title"><h1>Pet Aura</h1><p>${esc(t('home.tagline'))}</p></div>
  <div class="zodiac"><svg viewBox="0 0 200 200" fill="none" stroke="#f3cf7a" stroke-width=".8">
    <circle cx="100" cy="100" r="96" opacity=".7"/><circle cx="100" cy="100" r="80" opacity=".5"/><circle cx="100" cy="100" r="58" opacity=".35" stroke-dasharray="2 3"/>
    <g id="z" font-family="serif" font-size="13" fill="#f6dc9a" stroke="none" text-anchor="middle" dominant-baseline="central"></g>
    <g opacity=".6"><path d="M70 110 82 92 100 98 118 84 132 100"/><circle cx="70" cy="110" r="1.6" fill="#fff"/><circle cx="82" cy="92" r="1.6" fill="#fff"/><circle cx="100" cy="98" r="1.6" fill="#fff"/><circle cx="118" cy="84" r="1.6" fill="#fff"/><circle cx="132" cy="100" r="1.6" fill="#fff"/></g>
  </svg></div>
  <div class="pets"><div class="halo"></div><img class="dog" src="${IMG('dog2.png')}" alt=""><img class="cat" src="${IMG('cat2.png')}" alt=""></div>
  <img class="book" src="${IMG('book.png')}" alt=""><div class="lantern" id="lant"><div class="lg"></div><img src="${IMG('lantern.png')}" alt=""><div class="li"></div><div class="lf"></div></div>
  <img class="crystals" src="${IMG('crystals.png')}" alt=""><div class="moonstone"><div class="mg"></div><img src="${IMG('moon.png')}" alt=""></div>
  <img class="lav l" src="${IMG('lav.png')}" alt=""><img class="lav r" src="${IMG('lav_r.png')}" alt="">
  <canvas id="dust" style="z-index:4"></canvas>
  <div class="cards">${card('aura', 'scene_aura.jpg', t('home.card.aura'))}${card('cosmic', 'scene_horo.jpg', t('home.card.horo'))}${card('feng', 'scene_feng.jpg', t('home.card.feng'))}</div>`;
}
export function navHtml(t, esc, active) {
  const items = [['home', 'home', 'nav.home'], ['my', 'my', 'nav.my'], ['kb', 'kb', 'nav.kb'], ['styles', 'styles', 'nav.styles']];
  const idx = Math.max(0, items.findIndex(([r]) => r === active)), x = 12.5 + idx * 25;
  return `<span class="fl" style="left:${x}%;top:0"></span><span class="fl" style="left:${x}%;top:100%"></span>` +
    items.map(([route, icon, key]) => `<a data-go="${route}" class="${route === active ? 'on' : ''}" role="button" tabindex="0">${ICON[icon]}${esc(t(key))}</a>`).join('');
}
// Animációk: csillagok, aranypor a könyvből, lámpás. Visszaad egy leállító függvényt.
export function startHome(root) {
  const glyphs = '♈♉♊♋♌♍♎♏♐♑♒♓', g = root.querySelector('#z');
  if (g && !g.childElementCount) [...glyphs].forEach((c, i) => { const a = i / 12 * Math.PI * 2 - Math.PI / 2, tx = document.createElementNS('http://www.w3.org/2000/svg', 'text'); tx.setAttribute('x', 100 + 88 * Math.cos(a)); tx.setAttribute('y', 100 + 88 * Math.sin(a)); tx.textContent = c + '︎'; g.appendChild(tx); });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let alive = true;
  const setup = (id) => { const c = root.querySelector('#' + id), x = c.getContext('2d'); const fit = () => { const r = c.getBoundingClientRect(), d = devicePixelRatio || 1; c.width = r.width * d; c.height = r.height * d; x.setTransform(d, 0, 0, d, 0, 0); }; fit(); addEventListener('resize', fit); return [c, x, () => removeEventListener('resize', fit)]; };
  const [sc, sx, off1] = setup('stars'), [dc, dx, off2] = setup('dust');
  const W = () => sc.getBoundingClientRect().width, H = () => sc.getBoundingClientRect().height;
  const stars = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random() * .42, r: Math.random() * 1.4 + .4, p: Math.random() * 6.28, s: .5 + Math.random() * 1.5 }));
  const BK = root.querySelector('.book'); const bookTop = () => { const r = BK.getBoundingClientRect(), p = sc.getBoundingClientRect(); return (r.top - p.top + r.height * .35) / p.height; };
  const dust = Array.from({ length: 46 }, () => ({ x: .4 + Math.random() * .2, y: .45 + Math.random() * .15, v: .0006 + Math.random() * .0012, r: Math.random() * 1.8 + .6, p: Math.random() * 6.28 }));
  const SD = Array.from({ length: 120 }, () => ({ o: Math.random(), v: .07 + Math.random() * .08, dir: Math.random() < .5 ? -1 : 1, ph: Math.random() * 6.28, j: (Math.random() - .5) * 6, r: .8 + Math.random() * 1.3, tw: 1.5 + Math.random() * 3, c: Math.random() < .35 ? '#fff3c8' : '#ffd98a' }));
  const LT = root.querySelector('#lant'); let gust = null;
  const t0 = performance.now();
  function frame(t) {
    if (!alive) return; const s = (t - t0) / 1000, w = W(), h = H();
    sx.clearRect(0, 0, w, h); for (const st of stars) { const a = .35 + .65 * Math.abs(Math.sin(st.p + s * st.s)); sx.globalAlpha = a; sx.fillStyle = '#fff6d8'; sx.beginPath(); sx.arc(st.x * w, st.y * h, st.r, 0, 6.28); sx.fill(); if (st.r > 1.4 && a > .9) { sx.fillRect(st.x * w - 5, st.y * h - .4, 10, .8); sx.fillRect(st.x * w - .4, st.y * h - 5, .8, 10); } }
    dx.clearRect(0, 0, w, h); for (const d of dust) { d.y -= d.v; d.x += Math.sin(s + d.p) * .0004; if (d.y < .28) { d.y = bookTop() + Math.random() * .02; d.x = .42 + Math.random() * .16; } const fade = Math.min(1, (d.y - .28) / .15); dx.globalAlpha = fade * (.5 + .5 * Math.sin(s * 2 + d.p)); dx.fillStyle = '#ffd98a'; dx.shadowColor = '#ffcf6a'; dx.shadowBlur = 8; dx.beginPath(); dx.arc(d.x * w, d.y * h, d.r, 0, 6.28); dx.fill(); }
    { const r = BK.getBoundingClientRect(), p = dc.getBoundingClientRect(); const ox = r.left - p.left + r.width * .5, oy = r.top - p.top + r.height * .45, L = r.width * .5, k = r.width / 380;
      dx.save(); dx.globalCompositeOperation = 'lighter';
      for (const q of SD) { const u = (s * q.v + q.o) % 1, y = oy - u * L, amp = (3 + u * 18) * k, x = ox + r.width * .03 * u + q.dir * amp * Math.sin(u * 7 - s * 1.2 + q.ph) + q.j * k * (1 + u * 4);
        const tw = .45 + .55 * Math.abs(Math.sin(s * q.tw + q.ph)); const a = Math.min(1, u * 8) * Math.pow(1 - u, 1.3) * tw;
        dx.globalAlpha = a; dx.fillStyle = q.c; dx.shadowColor = '#ffc24f'; dx.shadowBlur = 10; dx.beginPath(); dx.arc(x, y, q.r * k, 0, 6.28); dx.fill();
        if (q.r > 1.25 && tw > .9) { dx.globalAlpha = a * .8; dx.fillStyle = '#fff6d8'; dx.fillRect(x - 4 * k, y - .35, 8 * k, .7); dx.fillRect(x - .35, y - 4 * k, .7, 8 * k); } }
      dx.restore(); }
    { const n = Math.sin(s * 7.3) * .5 + Math.sin(s * 11.9 + 1.3) * .3 + Math.sin(s * 3.1 + .4) * .4;
      if (!gust || s > gust.end) { if (Math.random() < .004) gust = { start: s, end: s + .9 }; }
      const gu = gust && s < gust.end ? Math.sin((s - gust.start) / .9 * Math.PI) : 0, flick = gu * Math.sin(s * 38) * .5;
      LT.style.setProperty('--lo', (.78 + .12 * n - .25 * gu * (0.5 + 0.5 * Math.sin(s * 31))).toFixed(3));
      LT.style.setProperty('--ls', (1 + .04 * n + .05 * flick).toFixed(3));
      LT.style.setProperty('--lx', ((Math.sin(s * 5.7) * .6 + gu * Math.sin(s * 24) * 2.2)).toFixed(2) + 'px'); }
    if (!reduce) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return () => { alive = false; off1(); off2(); };
}
