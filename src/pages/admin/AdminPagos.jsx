import { useState, useEffect } from 'react'
import { CreditCard, Sparkles, Receipt, CheckCircle2 } from 'lucide-react'
import api from '../../api/axios'
import LayoutAdmin from '../../components/LayoutAdmin'
import { ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { getApiErrorMessage } from '../../utils/apiError'
import { formatMoney } from '../../utils/formatters'

const LABELS_TIPO = {
  PEDIDO: 'Pedido de Tienda',
  COTIZACION: 'Servicio de Taller',
}

const LABELS_METODO = {
  EFECTIVO: 'Efectivo',
  YAPE: 'Yape / Plin',
  PLIN: 'Plin',
  TRANSFERENCIA: 'Transferencia BCP/BBVA',
}

function AdminPagos() {
  const [pagos, setPagos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todos')
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargarPagos() {
      try {
        const response = await api.get('/pagos')
        setPagos(response.data.data || [])
      } catch (err) {
        setError(getApiErrorMessage(err, 'No se pudieron cargar los pagos'))
      } finally {
        setCargando(false)
      }
    }
    cargarPagos()
  }, [])

  const pagosFiltrados = pagos.filter((p) =>
    filtro === 'todos' ? true : p.referenciaTipo === filtro
  )

  const totalIngresos = pagos
    .filter((p) => p.estado === 'PAGADO')
    .reduce((sum, p) => sum + Number(p.monto), 0)

  return (
    <LayoutAdmin>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Caja & Finanzas Taller</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Gestión de Pagos</h1>
          <p className="mt-0.5 text-xs text-slate-500">Historial completo de cobros por Yape, Plin, Transferencia y Efectivo.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-emerald-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Ingresos Totales Confirmados</p>
              <p className="text-3xl font-black text-slate-900">{formatMoney(totalIngresos)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-amber-600">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Transacciones Registradas</p>
              <p className="text-3xl font-black text-slate-900">{pagos.length} operaciones</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 max-w-xs">
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm focus:border-amber-500"
        >
          <option value="todos">Todos los Tipos de Cobro</option>
          <option value="PEDIDO">Pedidos de Tienda</option>
          <option value="COTIZACION">Servicios de Taller</option>
        </select>
      </div>

      {cargando ? (
        <LoadingState text="Cargando historial de pagos..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="hidden grid-cols-5 bg-slate-900 px-6 py-3 text-xs font-bold text-slate-300 lg:grid">
            <span>Referencia Operación</span>
            <span>Tipo de Cobro</span>
            <span>Monto Recaudado</span>
            <span>Método de Pago</span>
            <span>Fecha de Registro</span>
          </div>

          {pagosFiltrados.length === 0 && (
            <p className="text-slate-500 text-xs font-semibold px-6 py-6 text-center">No hay transacciones de pago registradas aún.</p>
          )}

          {pagosFiltrados.map((pago) => (
            <div key={pago.id} className="grid grid-cols-1 gap-2 border-t border-slate-100 px-6 py-3.5 text-xs first:border-t-0 lg:grid-cols-5 lg:items-center lg:gap-0 hover:bg-slate-50 transition-colors">
              <span className="font-black text-slate-900">#{pago.referenciaId.slice(0, 8)}</span>
              <span className="font-bold text-amber-700">{LABELS_TIPO[pago.referenciaTipo] || pago.referenciaTipo}</span>
              <span className="font-black text-slate-950 text-sm">{formatMoney(pago.monto)}</span>
              <div>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-black text-emerald-800">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  {LABELS_METODO[pago.metodoPago] || pago.metodoPago}
                </span>
              </div>
              <span className="font-semibold text-slate-500">{new Date(pago.fecha).toLocaleDateString('es-PE')}</span>
            </div>
          ))}
        </div>
      )}
    </LayoutAdmin>
  )
}

export default AdminPagos
