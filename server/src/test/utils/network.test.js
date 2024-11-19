import { strict as assert } from 'node:assert';
import { describe, test } from 'node:test';
import { getSearchParams } from '../../utils/network.js';

describe('getSearchParams', () => {
  test('should parse a simple query string correctly', () => {
    const url = new URL('https://example.com/?name=John&age=30');
    const result = getSearchParams(url);
    const expected = {
      name: 'John',
      age: '30',
    };
    assert.deepStrictEqual(result, expected);
  });

  test('should parse arrays correctly when the key ends with "[]"', () => {
    const url = new URL('https://example.com/?tags[]=food&tags[]=drink');
    const result = getSearchParams(url);
    const expected = {
      tags: ['food', 'drink'],
    };
    assert.deepStrictEqual(result, expected);
  });

  test('should handle mixed simple and array parameters', () => {
    const url = new URL(
      'https://example.com/?name=John&tags[]=food&tags[]=drink',
    );
    const result = getSearchParams(url);
    const expected = {
      name: 'John',
      tags: ['food', 'drink'],
    };
    assert.deepStrictEqual(result, expected);
  });

  test('should handle multiple array parameters with different keys', () => {
    const url = new URL(
      'https://example.com/?tags[]=food&tags[]=drink&categories[]=fruit&categories[]=vegetable',
    );
    const result = getSearchParams(url);
    const expected = {
      tags: ['food', 'drink'],
      categories: ['fruit', 'vegetable'],
    };
    assert.deepStrictEqual(result, expected);
  });

  test('should return an empty object for an empty URL', () => {
    const url = new URL('https://example.com/');
    const result = getSearchParams(url);
    const expected = {};
    assert.deepStrictEqual(result, expected);
  });

  test('should handle URL with a single array parameter correctly', () => {
    const url = new URL('https://example.com/?ids[]=1');
    const result = getSearchParams(url);
    const expected = {
      ids: [1],
    };
    assert.deepStrictEqual(result, expected);
  });

  test('should cast string to number type if possible', () => {
    const url = new URL("https://example.com/?ids[]=1&ids[]=foo");
    const result = getSearchParams(url);
    const expected = {
      ids: [1, 'foo'],
    };
    assert.deepStrictEqual(result, expected);
  });
});
