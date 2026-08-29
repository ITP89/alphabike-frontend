import { useCallback, useEffect, useState } from 'react'
import { CalendarDays, CheckCircle2, Clock3, ReceiptText } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import LayoutEncargado from '../../components/LayoutEncargado'
import { ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { getApiErrorMessage } from '../../utils/apiError'

function MetricCard({ title, value, icon: Icon, accent = 'blue' }) {
  const color = accent === 'emerald' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'

  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-md ${color}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-950">{value}</p>
    </div>
  )
}

function EstadoBadge({ estado }) {
  const className = estado === 'PENDIENTE'
    ? 'bg-yellow-100 text-yellow-700'
    : estado === 'EN_PROCESO'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-emerald-100 text-emerald-700'

  return (
    <span className={`rounded-md px-2 py-1 text-xs font-medium ${className}`}>
      {estado}
    </span>
  )
}

function DashboardEncargado() {
  const [citas, setCitas] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargarDatos = useCallback(async () => {
    setCargando(true)
    setError('')

    try {
      const [citasRes, pedidosRes] = await Promise.all([
        api.get('/citas'),
        api.get('/pedidos'),
      ])
      setCitas(citasRes.data.data || [])
      setPedidos(pedidosRes.data.data || [])
    } catch (err) {
      setCitas([])
      setPedidos([])
      setError(getApiErrorMessage(err, 'No se pudo cargar el panel de encargado'))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const citasPendientes = citas.filter((cita) => cita.estado === 'PENDIENTE')
  const citasEnProceso = citas.filter((cita) => cita.estado === 'EN_PROCESO')
  const pedidosPendientes = pedidos.filter((pedido) => pedido.estado === 'PENDIENTE')

  return (
    <LayoutEncargado>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-950">Panel de trabajo</h1>
        <p className="mt-1 text-sm text-gray-500">Citas, pedidos y entregas que necesitan atencion.</p>
      </div>

      {cargando && <LoadingState text="Cargando panel de encargado..." />}
      {error && <ErrorState message={error} onRetry={cargarDatos} />}

      {!cargando && !error && (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Citas pendientes" value={citasPendientes.length} icon={Clock3} />
            <MetricCard title="Citas en proceso" value={citasEnProceso.length} icon={CalendarDays} />
            <MetricCard title="Pedidos pendientes" value={pedidosPendientes.length} icon={ReceiptText} />
            <MetricCard title="Citas registradas" value={citas.length} icon={CheckCircle2} accent="emerald" />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="font-semibold text-gray-950">Citas recientes</h2>
                <Link to="/encargado/citas" className="text-xs font-medium text-blue-700 hover:text-blue-800">Ver todas</Link>
              </div>
              {citas.slice(0, 4).map((cita) => (
                <div key={cita.id} className="flex items-center justify-between gap-3 border-t border-gray-100 py-3 text-sm first:border-t-0">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-950">{cita.clienteNombre}</p>
                    <p className="truncate text-xs text-gray-500">{cita.servicioNombre}</p>
                  </div>
                  <EstadoBadge estado={cita.estado} />
                </div>
              ))}
              {citas.length === 0 && <p className="text-sm text-gray-500">No hay citas registradas.</p>}
            </section>

            <section className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="font-semibold text-gray-950">Pedidos por atender</h2>
                <Link to="/encargado/entregas" className="text-xs font-medium text-blue-700 hover:text-blue-800">Ver todos</Link>
              </div>
              {pedidosPendientes.slice(0, 4).map((pedido) => (
                <div key={pedido.id} className="flex items-center justify-between gap-3 border-t border-gray-100 py-3 text-sm first:border-t-0">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-950">#{pedido.id.slice(0, 8)}</p>
                    <p className="truncate text-xs text-gray-500">{pedido.clienteNombre} | {pedido.tipoEntrega}</p>
                  </div>
                  <EstadoBadge estado="PENDIENTE" />
                </div>
              ))}
              {pedidosPendientes.length === 0 && <p className="text-sm text-gray-500">Sin pedidos pendientes.</p>}
            </section>
          </div>
        </>
      )}
    </LayoutEncargado>
  )
}

export default DashboardEncargado
