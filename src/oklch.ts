// OKLab/OKLCH <-> sRGB. Design colors in OKLCH; emit hex.
function srgbToLin(c: number): number {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
function linToSrgb(c: number): number {
  c = Math.max(0, Math.min(1, c));
  const s = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(s * 255)));
}
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** OKLCH (L 0-1, C, H degrees) -> #rrggbb, reducing chroma until in sRGB gamut. */
export function oklchToHex(L: number, C: number, H: number): string {
  const hr = (H * Math.PI) / 180;
  for (;;) {
    const a = C * Math.cos(hr), b = C * Math.sin(hr);
    const l_ = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m_ = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s_ = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    const r = 4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
    const g = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
    const bch = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_;
    const oog = [r, g, bch].some((x) => x < -0.0006 || x > 1.0006);
    if (oog && C > 0.002) { C -= 0.004; continue; }
    const to2 = (n: number) => linToSrgb(n).toString(16).padStart(2, "0");
    return `#${to2(r)}${to2(g)}${to2(bch)}`;
  }
}

/** sRGB hex -> OKLCH (inverse of oklchToHex; for gates/audits, not generation). */
export function hexToOklch(hex: string): { L: number; C: number; H: number } {
  const n = parseInt(hex.slice(1), 16);
  const toLinear = (v: number): number => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const r = toLinear((n >> 16) & 255);
  const g = toLinear((n >> 8) & 255);
  const b = toLinear(n & 255);
  // sRGB linear -> LMS (cube root space) — inverse of the 4.076/−3.307/… forward matrix
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  // LMS -> OKLab — inverse of the OKLCH->OKLab cube-and-multiply forward step
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(a, bb);
  const H = ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360;
  return { L, C, H };
}

/** The "pink machine": (a) rose/fuchsia at visible chroma+lightness, (b) WASHED reds — red-family
 *  hue so light and desaturated it reads pink (the pre-v2 keyword #fb9795). Syntax slots are gated
 *  on this; chrome (signature) is exempt.
 *
 *  Probed values: #fb9795 → {L≈0.780, C≈0.121, H≈21.4}  (washed red gate: L>0.72, C<0.13, H∈[12,45))
 *                 #f78be2 → {L≈0.780, C≈0.167, H≈334.7} (fuchsia gate: H≥320, C>0.06, L>0.72) */
export function isPinkish(hex: string): boolean {
  const { L, C, H } = hexToOklch(hex);
  // Rose/fuchsia: hue wraps around 0° into the magenta/pink zone at visible chroma + lightness
  const fuchsia = (H >= 320 || H < 12) && C > 0.06 && L > 0.72;
  // Washed red: red-family hue (12–45°) too light AND too desaturated — reads pink, not red
  const washedRed = H >= 12 && H < 45 && L > 0.72 && C < 0.13;
  return fuchsia || washedRed;
}

export function relLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
}
export function contrastRatio(a: string, b: string): number {
  const la = relLuminance(a), lb = relLuminance(b);
  const hi = Math.max(la, lb), lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}
