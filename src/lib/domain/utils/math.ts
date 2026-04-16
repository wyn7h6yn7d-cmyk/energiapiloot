export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function sigmoid01(x: number) {
  return 1 / (1 + Math.exp(-x));
}
