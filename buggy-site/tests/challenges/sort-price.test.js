import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sortByPrice } from '../../src/sort.js';

const sample = () => [
  { id: 'a', price: '100.00' },
  { id: 'b', price: '20.00' },
  { id: 'c', price: '9.99' },
  { id: 'd', price: '20.00' },
  { id: 'e', price: '249.90' }
];
const ids = (list) => list.map((p) => p.id).join('');

test('ordena numéricamente, no como texto', () => {
  assert.equal(ids(sortByPrice(sample(), 'asc')), 'cbdae');
});

test('orden descendente', () => {
  assert.equal(ids(sortByPrice(sample(), 'desc')), 'eabdc');
});

test('es estable: empates mantienen el orden original', () => {
  assert.equal(ids(sortByPrice(sample(), 'asc')).slice(1, 3), 'bd');
  assert.equal(ids(sortByPrice(sample(), 'desc')).slice(2, 4), 'bd');
});

test('no modifica el arreglo original', () => {
  const original = sample();
  sortByPrice(original, 'asc');
  assert.equal(ids(original), 'abcde');
});
