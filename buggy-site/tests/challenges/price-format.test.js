import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatPrice } from '../../src/format.js';

test('siempre muestra 2 decimales', () => {
  assert.equal(formatPrice(10.5), '$10.50');
  assert.equal(formatPrice(3), '$3.00');
});

test('separa miles con coma', () => {
  assert.equal(formatPrice(1234.5), '$1,234.50');
});

test('acepta precios que vienen como string', () => {
  assert.equal(formatPrice('19.5'), '$19.50');
});
