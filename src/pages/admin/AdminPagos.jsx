import { useState, useEffect } from 'react'
import api from '../../api/axios'
import LayoutAdmin from '../../components/LayoutAdmin'

const LABELS_TIPO = {
  PEDIDO: 'Pedido',
  COTIZACION: 'Cotizacion',
}

const LABELS_METODO = {
  EFECTIVO: 'Efectivo',
  YAPE: 'Yape / Plin',
  TRANSFERENCIA: 'Transferencia',
}

function AdminPagos() {
  const [pagos, setPagos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todos')

  useEffect(() => {
    async function cargarPagos() {
      try {
        const response = await api.get('/pagos')
        setPagos(response.data.data)
      } catch (err) {
        console.error('Error cargando pagos', err)
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
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Gestion de pagos</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-500 text-sm">Total ingresos</p>
          <p className="text-2xl font-semibold text-gray-900">S/ {totalIngresos.toFixed(2)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-500 text-sm">Total pagos</p>
          <p className="text-2xl font-semibold text-gray-900">{pagos.length}</p>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
          <option value="todos">Tipo: todos</option>
          <option value="PEDIDO">Pedidos</option>
          <option value="COTIZACION">Cotizaciones</option>
        </select>
      </div>

      {cargando ? (
        <p className="text-gray-500 text-sm">Cargando pagos...</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-5 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500">
            <span>Referencia</span><span>Tipo</span><span>Monto</span><span>Metodo</span><span>Fecha</span>
          </div>
          {pagosFiltrados.length === 0 && (
            <p className="text-gray-500 text-sm px-4 py-3">No hay pagos registrados</p>
          )}
          {pagosFiltrados.map((pago) => (
            <div key={pago.id} className="grid grid-cols-5 px-4 py-3 border-t border-gray-200 text-sm items-center">
              <span>#{pago.referenciaId.slice(0, 8)}</span>
              <span>{LABELS_TIPO[pago.referenciaTipo] || pago.referenciaTipo}</span>
              <span className="font-medium">S/ {Number(pago.monto).toFixed(2)}</span>
              <span>{LABELS_METODO[pago.metodoPago] || pago.metodoPago}</span>
              <span className="text-gray-500">{new Date(pago.fecha).toLocaleDateString('es-PE')}</span>
            </div>
          ))}
        </div>
      )}
    </LayoutAdmin>
  )
}

export default AdminPagos