/**
 * Estima la fecha de entrega de un pedido.
 * @param {Date} orderDate fecha/hora del pedido
 * @param {number} businessDays días hábiles que tarda el envío
 * @returns {string} fecha en formato YYYY-MM-DD
 */
export function estimateDelivery(orderDate, businessDays) {
  const date = new Date(orderDate);
  date.setDate(date.getDate() + businessDays);
  return date.toISOString().slice(0, 10);
}
