const CODES = {
  SHAKIRA20: { type: 'percent', value: 20 },
  BIENVENIDA5: { type: 'fixed', value: 5 }
};

/**
 * Aplica un código de descuento al total del carrito.
 */
export function applyDiscount(total, code) {
  const discount = CODES[code];
  if (!discount) return total;
  return total - discount.value;
}
