/**
 * Ordena productos por precio. direction: 'asc' | 'desc'
 */
export function sortByPrice(products, direction = 'asc') {
  return products.sort((a, b) => {
    if (direction === 'asc') return a.price > b.price ? 1 : -1;
    return a.price < b.price ? 1 : -1;
  });
}
