import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimateDelivery } from '../../src/shipping.js';

// Reglas (todas las horas en UTC):
//  - Solo cuentan días hábiles (lunes a viernes).
//  - Pedidos después de las 14:00 o en fin de semana empiezan a contar el siguiente día hábil.
const at = (iso) => new Date(iso);

test('lunes por la mañana + 1 día hábil = martes', () => {
  assert.equal(estimateDelivery(at('2026-11-09T10:00:00Z'), 1), '2026-11-10');
});

test('viernes + 1 día hábil = lunes (se salta el fin de semana)', () => {
  assert.equal(estimateDelivery(at('2026-11-13T09:00:00Z'), 1), '2026-11-16');
});

test('pedido después de las 14:00 cuenta desde el día siguiente', () => {
  assert.equal(estimateDelivery(at('2026-11-09T15:30:00Z'), 1), '2026-11-11');
  assert.equal(estimateDelivery(at('2026-11-13T18:00:00Z'), 1), '2026-11-17');
});

test('pedido en sábado se procesa el lunes', () => {
  assert.equal(estimateDelivery(at('2026-11-14T08:00:00Z'), 1), '2026-11-17');
});

test('5 días hábiles = una semana', () => {
  assert.equal(estimateDelivery(at('2026-11-09T10:00:00Z'), 5), '2026-11-16');
});

test('no modifica la fecha recibida', () => {
  const d = at('2026-11-09T10:00:00Z');
  estimateDelivery(d, 3);
  assert.equal(d.toISOString(), '2026-11-09T10:00:00.000Z');
});
