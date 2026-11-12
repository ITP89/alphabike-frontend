import { useCallback, useEffect, useState } from 'react'
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
          <TrendingUp className="h-3 w-3 text-emerald-500" /> Datos del sistema
        </span>
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
      <p className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">{value}</p>
      {note && <p className="mt-1 text-[11px] font-semibold text-slate-400">{note}</p>}
    </div>
  )
}

function RankingList({ title, items, nameKey, valueKey, valueSuffix, error }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
        <Award className="h-5 w-5 text-amber-500" />
        {title}
      </h2>
      {error ? <p role="alert" className="text-sm text-red-700">Consulta no disponible. Usa «Volver a consultar».</p> : items.length === 0 ? (
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
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [periodo, setPeriodo] = useState({ desde: '', hasta: '' })
  const [fallos, setFallos] = useState([])
  const [ventas, setVentas] = useState(null)
  const [descuentos, setDescuentos] = useState([])
  const [productosPopulares, setProductosPopulares] = useState([])
  const [serviciosPopulares, setServiciosPopulares] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargarReportes = useCallback(async () => {
    setCargando(true)
    setError('')

    try {
      const params = new URLSearchParams()
      if (periodo.desde) params.set('desde', periodo.desde)
      if (periodo.hasta) params.set('hasta', periodo.hasta)
      const query = params.size ? `?${params}` : ''
      const results = await Promise.allSettled([
        api.get(`/reportes/ventas${query}`),
        api.get(`/reportes/descuentos${query}`),
        api.get(`/reportes/productos-populares${query}`),
        api.get(`/reportes/servicios-populares${query}`),
      ])

      const nombres = ['Resumen de ventas', 'Descuentos por encargado', 'Productos más vendidos', 'Servicios más solicitados']
      setFallos(results.flatMap((result, i) => result.status === 'rejected' ? [nombres[i]] : []))
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
  }, [periodo])

  useEffect(() => {
    cargarReportes()
  }, [cargarReportes])

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

      <form onSubmit={event => { event.preventDefault(); if (desde && hasta && desde > hasta) { setError('La fecha inicial no puede superar la final'); return } setPeriodo({ desde, hasta }) }} className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <label className="text-sm">Desde<input aria-label="Reportes desde" type="date" value={desde} onChange={e => setDesde(e.target.value)} className="mt-1 block rounded-lg border p-2" /></label>
        <label className="text-sm">Hasta<input aria-label="Reportes hasta" type="date" min={desde || undefined} value={hasta} onChange={e => setHasta(e.target.value)} className="mt-1 block rounded-lg border p-2" /></label>
        <button disabled={cargando} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Consultar período</button>
        <button type="button" onClick={() => { setDesde(''); setHasta(''); setPeriodo({ desde: '', hasta: '' }) }} className="rounded-lg border px-4 py-2 text-sm">Ver todo</button>
      </form>
      {cargando && <LoadingState text="Calculando métricas y reportes..." />}
      {error && <ErrorState message={error} onRetry={cargarReportes} />}

      {!cargando && fallos.length > 0 && !error && <div role="alert" className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
        No se pudieron consultar: {fallos.join(', ')}. Estos resultados no representan cero ni ausencia de registros.
        <button type="button" onClick={cargarReportes} className="ml-2 underline">Volver a consultar</button>
      </div>}
      {!cargando && !error && (
        <>
          <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            <MetricCard
              title="Ingresos Totales Acumulados"
              value={ventas ? formatMoney(ventas.ingresosTotales) : 'No disponible'}
              note="Pagos confirmados de tienda y taller"
              icon={Banknote}
              color="emerald"
            />
            <MetricCard
              title="Descuentos Otorgados"
              value={ventas ? formatMoney(ventas.totalDescuentos) : 'No disponible'}
              note="Descuentos en pedidos pagados"
              icon={Percent}
              color="blue"
            />
            <MetricCard
              title="Citas registradas"
              value={ventas ? `${ventas.totalCitas} citas` : 'No disponible'}
              note="Según fecha de cita; incluye todos los estados"
              icon={Wrench}
              color="amber"
            />
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <RankingList
              title="Top Productos Más Vendidos"
              items={productosPopulares}
              error={fallos.includes('Productos más vendidos')}
              nameKey="productoNombre"
              valueKey="totalVendido"
              valueSuffix="unidades"
            />
            <RankingList
              title="Top Servicios Más Solicitados"
              items={serviciosPopulares}
              error={fallos.includes('Servicios más solicitados')}
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

            {fallos.includes('Descuentos por encargado') ? <p className="text-sm text-red-700">Consulta no disponible.</p> : descuentos.length === 0 ? (
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
