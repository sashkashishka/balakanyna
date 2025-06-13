/* eslint-disable @typescript-eslint/no-explicit-any */
export function compose<T1, T2, T3, T4, T5, T6, T7>(
  ...func: [
    fnLast: (a: any) => T7,
    ...func: Array<(a: any) => any>,
    f5: (x: T5) => T6,
    f4: (x: T4) => T5,
    f3: (x: T3) => T4,
    f2: (x: T2) => T3,
    f1: (x: T1) => T2,
  ]
): (x: T1) => T7;
export function compose<T1, T2, T3, T4, T5, T6>(
  f5: (x: T5) => T6,
  f4: (x: T4) => T5,
  f3: (x: T3) => T4,
  f2: (x: T2) => T3,
  f1: (x: T1) => T2,
): (x: T1) => T6;
export function compose<T1, T2, T3, T4, T5>(
  f4: (x: T4) => T5,
  f3: (x: T3) => T4,
  f2: (x: T2) => T3,
  f1: (x: T1) => T2,
): (x: T1) => T5;
export function compose<T1, T2, T3, T4>(
  f3: (x: T3) => T4,
  f2: (x: T2) => T3,
  f1: (x: T1) => T2,
): (x: T1) => T4;
export function compose<T1, T2, T3>(
  f2: (x: T2) => T3,
  f1: (x: T1) => T2,
): (x: T1) => T3;
export function compose<T1, T2>(f1: (x: T1) => T2): (x: T1) => T2;
export function compose(...fns: any[]) {
  return <TState = unknown>(state: TState) =>
    fns.reduceRight((acc, fn) => fn(acc), state);
}
