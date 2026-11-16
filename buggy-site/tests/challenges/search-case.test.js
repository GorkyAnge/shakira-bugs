import { test } from 'node:test';
import assert from 'node:assert/strict';
import { searchProducts } from '../../src/search.js';
import { products } from '../../src/data.js';

const names = (list) => list.map((p) => p.name);

test('no distingue mayúsculas/minúsculas', () => {
  assert.deepEqual(names(searchProducts(products, 'guitarra')), ['Guitarra Acústica Barranquilla']);
});

test('ignora espacios al inicio y al final', () => {
  assert.deepEqual(names(searchProducts(products, '  LOBA ')), ['Pandereta Loba', 'Sudadera Loba']);
});

test('ignora tildes (acustica encuentra Acústica)', () => {
  assert.deepEqual(names(searchProducts(products, 'acustica')), ['Guitarra Acústica Barranquilla']);
});

test('búsqueda vacía devuelve todo', () => {
  assert.equal(searchProducts(products, '   ').length, products.length);
});
