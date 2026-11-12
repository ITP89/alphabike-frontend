import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { Link } from 'react-router-dom'
import LayoutEncargado from '../../components/LayoutEncargado'
import { ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { getApiErrorMessage } from '../../utils/apiError'
import { formatMoney } from '../../utils/formatters'

const LABELS_TIPO = {
  PEDIDO: 'Pedido',
  COTIZACION: 'Cotizacion',
}

const LABELS_METODO = {
  EFECTIVO: 'Efectivo',
  TARJETA: 'Tarjeta',
  MERCADO_PAGO: 'Mercado Pago',
  YAPE: 'Yape',
  PLIN: 'Plin',
  TRANSFERENCIA: 'Transferencia',
}

function GestionPagos() {
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

  const pagosFiltrados = pagos.filter((p) => {
    if (filtro === 'todos') return true
    return p.referenciaTipo === filtro
  })

  const totalIngresos = pagos
    .filter((p) => p.estado === 'PAGADO')
    .reduce((sum, p) => sum + Number(p.monto), 0)

  return (
    <LayoutEncargado>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Gestion de pagos</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-500 text-sm">Total ingresos</p>
          <p className="break-words text-2xl font-semibold text-gray-900">{formatMoney(totalIngresos)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-500 text-sm">Total pagos</p>
          <p className="break-words text-2xl font-semibold text-gray-900">{pagos.length}</p>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <select
          aria-label="Filtrar pagos por tipo"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
        >
          <option value="todos">Tipo: todos</option>
          <option value="PEDIDO">Pedidos</option>
          <option value="COTIZACION">Cotizaciones</option>
        </select>
      </div>

      {cargando ? (
        <LoadingState text="Cargando pagos..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="hidden lg:grid lg:grid-cols-6 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500">
            <span>Referencia</span>
            <span>Tipo</span>
            <span>Monto</span>
            <span>Metodo</span>
            <span>Fecha</span>
            <span>Estado</span>
          </div>

          {pagosFiltrados.length === 0 && (
            <p className="text-gray-500 text-sm px-4 py-3">No hay pagos registrados</p>
          )}

          {pagosFiltrados.map((pago) => (
            <div key={pago.id} className="grid grid-cols-1 gap-3 px-4 py-4 border-t border-gray-200 text-sm sm:grid-cols-2 lg:grid-cols-6 lg:items-center">
              <span className="min-w-0 break-words text-gray-900"><span className="mb-1 block text-xs text-gray-500 lg:sr-only">Referencia</span>#{pago.referenciaId.slice(0, 8)}{pago.referenciaTipo === 'PEDIDO' && <Link to="/encargado/entregas" className="ml-2 text-blue-700 underline">Ver pedidos</Link>}</span>
              <span className="min-w-0 break-words"><span className="mb-1 block text-xs text-gray-500 lg:sr-only">Tipo</span>{LABELS_TIPO[pago.referenciaTipo] || pago.referenciaTipo}</span>
              <span className="min-w-0 break-words font-medium"><span className="mb-1 block text-xs text-gray-500 lg:sr-only">Monto</span>{formatMoney(pago.monto)}</span>
              <span className="min-w-0 break-words"><span className="mb-1 block text-xs text-gray-500 lg:sr-only">Metodo</span>{LABELS_METODO[pago.metodoPago] || pago.metodoPago}</span>
              <span className="min-w-0 break-words text-gray-500"><span className="mb-1 block text-xs lg:sr-only">Fecha</span>
                {new Date(pago.fecha).toLocaleDateString('es-PE')}
              </span>
              <span><span className="mb-1 block text-xs text-gray-500 lg:sr-only">Estado</span>{pago.estado === 'PAGADO' ? 'Pagado' : 'Pendiente'}</span>
            </div>
          ))}
        </div>
      )}
    </LayoutEncargado>
  )
}

export default GestionPagos
