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

export function relLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(srgbToLin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrastRatio(a: string, b: string): number {
  const la = relLuminance(a), lb = relLuminance(b);
  const hi = Math.max(la, lb), lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}
