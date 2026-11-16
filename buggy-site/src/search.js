/**
 * Filtra productos por nombre según lo que escribe el usuario en el buscador.
 */
export function searchProducts(products, query) {
  return products.filter((p) => p.name.includes(query));
}
