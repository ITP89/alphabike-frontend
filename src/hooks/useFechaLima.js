import { useEffect, useState } from 'react'
export function fechaLima(now = new Date()) {
  const partes = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
  const valor = tipo => partes.find(p => p.type === tipo).value
  return `${valor('year')}-${valor('month')}-${valor('day')}`
}
export function useFechaLima() {
  const [fecha, setFecha] = useState(fechaLima)
  useEffect(() => {
    const actualizar = () => setFecha(fechaLima())
    const timer = setInterval(actualizar, 30000)
    window.addEventListener('focus', actualizar)
    return () => { clearInterval(timer); window.removeEventListener('focus', actualizar) }
  }, [])
  return fecha
}
