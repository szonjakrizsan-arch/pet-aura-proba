// Original inline illustrations + image slots. To use your own artwork, set a URL in ASSETS (e.g. hero: 'assets/hero.jpg').
export const ASSETS = { hero: '', cosmic: '', feng: '' };
export const CHAKRA_HUE = [350, 25, 50, 140, 200, 260, 300];
export const slot = (name, inner = '', cls = '') => `<div class="slot ${cls}" data-slot="${name}" style="${ASSETS[name] ? `--img:url(${ASSETS[name]})` : ''}">${inner}</div>`;
const S = (vb, body, cls = '') => `<svg class="${cls}" viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
export const catArt = () => S('0 0 120 120', '<path d="M24 52 30 14l26 20h8l26-20 6 38c4 8 4 18-2 28-8 14-24 22-38 22S34 94 26 80c-6-10-6-20-2-28Z"/><circle cx="46" cy="62" r="4" fill="currentColor"/><circle cx="74" cy="62" r="4" fill="currentColor"/><path d="M56 74h8l-4 5ZM60 79v6M52 86c4 3 12 3 16 0M20 70l18 4M20 80l18-2M100 70 82 74M100 80l-18-2"/>', 'art');
export const dogArt = () => S('0 0 120 120', '<path d="M38 30C24 28 14 40 16 62c1 8 6 12 12 10 6-3 8-16 10-42ZM82 30c14-2 24 10 22 32-1 8-6 12-12 10-6-3-8-16-10-42Z"/><path d="M38 30c8-6 36-6 44 0 6 20 4 40-4 54-6 10-30 10-36 0-8-14-10-34-4-54Z"/><circle cx="48" cy="56" r="4" fill="currentColor"/><circle cx="72" cy="56" r="4" fill="currentColor"/><ellipse cx="60" cy="72" rx="7" ry="5" fill="currentColor"/><path d="M60 77v6M52 86c4 4 12 4 16 0"/>', 'art');
export function moonSvg(frac, id = 'm') {
  const r = 42, k = Math.cos(frac * 2 * Math.PI), rx = r * Math.abs(k), wax = frac < 0.5, cres = k > 0;
  const outer = wax ? 1 : 0, inner = wax ? (cres ? 0 : 1) : (cres ? 1 : 0);
  const lit = `M50 ${50 - r}A${r} ${r} 0 0 ${outer} 50 ${50 + r}A${rx.toFixed(1)} ${r} 0 0 ${inner} 50 ${50 - r}Z`;
  return `<svg class="moon" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="${r}" fill="#2a2257"/><path d="${lit}" fill="#fff1c9"/><circle cx="50" cy="50" r="${r}" fill="none" stroke="#ffffff30" stroke-width="1.5"/></svg>`;
}
export const elementArt = (el) => ({
  fire: S('0 0 60 60', '<path d="M30 6c2 12 14 16 14 32a14 14 0 0 1-28 0c0-8 5-11 8-18 3 4 4 7 6 8 2-6 0-14 0-22Z"/>'),
  earth: S('0 0 60 60', '<path d="M4 48 22 18l10 16 8-10 16 24ZM4 52h52"/>'),
  air: S('0 0 60 60', '<path d="M6 22h30a8 8 0 1 0-8-8M6 34h42a8 8 0 1 1-8 8M6 46h20"/>'),
  water: S('0 0 60 60', '<path d="M30 6c10 14 16 22 16 30a16 16 0 0 1-32 0c0-8 6-16 16-30ZM16 52c5 4 9 4 14 0s9-4 14 0"/>') }[el]);
export function compassSvg(hue = 160, on = true) {
  const c = `hsl(${hue} 85% 68%)`;
  return `<svg class="compass" viewBox="0 0 160 160" aria-hidden="true"><rect x="14" y="14" width="132" height="132" rx="26" fill="#ffffff08" stroke="#ffffff30"/><path d="M14 80h132M80 14v132M33 33l94 94M127 33 33 127" stroke="#ffffff18"/><circle cx="80" cy="80" r="30" fill="none" stroke="#ffffff30"/>${on ? `<circle cx="80" cy="34" r="22" fill="${c}" opacity=".25"/><circle cx="80" cy="34" r="9" fill="${c}"/>` : '<circle cx="80" cy="34" r="9" fill="none" stroke="#ffffff55" stroke-dasharray="3 4"/>'}<path d="m80 66 7 14h-14Z" fill="#ffffffaa"/></svg>`;
}
export function ring(v, hue, label) {
  const R = 26, C = 2 * Math.PI * R;
  return `<div class="orb" style="--h:${hue}"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="${R}" class="trk"/><circle cx="32" cy="32" r="${R}" class="val" stroke-dasharray="${(C * v / 100).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 32 32)"/></svg><b>${label}</b></div>`;
}
export function curve(vals, hue) {
  const W = 300, H = 90, pts = vals.map((v, i) => [(i / (vals.length - 1)) * W, H - 10 - (v / 100) * (H - 24)]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
  return `<svg class="curve" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="cg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="hsl(${hue} 90% 70%)" stop-opacity=".5"/><stop offset="1" stop-color="hsl(${hue} 90% 70%)" stop-opacity="0"/></linearGradient></defs><path d="${d}L${W} ${H}L0 ${H}Z" fill="url(#cg)"/><path d="${d}" stroke="hsl(${hue} 90% 72%)" stroke-width="3" fill="none" stroke-linejoin="round"/></svg>`;
}
