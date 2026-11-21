// Varázsműhely – FEJLESZTŐI PRÓBAOLDAL (#varazsteszt). Sehonnan nincs rá link, és a szerverfüggvény jelszót kér (DEV_PASS),
// így más nem tudja a krediteket elhasználni. A megjelenés végleges változatában ez az oldal nem lesz benne.
// Egy saját fotóból ugyanabban a stílusban több képmodellel is kép készül, a jóváhagyott mintakép mellé téve – így választunk modellt.
import { SUPABASE_URL, SUPABASE_KEY, session } from './auth.js?v=0.6.56';
import { activePet } from './pets.js?v=0.6.56';

const V = '0.6.56';
const STYLES = [['kawaii', 'Pasztell mesekönyv'], ['clay', '3D gyurmafigura'], ['kepregeny', 'Képregényhős'], ['pixel', 'Pixel art'],
  ['mexiko', 'Mexikói virágünnep'], ['ukiyoe', 'Ukiyo-e'], ['karacsony', 'Karácsony'], ['ikon', 'Arany ikonportré'], ['boszi', 'Boszorkányos'],
  ['mandala', 'Mandala tusrajz'], ['viking', 'Viking harcos'], ['steampunk', 'Steampunk'], ['tarot', 'Tarotkártya']];
// ár: csak a Nano Banana 2-é ellenőrzött (fal.ai modelloldal, 1K kép); a többit a fal.ai Usage oldalán nézzük meg az első próba után
const MODELS = [['nb2', 'Nano Banana 2', '0,08 $ / kép'], ['flux2pro', 'FLUX.2 Pro', 'ár: fal.ai Usage'], ['kontext', 'FLUX Kontext Pro', 'ár: fal.ai Usage']];
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
  const pet = activePet(); const sp0 = pet && pet.species === 'cat' ? 'cat' : 'dog';
  box.innerHTML = `<style>
#devlab{position:fixed;inset:0;z-index:9999;overflow:auto;background:#1a1030;color:#f3e9d2;font:15px/1.4 system-ui,sans-serif;padding:16px 14px 60px}
#devlab h1{font-size:19px;margin:0 0 4px;color:#e8c977}#devlab p.n{margin:0 0 14px;opacity:.75;font-size:13px}
#devlab label{display:block;margin:12px 0 4px;color:#e8c977;font-size:13px}
#devlab input,#devlab select{width:100%;box-sizing:border-box;padding:10px;border-radius:10px;border:1px solid #6b4fa0;background:#2a1b48;color:#fff;font-size:16px}
#devlab .ms label{display:flex;gap:8px;align-items:center;color:#f3e9d2;font-size:15px;margin:6px 0}#devlab .ms input{width:auto}
#devlab button.go{margin-top:16px;width:100%;padding:14px;border:0;border-radius:12px;background:linear-gradient(#e8c977,#b8913a);color:#2a1b00;font-weight:700;font-size:17px}
#devlab button.go:disabled{opacity:.5}#devlab .x{position:fixed;top:10px;right:12px;background:#2a1b48;color:#fff;border:1px solid #6b4fa0;border-radius:50%;width:38px;height:38px;font-size:18px}
#devlab .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-top:16px}
#devlab figure{margin:0;background:#2a1b48;border-radius:12px;padding:6px}#devlab figure img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;display:block;background:#120a22}
#devlab figcaption{font-size:12px;padding:4px 2px 0}#devlab .err{color:#ff9a9a}#devlab .prev{max-width:150px;border-radius:10px;margin-top:8px;display:block}
</style>
<button class="x" id="dlx" type="button" aria-label="Bezár">✕</button>
<h1>Varázsműhely – próbaoldal</h1>
<p class="n">Csak fejlesztéshez. Minden kép a fal.ai kreditből fogy.</p>
<label for="dlpw">Próbaoldal jelszava</label><input id="dlpw" type="password" autocomplete="off" value="${esc(get('pa.devpass'))}">
<label for="dlf">Fotó a kedvencről</label><input id="dlf" type="file" accept="image/*"><img class="prev" id="dlprev" alt="" hidden>
<label for="dlsp">Faj</label><select id="dlsp"><option value="dog"${sp0 === 'dog' ? ' selected' : ''}>Kutya</option><option value="cat"${sp0 === 'cat' ? ' selected' : ''}>Macska</option></select>
<label for="dlst">Stílus</label><select id="dlst">${STYLES.map(([id, n]) => `<option value="${id}">${esc(n)}</option>`).join('')}</select>
<label>Képmodellek</label><div class="ms">${MODELS.map(([id, n, p], i) => `<label><input type="checkbox" value="${id}"${i === 0 ? ' checked' : ''}> ${esc(n)} <small>(${p})</small></label>`).join('')}</div>
<button class="go" id="dlgo" type="button">Képek készítése</button>
<div class="grid" id="dlout"></div>`;
  document.body.appendChild(box);
  const q = (s) => box.querySelector(s);
  let photo = '';
  q('#dlx').onclick = closeLab;
  q('#dlf').onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { photo = await shrink(f); q('#dlprev').src = photo; q('#dlprev').hidden = false; } catch { photo = ''; alertIn('A fájl nem olvasható képként.'); } };
  const alertIn = (m) => { q('#dlout').insertAdjacentHTML('afterbegin', `<p class="err">${esc(m)}</p>`); };
  q('#dlgo').onclick = async () => {
    const pw = q('#dlpw').value.trim(); put('pa.devpass', pw);
    const style = q('#dlst').value, species = q('#dlsp').value;
    const models = [...box.querySelectorAll('.ms input:checked')].map((i) => i.value);
    const out = q('#dlout'); out.innerHTML = '';
    if (!pw) return alertIn('Add meg a jelszót.');
    if (!photo) return alertIn('Válassz egy fotót.');
    if (!models.length) return alertIn('Jelölj be legalább egy modellt.');
    const s = await session(); if (!s) return alertIn('Nincs kapcsolat a szerverrel (internet?).');
    const sample = `assets/stilusok/${style}_${species === 'cat' ? 'macska' : 'kutya'}.webp?v=${V}`;
    out.innerHTML = `<figure><img src="${sample}" alt=""><figcaption><b>Jóváhagyott minta</b></figcaption></figure>`
      + models.map((m) => `<figure id="dl_${m}"><img alt=""><figcaption>${esc(MODELS.find((x) => x[0] === m)[1])}: készül…</figcaption></figure>`).join('');
    q('#dlgo').disabled = true;
    await Promise.all(models.map(async (m) => {
      const fig = q('#dl_' + m); const cap = fig.querySelector('figcaption'); const name = MODELS.find((x) => x[0] === m)[1];
      try {
        const r = await fetch(SUPABASE_URL + '/functions/v1/varazs', { method: 'POST',
          headers: { Authorization: 'Bearer ' + s.access_token, apikey: SUPABASE_KEY, 'Content-Type': 'application/json', 'x-pa-dev': pw },
          body: JSON.stringify({ style, species, model: m, image: photo }) });
        const d = await r.json().catch(() => ({}));
        if (!r.ok || !d.image) { cap.innerHTML = `<span class="err">${esc(name)}: hiba (${r.status}) ${esc(d.error || '')} ${esc(d.detail ? JSON.stringify(d.detail).slice(0, 200) : '')}</span>`; return; }
        fig.querySelector('img').src = d.image; cap.innerHTML = `<b>${esc(name)}</b> · ${(d.ms / 1000).toFixed(1)} mp`;
      } catch (e) { cap.innerHTML = `<span class="err">${esc(name)}: nem érhető el a szerver (${esc(e.message)})</span>`; }
    }));
    q('#dlgo').disabled = false;
  };
}
export function closeLab() { if (box) { box.remove(); box = null; } if (location.hash === '#varazsteszt') history.replaceState(null, '', '#home'); }
