// Color helpers for the profile background: the accent color plus two derived tones.

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

export function rgbToHex(rgb: Rgb) {
  return "#" + rgb.map((c) => Math.round(Math.max(0, Math.min(1, c)) * 255).toString(16).padStart(2, "0")).join("");
}

const WARM_SHIFT = 75; // lilac → pink, as in the Figma
const COOL_SHIFT = -78; // lilac → teal

/**
 * Accent plus two derived tones (warm = pink side, cool = teal side), each in a light
 * version (small glows, particles) and a dark saturated one (big lights). Calibrated so the
 * default lilac #B9A7FF reproduces Figma 9:603 (#7A2E5C / #3B2A7A / #1E5C5A). 0–1 RGB.
 */
export function accentPalette(accentHex: string) {
  const accent = hexToRgb(accentHex);
  const [h, s] = rgbToHsl(accent);
  const sat = Math.max(s, 0.35);
  const hue = (shift: number) => (h + shift + 360) % 360;
  return {
    accent,
    warm: hslToRgb([hue(WARM_SHIFT), Math.min(sat, 0.82), 0.8]),
    cool: hslToRgb([hue(COOL_SHIFT), Math.min(sat, 0.6), 0.73]),
    darkAccent: hslToRgb([h, Math.min(sat, 0.5), 0.32]),
    darkWarm: hslToRgb([hue(WARM_SHIFT), Math.min(sat, 0.45), 0.33]),
    darkCool: hslToRgb([hue(COOL_SHIFT), Math.min(sat, 0.5), 0.24]),
  };
}

/** CSS version of the background lights (same layout as the shader), as hex colors. */
export function cssLightColors(accentHex: string) {
  const p = accentPalette(accentHex);
  return {
    darkWarm: rgbToHex(p.darkWarm),
    darkAccent: rgbToHex(p.darkAccent),
    darkCool: rgbToHex(p.darkCool),
    warm: rgbToHex(p.warm),
    accent: rgbToHex(p.accent),
  };
}

/** [warm, accent, cool] as hex (OG image). */
export function accentHexPalette(accentHex: string): [string, string, string] {
  const p = accentPalette(accentHex);
  return [rgbToHex(p.warm), rgbToHex(p.accent), rgbToHex(p.cool)];
}
