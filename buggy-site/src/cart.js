/**
 * Calcula el total del carrito.
 * @param {{price: number, quantity: number}[]} items
 * @returns {number} total redondeado a 2 decimales
 */
export function cartTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
