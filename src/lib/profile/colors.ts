// Color helpers for the profile particles.

type Rgb = [number, number, number];

export function hexToRgb(hex: string): Rgb {
  const value = /^#?([0-9a-f]{6})$/i.exec(hex)?.[1] ?? "b9a7ff";
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255) as Rgb;
}

function rgbToHsl([r, g, b]: Rgb): Rgb {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

function hslToRgb([h, s, l]: Rgb): Rgb {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}

const WARM_SHIFT = 75; // lilac → pink, as in the Figma

/** Particle color (0–1 RGB): white for stars, rain and snow; petals take a warm tone of the accent. */
export function particleColor(particles: string, accentHex: string): Rgb {
  if (particles !== "petals") return [1, 1, 1];
  const [h, s] = rgbToHsl(hexToRgb(accentHex));
  return hslToRgb([(h + WARM_SHIFT) % 360, Math.min(Math.max(s, 0.35), 0.82), 0.8]);
}
