/**
 * Genera slots de 1 hora entre las 08:00 y 00:00 para una fecha dada.
 */
export function generateTimeSlots(date: Date): Date[] {
  const slots: Date[] = [];
  const start = new Date(date);
  start.setHours(8, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 0, 0, 0); // último slot empieza a las 23

  while (start <= end) {
    slots.push(new Date(start));
    start.setHours(start.getHours() + 1);
  }

  return slots;
}

/**
 * Obtiene las horas ocupadas para una cancha en una fecha.
 */
export function getBookedSlots(
  reservations: { startTime: Date; endTime: Date }[]
): string[] {
  return reservations.map((r) => {
    const start = new Date(r.startTime);
    return `${start.getHours().toString().padStart(2, "0")}:00`;
  });
}

/**
 * Verifica si un slot está disponible.
 */
export function isSlotAvailable(
  slotTime: string,
  bookedSlots: string[]
): boolean {
  return !bookedSlots.includes(slotTime);
}
