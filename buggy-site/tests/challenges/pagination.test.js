import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paginate } from '../../src/pagination.js';

const items = Array.from({ length: 10 }, (_, i) => i + 1);

test('cada página tiene exactamente pageSize elementos', () => {
  assert.deepEqual(paginate(items, 1, 4).items, [1, 2, 3, 4]);
  assert.deepEqual(paginate(items, 2, 4).items, [5, 6, 7, 8]);
});

test('la última página trae lo que sobra', () => {
  assert.deepEqual(paginate(items, 3, 4).items, [9, 10]);
});

test('totalPages cuenta la página incompleta', () => {
  assert.equal(paginate(items, 1, 4).totalPages, 3);
  assert.equal(paginate(items, 1, 5).totalPages, 2);
  assert.equal(paginate([], 1, 5).totalPages, 1);
});

test('páginas fuera de rango se ajustan', () => {
  assert.equal(paginate(items, 99, 4).page, 3);
  assert.equal(paginate(items, 0, 4).page, 1);
  assert.deepEqual(paginate(items, 99, 4).items, [9, 10]);
});
