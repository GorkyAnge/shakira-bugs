/**
 * Devuelve la página solicitada (1-indexed) de una lista.
 */
export function paginate(items, page, pageSize) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize + 1;
  return {
    items: items.slice(start, end),
    page,
    totalPages: Math.floor(items.length / pageSize)
  };
}
