import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidEmail } from '../../src/validation.js';

test('acepta correos reales', () => {
  for (const email of ['ana@correo.com', 'Ana.Perez+tienda@mail.co', 'dev_01@sub.dominio.org']) {
    assert.equal(isValidEmail(email), true, `debería aceptar ${email}`);
  }
});

test('rechaza correos inválidos', () => {
  for (const email of ['ana@correo', 'ana correo@mail.com', '@mail.com', 'ana@.com', 'ana@@mail.com', '', 'ana@mail.com ']) {
    assert.equal(isValidEmail(email), false, `debería rechazar "${email}"`);
  }
});
