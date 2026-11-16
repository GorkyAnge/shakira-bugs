import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderReview } from '../../src/reviews.js';

test('escapa HTML en autor y texto (nada de XSS)', () => {
  const html = renderReview({ author: '<img src=x onerror="alert(1)">', rating: 3, text: "Tom & Jerry's <b>show</b>" });
  assert.ok(!html.includes('<img'), 'el autor no debe inyectar etiquetas');
  assert.ok(!html.includes('<b>'), 'el texto no debe inyectar etiquetas');
  assert.ok(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
  assert.ok(html.includes('Tom &amp; Jerry&#39;s &lt;b&gt;show&lt;/b&gt;'));
});

test('muestra 5 estrellas: llenas según rating y vacías el resto', () => {
  assert.ok(renderReview({ author: 'a', rating: 3, text: 't' }).includes('★★★☆☆'));
});

test('rating fuera de rango se limita entre 1 y 5', () => {
  assert.ok(renderReview({ author: 'a', rating: 9, text: 't' }).includes('★★★★★'));
  assert.ok(renderReview({ author: 'a', rating: -2, text: 't' }).includes('★☆☆☆☆'));
});
