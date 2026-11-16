// Catálogo que llega "tal cual" desde la API del proveedor.
// Ojo: los precios vienen como string.
export const products = [
  { id: 1, name: 'Guitarra Acústica Barranquilla', price: '249.90', category: 'Instrumentos' },
  { id: 2, name: 'Micrófono Dorado', price: '89.00', category: 'Audio' },
  { id: 3, name: 'Pandereta Loba', price: '19.50', category: 'Instrumentos' },
  { id: 4, name: 'Audífonos Pies Descalzos', price: '120.00', category: 'Audio' },
  { id: 5, name: 'Camiseta Tour Mundial', price: '35.00', category: 'Ropa' },
  { id: 6, name: 'Gorra Waka', price: '22.00', category: 'Ropa' },
  { id: 7, name: 'Tambor Alegría', price: '100.00', category: 'Instrumentos' },
  { id: 8, name: 'Parlante Bluetooth Caderas', price: '75.25', category: 'Audio' },
  { id: 9, name: 'Poster Edición Limitada', price: '9.99', category: 'Coleccionables' },
  { id: 10, name: 'Vinilo Grandes Éxitos', price: '45.00', category: 'Coleccionables' },
  { id: 11, name: 'Maracas Caribe', price: '15.00', category: 'Instrumentos' },
  { id: 12, name: 'Sudadera Loba', price: '58.00', category: 'Ropa' }
];

export const reviews = [
  { author: 'Carlos', rating: 5, text: '¡La guitarra suena increíble!' },
  { author: 'Lucía', rating: 4, text: 'Llegó rápido, muy buena calidad.' },
  { author: '<img src=x onerror="alert(\'hackeado\')">', rating: 9, text: 'Esto <b>no</b> debería verse en negrita…' }
];
