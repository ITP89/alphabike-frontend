import { useEffect, useState } from 'react'
import { Banknote, Bike, Percent, Wrench, Sparkles, TrendingUp, Award } from 'lucide-react'
import api from '../../api/axios'
import LayoutAdmin from '../../components/LayoutAdmin'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { getApiErrorMessage } from '../../utils/apiError'
import { formatMoney } from '../../utils/formatters'

function MetricCard({ title, value, note, icon: Icon, color = 'amber' }) {
  const iconStyle =
    color === 'emerald'
      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
      : color === 'blue'
        ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
        : 'bg-amber-500/10 text-amber-600 border-amber-500/20'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${iconStyle}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <span className="inline-flex items-center text-[10px] font-extrabold uppercase text-slate-400 gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
          <TrendingUp className="h-3 w-3 text-emerald-500" /> Reporte Real
        </span>
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
      <p className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">{value}</p>
      {note && <p className="mt-1 text-[11px] font-semibold text-slate-400">{note}</p>}
    </div>
  )
}

function RankingList({ title, items, nameKey, valueKey, valueSuffix }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
        <Award className="h-5 w-5 text-amber-500" />
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="text-xs font-semibold text-slate-500">Sin registros de ventas aún</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((item, index) => (
            <div key={item.productoId || item.servicioId || item[nameKey]} className="flex items-center justify-between gap-3 py-2.5 text-xs font-bold">
              <span className="min-w-0 truncate text-slate-900 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/10 text-amber-700 text-[10px] font-black shrink-0">
                  #{index + 1}
                </span>
                {item[nameKey]}
              </span>
              <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-700">
                {item[valueKey]} {valueSuffix}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function Reportes() {
  const [ventas, setVentas] = useState(null)
  const [descuentos, setDescuentos] = useState([])
  const [productosPopulares, setProductosPopulares] = useState([])
  const [serviciosPopulares, setServiciosPopulares] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  async function cargarReportes() {
    setCargando(true)
    setError('')

    try {
      const results = await Promise.allSettled([
        api.get('/reportes/ventas'),
        api.get('/reportes/descuentos'),
        api.get('/reportes/productos-populares'),
        api.get('/reportes/servicios-populares'),
      ])

      const [ventasRes, descuentosRes, productosRes, serviciosRes] = results

      setVentas(ventasRes.status === 'fulfilled' ? ventasRes.value.data.data : null)
      setDescuentos(descuentosRes.status === 'fulfilled' ? (descuentosRes.value.data.data || []) : [])
      setProductosPopulares(productosRes.status === 'fulfilled' ? (productosRes.value.data.data || []) : [])
      setServiciosPopulares(serviciosRes.status === 'fulfilled' ? (serviciosRes.value.data.data || []) : [])

      const todosFallaron = results.every((r) => r.status === 'rejected')
      if (todosFallaron) {
        setError('No se pudieron cargar los reportes')
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron cargar los reportes'))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarReportes()
  }, [])

  return (
    <LayoutAdmin>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Inteligencia de Negocio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Reportes de Rendimiento</h1>
          <p className="mt-0.5 text-xs text-slate-500">Analítica de ingresos, productos más vendidos y métricas de personal.</p>
        </div>
      </div>

      {cargando && <LoadingState text="Calculando métricas y reportes..." />}
      {error && <ErrorState message={error} onRetry={cargarReportes} />}

      {!cargando && !error && (
        <>
          <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            <MetricCard
              title="Ingresos Totales Acumulados"
              value={formatMoney(ventas?.ingresosTotales)}
              note="Ventas tienda + Servicios taller"
              icon={Banknote}
              color="emerald"
            />
            <MetricCard
              title="Descuentos Otorgados"
              value={formatMoney(ventas?.totalDescuentos)}
              note="Diferencial lista vs final"
              icon={Percent}
              color="blue"
            />
            <MetricCard
              title="Servicios Ejecutados"
              value={`${ventas?.totalCitas || 0} citas`}
              note="Atenciones concluidas"
              icon={Wrench}
              color="amber"
            />
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <RankingList
              title="Top Productos Más Vendidos"
              items={productosPopulares}
              nameKey="productoNombre"
              valueKey="totalVendido"
              valueSuffix="unidades"
            />
            <RankingList
              title="Top Servicios Más Solicitados"
              items={serviciosPopulares}
              nameKey="servicioNombre"
              valueKey="totalCitas"
              valueSuffix="citas"
            />
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-black text-slate-900 border-b border-slate-100 pb-3">
              <Bike className="h-5 w-5 text-amber-500" aria-hidden="true" />
              Descuentos y Rendimiento por Encargado de Taller
            </h2>

            {descuentos.length === 0 ? (
              <EmptyState title="Sin ventas presenciales registradas aún" description="Los descuentos concedidos por los mecánicos encargados aparecerán reflejados aquí." />
            ) : (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="hidden grid-cols-4 bg-slate-900 px-6 py-3 text-xs font-bold text-slate-300 md:grid">
                  <span>Encargado / Técnico</span>
                  <span>Ventas Realizadas</span>
                  <span>Total Descuentos</span>
                  <span>Promedio Descuento/Venta</span>
                </div>
                {descuentos.map((descuento) => (
                  <div key={descuento.encargadoId} className="grid grid-cols-1 gap-2 border-t border-slate-100 px-6 py-3.5 text-xs first:border-t-0 md:grid-cols-4 md:items-center md:gap-0 hover:bg-slate-50 transition-colors">
                    <span className="font-black text-slate-900">{descuento.encargadoNombre}</span>
                    <span className="font-extrabold text-slate-700">{descuento.totalVentas} atenciones</span>
                    <span className="font-black text-amber-700">{formatMoney(descuento.totalDescuentos)}</span>
                    <span className="font-bold text-slate-600">{formatMoney(descuento.promedioDescuento)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </LayoutAdmin>
  )
}

export default Reportes
