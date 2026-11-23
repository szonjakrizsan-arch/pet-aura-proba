// Varázsműhely – FEJLESZTŐI PRÓBAOLDAL (varazsteszt.html – külön lap, hogy alatta ne fusson az app). Sehonnan nincs rá link, és a szerverfüggvény jelszót kér (DEV_PASS),
// így más nem tudja a krediteket elhasználni. A megjelenés végleges változatában ez az oldal nem lesz benne.
// Egy saját fotóból ugyanabban a stílusban több képmodellel is kép készül, a jóváhagyott mintakép mellé téve – így választunk modellt.
import { SUPABASE_URL, SUPABASE_KEY, session } from './auth.js?v=0.6.65';

const V = '0.6.65';
const STYLES = [['kawaii', 'Mesekönyv'], ['clay', '3D gyurmafigura'], ['kepregeny', 'Képregényhős'], ['pixel', 'Pixel art'],
  ['mexiko', 'Mexikói virágünnep'], ['ukiyoe', 'Ukiyo-e'], ['karacsony', 'Karácsony'], ['ikon', 'Arany ikonportré'], ['boszi', 'Boszorkányos'],
  ['mandala', 'Mandala tusrajz'], ['viking', 'Viking harcos'], ['steampunk', 'Steampunk'], ['tarot', 'Tarotkártya']];
// ár: csak a Nano Banana 2-é ellenőrzött (fal.ai modelloldal, 1K kép); a többit a fal.ai Usage oldalán nézzük meg az első próba után
const MODELS = [['nb2', 'Nano Banana 2', '0,08 $ / kép'], ['nbpro', 'Nano Banana Pro', '0,15 $ / kép'], ['flux2pro', 'FLUX.2 Pro', 'ár: fal.ai Usage'], ['kontext', 'FLUX Kontext Pro', 'ár: fal.ai Usage']];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const get = (k) => { try { return localStorage.getItem(k) || ''; } catch { return ''; } };
const put = (k, v) => { try { localStorage.setItem(k, v); } catch { /* nincs tárhely */ } };

// a fotó kicsinyítése a telefonon (leghosszabb oldal 1024 px, JPEG) – kisebb feltöltés, gyorsabb válasz
async function shrink(file) {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, 1024 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.9);
}

