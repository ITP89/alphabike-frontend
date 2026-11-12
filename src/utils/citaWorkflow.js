export const ESTADOS_CITA = { PENDIENTE: 'Pendiente', EN_PROCESO: 'En proceso', COMPLETADO: 'Completado', CANCELADO: 'Cancelado' }
export function estadosDisponibles(estado) {
  if (['CANCELADO', 'COMPLETADO'].includes(estado)) return [estado]
  return estado === 'EN_PROCESO' ? ['EN_PROCESO', 'COMPLETADO', 'CANCELADO'] : ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO']
}
export function citaCerrada(cita) { return ['COMPLETADO', 'CANCELADO'].includes(cita?.estado) }
