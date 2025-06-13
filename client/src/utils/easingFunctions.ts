export function easeInCubic(x: number): number {
  return x * x * x;
}
export function easeOutQuad(x: number): number {
  return 1 - (1 - x) * (1 - x);
}
export function easeInSine(x: number): number {
  return 1 - Math.cos((x * Math.PI) / 2);
}
export function easeInExpo(x: number): number {
  return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
}
export function easeInCirc(x: number): number {
  return 1 - Math.sqrt(1 - Math.pow(x, 2));
}
export function linear(x: number): number {
  return x;
}
