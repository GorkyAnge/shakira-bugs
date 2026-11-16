/**
 * Genera el HTML de una reseña de cliente.
 * rating va de 1 a 5 estrellas.
 */
export function renderReview(review) {
  const stars = '★'.repeat(review.rating);
  return `<article class="review"><strong>${review.author}</strong><span class="stars">${stars}</span><p>${review.text}</p></article>`;
}
