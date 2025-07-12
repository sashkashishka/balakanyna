import assert from 'node:assert/strict';

export function assertCommonTaskProps(body, payload) {
  assert.equal(typeof body.id, 'number');
  assert.equal(body.hash.length, 8);
  assert.equal(body.name, payload.name);
  assert.equal(body.name_normalized, payload.name.toLowerCase());
  assert.equal(body.type, payload.type);

  assert.equal(isNaN(new Date(body.createdAt)), false);
  assert.equal(isNaN(new Date(body.updatedAt)), false);
  assert.equal(Object.keys(body).length, 8);
}
