function ch(s: string): [number, number, number] {
  return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
}
/** Linear RGB-ish blend of two #rrggbb by t in [0,1] (t=0 -> a, t=1 -> b). */
export function blend(a: string, b: string, t: number): string {
  const [r1, g1, b1] = ch(a), [r2, g2, b2] = ch(b);
  const m = (x: number, y: number) => Math.round(x * (1 - t) + y * t).toString(16).padStart(2, "0");
  return `#${m(r1, r2)}${m(g1, g2)}${m(b1, b2)}`;
}
/** Desaturate an accent toward the neutral foreground ("sand"/soft). */
export const muteHex = (hex: string, fg0: string): string => blend(hex, fg0, 0.30);
