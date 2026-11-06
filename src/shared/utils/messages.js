import { bookingUrl } from './links';

/** Ready-made message the barber sends to clients (Parte 2, punto 3). */
export function shareMessage(business) {
  return `¡Ya puedes reservar tu cita en ${business.name} desde el celular! Escoge el servicio y la hora aquí 👉 ${bookingUrl(business)}`;
}
