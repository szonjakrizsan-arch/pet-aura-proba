// Measured values come from real pixels; chakra scores are a playful, deterministic interpretation.
import { hash } from './cosmos.js?v=0.6.52';
function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
  let h = 0; if (d) { h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360; }
  return { h, s: d ? d / (1 - Math.abs(2 * l - 1)) : 0, l };
}
export function hueName({ h, s, l }) {
  if (s < 0.18 || l < 0.1 || l > 0.92) return 'neutral';
  if (h < 20 || h >= 335) return 'red'; if (h < 70) return 'yellow'; if (h < 170) return 'green'; if (h < 255) return 'blue'; return 'purple';
}
// data: RGBA pixels of w*h. Background = outer border band.
export function analyze(data, w, h) {
  let n = 0, sum = 0, sq = 0, br = 0, bg = 0, bb = 0, bn = 0; const band = Math.max(1, Math.round(Math.min(w, h) * 0.12));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4, L = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    n++; sum += L; sq += L * L;
    if (x < band || y < band || x >= w - band || y >= h - band) { br += data[i]; bg += data[i + 1]; bb += data[i + 2]; bn++; }
  }
  const mean = sum / n, sd = Math.sqrt(Math.max(0, sq / n - mean * mean));
  const rgb = [br / bn, bg / bn, bb / bn];
  return { brightness: Math.round(mean / 2.55), contrast: Math.min(100, Math.round(sd / 0.64)), bgHue: hueName(rgb2hsl(...rgb)), bgRgb: rgb.map(Math.round) };
}
export function chakraScores(obs, seedText, moonFrac) {
  let s = hash(seedText + obs.brightness) || 1;
  const rnd = () => { s = (Math.imul(s ^ (s >>> 15), 2246822507) + 1) >>> 0; return (s % 1000) / 1000; };
  const moon = Math.round(Math.sin(moonFrac * Math.PI * 2) * 6);
  const sc = Array.from({ length: 7 }, () => Math.round(50 + rnd() * 40 + moon));
  if (obs.bgHue === 'red') sc[0] -= 30; if (obs.bgHue === 'green') sc[3] += 10; if (obs.bgHue === 'blue') sc[4] += 10;
  sc[2] += Math.round((obs.brightness - 50) / 8); sc[5] -= Math.round(obs.contrast / 10);
  return sc.map((v) => Math.max(5, Math.min(99, v)));
}
