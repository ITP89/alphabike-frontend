import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, CreditCard, ReceiptText, Users, ArrowUpRight, TrendingUp, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import LayoutAdmin from '../../components/LayoutAdmin'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { getApiErrorMessage } from '../../utils/apiError'
import { formatMoney } from '../../utils/formatters'

function MetricCard({ title, value, icon: Icon, color = 'amber' }) {
  const iconStyle =
    color === 'emerald'
      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
      : color === 'blue'
        ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
        : color === 'purple'
          ? 'bg-purple-500/10 text-purple-600 border-purple-500/20'
          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${iconStyle}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <span className="inline-flex items-center text-[10px] font-extrabold uppercase text-slate-400 gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
          <TrendingUp className="h-3 w-3 text-emerald-500" /> +12%
        </span>
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
      <p className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">{value}</p>
    </div>
  )
}

function EstadoBadge({ estado }) {
  const className =
    estado === 'PENDIENTE'
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : estado === 'ENTREGADO' || estado === 'COMPLETADO'
        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
        : estado === 'EN_PROCESO' || estado === 'EN_CAMINO'
          ? 'bg-blue-100 text-blue-800 border-blue-200'
          : 'bg-slate-100 text-slate-700 border-slate-200'

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ${className}`}>
      {estado}
    </span>
  )
}

function DashboardAdmin() {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargarDatos = useCallback(async () => {
    setCargando(true)
    setError('')

    try {
      const [usuariosRes, pedidosRes, citasRes, pagosRes] = await Promise.all([
        api.get('/usuarios'),
        api.get('/pedidos'),
        api.get('/citas'),
        api.get('/pagos'),
      ])
      setDatos({
        usuarios: usuariosRes.data.data || [],
        pedidos: pedidosRes.data.data || [],
        citas: citasRes.data.data || [],
        pagos: pagosRes.data.data || [],
      })
    } catch (err) {
      setDatos(null)
      setError(getApiErrorMessage(err, 'No se pudo cargar el resumen del panel'))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const ingresos = useMemo(() => (
    datos?.pagos
      .filter((pago) => pago.estado === 'PAGADO')
      .reduce((sum, pago) => sum + Number(pago.monto), 0) || 0
  ), [datos])

  return (
    <LayoutAdmin>
      <div className="mb-8 border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Panel de Administración AlphaBike</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Resumen General</h1>
          <p className="mt-1 text-xs text-slate-500">Métricas clave de ventas, pedidos, usuarios y servicios en taller.</p>
        </div>
      </div>

      {cargando && <LoadingState text="Cargando dashboard admin..." />}
      {error && <ErrorState message={error} onRetry={cargarDatos} />}

      {!cargando && !error && !datos && (
        <EmptyState title="No hay datos disponibles" description="Intenta recargar el panel." />
      )}

      {!cargando && !error && datos && (
        <>
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Ingresos Totales" value={formatMoney(ingresos)} icon={CreditCard} color="emerald" />
            <MetricCard title="Total Pedidos" value={datos.pedidos.length} icon={ReceiptText} color="blue" />
            <MetricCard title="Total Citas Taller" value={datos.citas.length} icon={CalendarDays} color="amber" />
            <MetricCard
              title="Clientes Registrados"
              value={datos.usuarios.filter((usuario) => usuario.rol === 'CLIENTE').length}
              icon={Users}
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            {/* Sección Últimas Citas */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-black text-slate-900">Últimas Citas de Taller</h2>
                <Link to="/admin/citas" className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-600 hover:underline">
                  <span>Ver todas</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {datos.citas.slice(0, 5).map((cita) => (
                  <div key={cita.id} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0 text-xs">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-900">{cita.clienteNombre}</p>
                      <p className="truncate text-slate-500">{cita.servicioNombre} • {cita.fecha}</p>
                    </div>
                    <EstadoBadge estado={cita.estado} />
                  </div>
                ))}
                {datos.citas.length === 0 && <p className="text-xs text-slate-500">No hay citas registradas.</p>}
              </div>
            </section>

            {/* Sección Últimos Pedidos */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-black text-slate-900">Últimos Pedidos en Tienda</h2>
                <Link to="/admin/pedidos" className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-600 hover:underline">
                  <span>Ver todos</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {datos.pedidos.slice(0, 5).map((pedido) => (
                  <div key={pedido.id} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900">#{pedido.id.slice(0, 8)}</p>
                      <p className="truncate text-slate-500">{pedido.clienteNombre} • {formatMoney(pedido.total)}</p>
                    </div>
                    <EstadoBadge estado={pedido.estado} />
                  </div>
                ))}
                {datos.pedidos.length === 0 && <p className="text-xs text-slate-500">No hay pedidos registrados.</p>}
              </div>
            </section>
          </div>
        </>
      )}
    </LayoutAdmin>
  )
}

export default DashboardAdmin