let box = null;
export function openLab() {
  if (box) return;
  box = document.createElement('div'); box.id = 'devlab';
  let sp0 = 'dog'; try { const L = JSON.parse(localStorage.getItem('pets') || '[]'), a = localStorage.getItem('activePet'); const pet = (Array.isArray(L) ? L : []).find((x) => x.id === a); if (pet && pet.species === 'cat') sp0 = 'cat'; } catch { /* nincs mentett kedvenc */ }
  box.innerHTML = `<style>
#devlab{min-height:100vh;box-sizing:border-box;background:#1a1030;color:#f3e9d2;font:15px/1.4 system-ui,sans-serif;padding:16px 14px 60px}
#devlab h1{font-size:19px;margin:0 0 4px;color:#e8c977}#devlab p.n{margin:0 0 14px;opacity:.75;font-size:13px}
#devlab label{display:block;margin:12px 0 4px;color:#e8c977;font-size:13px}
#devlab input,#devlab select{width:100%;box-sizing:border-box;padding:10px;border-radius:10px;border:1px solid #6b4fa0;background:#2a1b48;color:#fff;font-size:16px}
#devlab .ms label{display:flex;gap:8px;align-items:center;color:#f3e9d2;font-size:15px;margin:6px 0}#devlab .ms input{width:auto}
#devlab .go{margin-top:16px;width:100%;padding:14px;border:0;border-radius:12px;background:linear-gradient(#e8c977,#b8913a);color:#2a1b00;font-weight:700;font-size:17px}
#devlab .go:disabled{opacity:.5}#devlab .x{position:fixed;top:10px;right:12px;background:#2a1b48;color:#fff;border:1px solid #6b4fa0;border-radius:50%;width:38px;height:38px;font-size:18px}
#devlab .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-top:16px}
#devlab figure{margin:0;background:#2a1b48;border-radius:12px;padding:6px}#devlab figure img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;display:block;background:#120a22}
#devlab figcaption{font-size:12px;padding:4px 2px 0}#devlab .err{color:#ff9a9a}#devlab .prev{max-width:150px;border-radius:10px;margin-top:8px;display:block}
#devlab figure img{cursor:zoom-in}#devlab .zoom{position:fixed;inset:0;z-index:2;background:#0b0616f2;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px;gap:12px}#devlab .zoom img{max-width:100%;max-height:78vh;object-fit:contain;border-radius:10px}#devlab .zb{display:flex;gap:10px;width:100%;max-width:420px}#devlab .zb .go{margin:0;flex:1;text-align:center;text-decoration:none;display:block}
</style>
<button class="x" id="dlx" type="button" aria-label="Bezár">✕</button>
<h1>Varázsműhely – próbaoldal</h1>
<p class="n">Csak fejlesztéshez. Minden kép a fal.ai kreditből fogy. Koppints egy képre a nagyításhoz.</p>
<label for="dlpw">Próbaoldal jelszava</label><input id="dlpw" type="password" autocomplete="off" value="${esc(get('pa.devpass'))}">
<label for="dlf">Fotó a kedvencről</label><input id="dlf" type="file" accept="image/*"><p class="n" id="dlst2" aria-live="polite"></p><img class="prev" id="dlprev" alt="" hidden>
<label for="dlsp">Faj</label><select id="dlsp"><option value="dog"${sp0 === 'dog' ? ' selected' : ''}>Kutya</option><option value="cat"${sp0 === 'cat' ? ' selected' : ''}>Macska</option></select>
<label for="dlst">Stílus</label><select id="dlst">${STYLES.map(([id, n]) => `<option value="${id}">${esc(n)}</option>`).join('')}<option value="ALL">Mind a 13 stílus (egymás után, csak az első bejelölt modellel)</option></select>
<label for="dlnt">Az állat egyedi jegyei (próba, angolul; üresen hagyható)</label><button class="go" id="dldesc" type="button" style="margin:0 0 8px;padding:10px;font-size:15px">Automatikus leírás készítése a fotóból</button><textarea id="dlnt" rows="9" style="width:100%;box-sizing:border-box;padding:10px;border-radius:10px;border:1px solid #6b4fa0;background:#2a1b48;color:#fff;font-size:15px"></textarea>
<label for="dlv">Utasítás</label><select id="dlv"><option value="clean" selected>Új tiszta utasítás (2026-11-23 este)</option><option value="base">Eredeti</option><option value="strict">Retusáló (próba)</option><option value="both">Mindkettő egymás mellett</option></select>
<label>Képmodellek</label><div class="ms">${MODELS.map(([id, n, p], i) => `<label><input type="checkbox" value="${id}"${i === 0 ? ' checked' : ''}> ${esc(n)} <small>(${p})</small></label>`).join('')}</div>
<button class="go" id="dlgo" type="button">Képek készítése</button>
<div class="grid" id="dlout"></div>`;
  document.body.appendChild(box);
  const q = (s) => box.querySelector(s);
  let photo = '';
  q('#dlx').onclick = closeLab;
  q('#dlf').onchange = async (e) => { const f = e.target.files[0]; if (!f) return; q('#dlst2').textContent = 'Fotó feldolgozása…'; q('#dlprev').hidden = true; try { photo = await shrink(f); q('#dlprev').src = photo; q('#dlprev').hidden = false; q('#dlst2').textContent = ''; } catch { photo = ''; q('#dlst2').textContent = ''; alertIn('A fájl nem olvasható képként.'); } };
  box.addEventListener('click', (e) => {
    const im = e.target.closest('figure img, #dlprev'); if (!im || !im.src) return;
    const z = document.createElement('div'); z.className = 'zoom';
    z.innerHTML = `<img src="${im.src}" alt=""><div class="zb"><button class="go" type="button">Bezár</button></div>`;
    z.querySelector('button').onclick = () => z.remove(); z.querySelector('img').onclick = () => z.remove();
    box.appendChild(z);
  });
  const alertIn = (m) => { q('#dlout').insertAdjacentHTML('afterbegin', `<p class="err">${esc(m)}</p>`); };
  q('#dldesc').onclick = async () => {
    const pw = q('#dlpw').value.trim(); put('pa.devpass', pw);
    if (!pw) return alertIn('Add meg a jelszót.');
    if (!photo) return alertIn('Válassz egy fotót.');
    const s = await session(); if (!s) return alertIn('Nincs kapcsolat a szerverrel (internet?).');
    const btn = q('#dldesc'); btn.disabled = true; btn.textContent = 'Leírás készül…';
    try {
      const r = await fetch(SUPABASE_URL + '/functions/v1/varazs', { method: 'POST',
        headers: { Authorization: 'Bearer ' + s.access_token, apikey: SUPABASE_KEY, 'Content-Type': 'application/json', 'x-pa-dev': pw },
        body: JSON.stringify({ action: 'describe', image: photo }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.description) alertIn(`Leírás: hiba (${r.status}) ${d.error || ''} ${d.detail ? JSON.stringify(d.detail).slice(0, 200) : ''}`);
      else q('#dlnt').value = d.description;
    } catch (e) { alertIn('Leírás: nem érhető el a szerver (' + e.message + ')'); }
    btn.disabled = false; btn.textContent = 'Automatikus leírás készítése a fotóból';
  };
  q('#dlgo').onclick = async () => {
    const pw = q('#dlpw').value.trim(); put('pa.devpass', pw);
    const style = q('#dlst').value, species = q('#dlsp').value, notes = q('#dlnt').value.trim();
    const models = [...box.querySelectorAll('.ms input:checked')].map((i) => i.value);
    const vsel = q('#dlv').value; const CLEAN = vsel === 'clean'; const variants = vsel === 'both' ? [false, true] : [vsel === 'strict'];
    const ALL = style === 'ALL'; const mname = (m) => MODELS.find((x) => x[0] === m)[1];
    // „Mind a 13”: minden stílus az első bejelölt modellel, a saját mintája mellett (stílusonként egy pár)
    const jobs = ALL ? STYLES.map(([sid, sn]) => ({ m: models[0], st: variants[0], sid, key: sid, name: sn + ' · ' + mname(models[0]) + (CLEAN ? ' · új' : variants[0] ? ' · retusáló' : '') }))
      : models.flatMap((m) => variants.map((st) => ({ m, st, sid: style, key: m + (st ? '_s' : '_b'), name: mname(m) + (CLEAN ? ' · új' : vsel === 'both' ? (st ? ' · retusáló' : ' · eredeti') : (st ? ' · retusáló' : '')) })));
    const out = q('#dlout'); out.innerHTML = '';
    if (!pw) return alertIn('Add meg a jelszót.');
    if (!photo) return alertIn('Válassz egy fotót.');
    if (!models.length) return alertIn('Jelölj be legalább egy modellt.');
    const s = await session(); if (!s) return alertIn('Nincs kapcsolat a szerverrel (internet?).');
    const sample = (sid) => `assets/stilusok/${sid}_${species === 'cat' ? 'macska' : 'kutya'}.webp?v=${V}`;
    const fig = (j) => `<figure id="dl_${j.key}"><img alt=""><figcaption>${esc(j.name)}: várakozik…</figcaption></figure>`;
    out.innerHTML = ALL ? jobs.map((j) => `<figure><img src="${sample(j.sid)}" alt=""><figcaption><b>${esc(STYLES.find((x) => x[0] === j.sid)[1])}</b> · minta</figcaption></figure>` + fig(j)).join('')
      : `<figure><img src="${sample(style)}" alt=""><figcaption><b>Jóváhagyott minta</b></figcaption></figure>` + jobs.map(fig).join('');
    q('#dlgo').disabled = true;
    // egyszerre legfeljebb 3 kérés megy (a fal.ai egy fióknál korlátozza a párhuzamos munkát)
    const queue = jobs.slice(); const one = async ({ m, st, sid, key, name }) => {
      const fig = q('#dl_' + key); const cap = fig.querySelector('figcaption'); cap.textContent = name + ': készül…';
      try {
        const r = await fetch(SUPABASE_URL + '/functions/v1/varazs', { method: 'POST',
          headers: { Authorization: 'Bearer ' + s.access_token, apikey: SUPABASE_KEY, 'Content-Type': 'application/json', 'x-pa-dev': pw },
          body: JSON.stringify({ style: sid, species, model: m, edit: st, clean: CLEAN, notes: CLEAN ? '' : notes, image: photo }) });
        const d = await r.json().catch(() => ({}));
        if (!r.ok || !d.image) { cap.innerHTML = `<span class="err">${esc(name)}: hiba (${r.status}) ${esc(d.error || '')} ${esc(d.detail ? JSON.stringify(d.detail).slice(0, 200) : '')}</span>`; return; }
        // a visszakapott hatalmas szöveges képet (data URI) fájlként kezeljük – így nem akadozik a telefon, és menthető
        const url = URL.createObjectURL(await (await fetch(d.image)).blob());
        const im = fig.querySelector('img'); im.src = url; im.dataset.name = `varazs_${sid}_${m}${st ? '_szigorubb' : ''}.jpg`;
        cap.innerHTML = `<b>${esc(name)}</b> · ${(d.ms / 1000).toFixed(1)} mp`;
      } catch (e) { cap.innerHTML = `<span class="err">${esc(name)}: nem érhető el a szerver (${esc(e.message)})</span>`; }
    };
    await Promise.all([0, 1, 2].map(async () => { while (queue.length) await one(queue.shift()); }));
    q('#dlgo').disabled = false;
  };
}
export function closeLab() { location.href = './#home'; }
