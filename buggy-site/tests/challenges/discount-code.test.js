import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyDiscount } from '../../src/discount.js';

test('SHAKIRA20 descuenta el 20%', () => {
  assert.equal(applyDiscount(200, 'SHAKIRA20'), 160);
  assert.equal(applyDiscount(49.99, 'SHAKIRA20'), 39.99);
});

test('BIENVENIDA5 descuenta 5 fijos sin dejar el total negativo', () => {
  assert.equal(applyDiscount(30, 'BIENVENIDA5'), 25);
  assert.equal(applyDiscount(3, 'BIENVENIDA5'), 0);
});

test('el código no distingue mayúsculas y tolera espacios', () => {
  assert.equal(applyDiscount(100, '  shakira20 '), 80);
});

test('código desconocido o vacío no cambia el total', () => {
  assert.equal(applyDiscount(100, 'GRATIS100'), 100);
  assert.equal(applyDiscount(100, undefined), 100);
});
