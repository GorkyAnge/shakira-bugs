import { products, reviews } from './src/data.js';
import { cartTotal } from './src/cart.js';
import { isValidEmail } from './src/validation.js';
import { formatPrice } from './src/format.js';
import { searchProducts } from './src/search.js';
import { paginate } from './src/pagination.js';
import { applyDiscount } from './src/discount.js';
import { renderReview } from './src/reviews.js';
import { sortByPrice } from './src/sort.js';
import { estimateDelivery } from './src/shipping.js';

const $ = (id) => document.getElementById(id);
const state = { query: '', sort: 'asc', page: 1, cart: new Map() };

function render() {
  const filtered = sortByPrice(searchProducts(products, state.query), state.sort);
  const { items, page, totalPages } = paginate(filtered, state.page, 4);
  $('products').innerHTML = items
    .map((p) => `<div class="card"><h3>${p.name}</h3><p>${formatPrice(p.price)}</p><button data-id="${p.id}">Agregar</button></div>`)
    .join('');
  $('pager').innerHTML = Array.from({ length: totalPages }, (_, i) =>
    `<button class="${i + 1 === page ? 'active' : ''}" data-page="${i + 1}">${i + 1}</button>`).join('');

  const lines = [...state.cart.values()];
  $('cart').innerHTML = lines.map((l) => `<li>${l.name} × ${l.quantity}</li>`).join('') || '<li class="muted">Vacío</li>';
  const total = applyDiscount(cartTotal(lines.map((l) => ({ price: Number(l.price), quantity: l.quantity }))), $('code').value);
  $('total').textContent = formatPrice(total);
  $('eta').textContent = estimateDelivery(new Date(), 3);
}

$('products').addEventListener('click', (e) => {
  const id = Number(e.target.dataset.id);
  if (!id) return;
  const p = products.find((x) => x.id === id);
  const line = state.cart.get(id) ?? { ...p, quantity: 0 };
  line.quantity++;
  state.cart.set(id, line);
  render();
});
$('pager').addEventListener('click', (e) => { if (e.target.dataset.page) { state.page = Number(e.target.dataset.page); render(); } });
$('search').addEventListener('input', (e) => { state.query = e.target.value; state.page = 1; render(); });
$('sort').addEventListener('change', (e) => { state.sort = e.target.value; render(); });
$('code').addEventListener('input', render);
$('newsletter').addEventListener('submit', (e) => {
  e.preventDefault();
  $('email-msg').textContent = isValidEmail($('email').value) ? '¡Suscrito! 🎉' : 'Correo inválido 😬';
});
$('reviews').innerHTML = reviews.map(renderReview).join('');
render();
