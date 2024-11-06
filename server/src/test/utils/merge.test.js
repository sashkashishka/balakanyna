import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { mergeDeep } from '../../utils/merge.js';

test('Shallow merge with non-overlapping properties', () => {
  const result = mergeDeep({ a: 1 }, { b: 2 });
  assert.equal(result.a, 1);
  assert.equal(result.b, 2);
});

test('Deep merge with nested objects', () => {
  const result = mergeDeep({ a: { b: 1 } }, { a: { c: 2 } });
  assert.equal(result.a.b, 1);
  assert.equal(result.a.c, 2);
});

test('Overwrite primitive value with object', () => {
  const result = mergeDeep({ a: 1 }, { a: { b: 2 } });
  assert.deepEqual(result.a, { b: 2 });
});

test('Overwrite object with primitive value', () => {
  const result = mergeDeep({ a: { b: 1 } }, { a: 2 });
  assert.equal(result.a, 2);
});

test('Merge arrays (should concatenate arrays)', () => {
  const result = mergeDeep({ a: [1, 2] }, { a: [3, 4] });
  assert.deepEqual(result.a, [1, 2, 3, 4]);
});

test('Merge multiple levels deep', () => {
  const result = mergeDeep({ a: { b: { c: 1 } } }, { a: { b: { d: 2 } } });
  assert.equal(result.a.b.c, 1);
  assert.equal(result.a.b.d, 2);
});

test('Non-object source, should replace target', () => {
  const result = mergeDeep({ a: { b: 1 } }, { a: null });
  assert.equal(result.a, null);
});

test('Handling null values in source and target', () => {
  const result = mergeDeep({ a: null }, { a: { b: 2 } });
  assert.deepEqual(result.a, { b: 2 });
});

test('Source with additional properties, should be added to target', () => {
  const result = mergeDeep({ a: 1 }, { b: { c: 2 } });
  assert.equal(result.a, 1);
  assert.deepEqual(result.b, { c: 2 });
});

test('Empty source, should return target as-is', () => {
  const result = mergeDeep({ a: { b: 1 } }, {});
  assert.deepEqual(result, { a: { b: 1 } });
});

test('Empty target, should copy source', () => {
  const result = mergeDeep({}, { a: { b: 1 } });
  assert.deepEqual(result, { a: { b: 1 } });
});
