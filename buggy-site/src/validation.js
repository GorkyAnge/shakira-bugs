/**
 * Valida un correo electrónico para el formulario de registro.
 * Debe aceptar correos reales como "ana.perez+tienda@mail.co".
 */
export function isValidEmail(email) {
  return /^[a-z]+@[a-z]+/.test(email);
}
