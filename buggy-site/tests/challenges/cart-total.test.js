import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cartTotal } from '../../src/cart.js';

test('multiplica precio por cantidad', () => {
  assert.equal(cartTotal([{ price: 10, quantity: 3 }, { price: 5, quantity: 2 }]), 40);
});

test('carrito vacío vale 0', () => {
  assert.equal(cartTotal([]), 0);
});

test('redondea a 2 decimales (adiós 0.30000000000000004)', () => {
  assert.equal(cartTotal([{ price: 0.1, quantity: 1 }, { price: 0.2, quantity: 1 }]), 0.3);
});
