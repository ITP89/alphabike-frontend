import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  CreditCard,
  ReceiptText,
  Users,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  QrCode,
  Building,
  Store,
  Lock,
} from 'lucide-react'
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
          : 'bg-red-500/10 text-red-600 border-red-500/20'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${iconStyle}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <span className="inline-flex items-center text-[10px] font-extrabold uppercase text-slate-400 gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
          <TrendingUp className="h-3 w-3 text-emerald-500" /> Operativo
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
      : estado === 'ENTREGADO' || estado === 'COMPLETADO' || estado === 'PAGADO'
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

      const pagosBackend = pagosRes.data.data || []

      // Complementar con comprobantes locales si existen
      let comprobantesLocales = {}
      try {
        comprobantesLocales = JSON.parse(localStorage.getItem('alphabike_comprobantes') || '{}')
      } catch {
        comprobantesLocales = {}
      }

      const pagosCompletos = [...pagosBackend]
      const idsBackend = new Set(pagosBackend.map((p) => p.referenciaId))
      Object.entries(comprobantesLocales).forEach(([refId, comp]) => {
        if (!idsBackend.has(refId)) {
          pagosCompletos.push({
            id: comp.transaccionId || refId,
            referenciaId: refId,
            monto: comp.monto,
            metodoPago: comp.metodoPago,
            metodoPagoReal: comp.metodoPago,
            estado: 'PAGADO',
          })
        }
      })

      setDatos({
        usuarios: usuariosRes.data.data || [],
        pedidos: pedidosRes.data.data || [],
        citas: citasRes.data.data || [],
        pagos: pagosCompletos,
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

  const { ingresos, desgloseMetodos } = useMemo(() => {
    if (!datos?.pagos) return { ingresos: 0, desgloseMetodos: { tarjeta: 0, yape: 0, transfer: 0, efectivo: 0 } }

    let total = 0
    let tarjeta = 0
    let yape = 0
    let transfer = 0
    let efectivo = 0

    datos.pagos.forEach((pago) => {
      if (pago.estado === 'PAGADO') {
        const m = Number(pago.monto) || 0
        const metodo = pago.metodoPagoReal || pago.metodoPago
        total += m
        if (metodo === 'TARJETA') tarjeta += m
        else if (metodo === 'YAPE' || metodo === 'PLIN') yape += m
        else if (metodo === 'TRANSFERENCIA') transfer += m
        else efectivo += m
      }
    })

    return { ingresos: total, desgloseMetodos: { tarjeta, yape, transfer, efectivo } }
  }, [datos])

  return (
    <LayoutAdmin>
      {/* Encabezado */}
      <div className="mb-6 border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-red-600 uppercase tracking-wider mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Centro de Control Administrativo AlphaBike</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Dashboard General</h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Supervisión integral de recaudación por pasarela, pedidos de tienda y servicios mecánicos.
          </p>
        </div>

        {/* Badge Pasarela Status */}
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-sm">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <div>
            <span className="block font-black text-[11px] uppercase tracking-wide">Pasarela de Pago Lista</span>
            <span className="text-[10px] text-emerald-700">Sandbox Activo • Plug-in Comercial Ready</span>
          </div>
        </div>
      </div>

      {cargando && <LoadingState text="Cargando métricas del panel..." />}
      {error && <ErrorState message={error} onRetry={cargarDatos} />}

      {!cargando && !error && !datos && (
        <EmptyState title="No hay datos disponibles" description="Intenta recargar el panel." />
      )}

      {!cargando && !error && datos && (
        <>
          {/* Métricas Principales */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

          {/* Desglose de Recaudación por Canal de Pago */}
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-red-600" />
                  Distribución de Ingresos por Pasarela de Pago
                </h2>
                <p className="text-xs text-slate-400">Canales habilitados para clientes en la web y tienda física.</p>
              </div>
              <Link
                to="/admin/pagos"
                className="inline-flex items-center gap-1 text-xs font-black text-red-600 hover:text-red-700"
              >
                <span>Ver historial financiero completo</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-xs mb-1">
                  <CreditCard className="h-4 w-4" />
                  <span>Tarjetas (Visa/Master)</span>
                </div>
                <p className="text-xl font-black text-slate-900">{formatMoney(desgloseMetodos.tarjeta)}</p>
                <span className="text-[10px] text-blue-600 font-semibold">Cifrado SSL 256-bit</span>
              </div>

              <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3.5">
                <div className="flex items-center gap-2 text-purple-700 font-bold text-xs mb-1">
                  <QrCode className="h-4 w-4" />
                  <span>Yape / Plin QR</span>
                </div>
                <p className="text-xl font-black text-slate-900">{formatMoney(desgloseMetodos.yape)}</p>
                <span className="text-[10px] text-purple-600 font-semibold">Billeteras instantáneas</span>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
                  <Building className="h-4 w-4" />
                  <span>Transferencia BCP/BBVA</span>
                </div>
                <p className="text-xl font-black text-slate-900">{formatMoney(desgloseMetodos.transfer)}</p>
                <span className="text-[10px] text-emerald-600 font-semibold">Cuentas Corrientes</span>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3.5">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs mb-1">
                  <Store className="h-4 w-4" />
                  <span>Efectivo en Mostrador</span>
                </div>
                <p className="text-xl font-black text-slate-900">{formatMoney(desgloseMetodos.efectivo)}</p>
                <span className="text-[10px] text-amber-600 font-semibold">Caja taller central</span>
              </div>
            </div>
          </div>

          {/* Secciones Inferiores: Citas y Pedidos Recientes */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Sección Últimos Pedidos */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">Últimos Pedidos en Tienda</h2>
                <Link to="/admin/pedidos" className="inline-flex items-center gap-1 text-xs font-black text-red-600 hover:underline">
                  <span>Ver todos</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {datos.pedidos.slice(0, 5).map((pedido) => (
                  <div key={pedido.id} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0 text-xs">
                    <div className="min-w-0">
                      <p className="font-black text-slate-900">#{pedido.id.slice(0, 8)}</p>
                      <p className="truncate text-slate-500 font-medium">{pedido.clienteNombre} • {formatMoney(pedido.total)}</p>
                    </div>
                    <EstadoBadge estado={pedido.estado} />
                  </div>
                ))}
                {datos.pedidos.length === 0 && <p className="text-xs text-slate-500">No hay pedidos registrados.</p>}
              </div>
            </section>

            {/* Sección Últimas Citas */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">Últimas Citas de Taller</h2>
                <Link to="/admin/citas" className="inline-flex items-center gap-1 text-xs font-black text-red-600 hover:underline">
                  <span>Ver todas</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {datos.citas.slice(0, 5).map((cita) => (
                  <div key={cita.id} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0 text-xs">
                    <div className="min-w-0">
                      <p className="truncate font-black text-slate-900">{cita.clienteNombre}</p>
                      <p className="truncate text-slate-500 font-medium">{cita.servicioNombre} • {cita.fecha}</p>
                    </div>
                    <EstadoBadge estado={cita.estado} />
                  </div>
                ))}
                {datos.citas.length === 0 && <p className="text-xs text-slate-500">No hay citas registradas.</p>}
              </div>
            </section>
          </div>
        </>
      )}
    </LayoutAdmin>
  )
}

export default DashboardAdmin
