import { useRealtimeStatus } from '../context/RealtimeContext'

const labels = {
  conectado: 'Citas en vivo',
  conectando: 'Conectando citas…',
  reconectando: 'Reconectando citas…',
  sin_conexion: 'Sin conexión',
  sesion_expirada: 'Vuelve a iniciar sesión',
}

export default function RealtimeStatus() {
  const status = useRealtimeStatus()
  if (!labels[status]) return null
  return (
    <span role="status" className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${status === 'conectado' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}>
      <span aria-hidden="true">●</span>{labels[status]}
    </span>
  )
}
