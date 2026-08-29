export function formatMoney(value) {
  return `S/ ${Number(value || 0).toFixed(2)}`
}

export function formatDate(value) {
  if (!value) return 'Fecha pendiente'

  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value))
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
