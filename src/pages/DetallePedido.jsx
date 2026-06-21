import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'

const LABELS_ESTADO_PAGO = {
  PENDIENTE: { texto: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  PAGADO: { texto: 'Pagado', color: 'bg-green-100 text-green-700' },
}

const LABELS_ESTADO_PEDIDO = {
  PENDIENTE: 'Pendiente',
  PAGADO: 'Pagado',
  EN_PREPARACION: 'En preparacion',
  LISTO_PARA_RECOJO: 'Listo para recojo',
  EN_CAMINO: 'En camino',
  ENVIADO: 'Enviado',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

function DetallePedido() {
  const { id } = useParams()
  const [pedido, setPedido] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargarPedido() {
      try {
        const response = await api.get(`/pedidos/${id}`)
        setPedido(response.data.data)
      } catch (err) {
        setError('No se pudo cargar el pedido')
      } finally {
        setCargando(false)
      }
    }

    cargarPedido()
  }, [id])

  if (cargando) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <p className="text-center text-gray-500 py-10">Cargando pedido...</p>
      </div>
    )
  }

  if (error || !pedido) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <p className="text-center text-red-600 py-10">{error || 'Pedido no encontrado'}</p>
      </div>
    )
  }

  const estaPagado = pedido.estado !== 'PENDIENTE'
  const estadoPago = estaPagado ? 'PAGADO' : 'PENDIENTE'

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link to="/pedidos" className="text-sm text-blue-600 hover:underline">
          ← Mis pedidos
        </Link>

        <div className="flex justify-between items-baseline mt-2 mb-6">
          <h1 className="text-xl font-semibold text-gray-900">
            Pedido #{pedido.id.slice(0, 8)}
          </h1>
          <p className="text-gray-500 text-sm">
            {new Date(pedido.fecha).toLocaleDateString('es-PE')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Productos</h3>

            {pedido.detalles && pedido.detalles.length > 0 ? (
              pedido.detalles.map((detalle) => (
                <div key={detalle.id} className="flex gap-3 items-center py-3 border-b border-gray-200">
                  <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                    📷
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 text-sm">{detalle.productoNombre}</p>
                    <p className="text-gray-500 text-xs">Cantidad: {detalle.cantidad}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-xs">Precio: S/ {detalle.precioAcordado.toFixed(2)}</p>
                    <p className="text-gray-900 font-medium text-sm">
                      S/ {detalle.subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Sin detalle disponible</p>
            )}

            <div className="flex justify-between text-sm pt-3 mt-2">
              <span>Envio</span>
              <span>S/ {(pedido.costoEnvio || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 mt-1">
              <span>Total</span>
              <span>S/ {pedido.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Estado del pedido</h3>
              <p className="text-sm mb-2">
                Pago:{' '}
                <span className={`text-xs px-2 py-1 rounded-md ${LABELS_ESTADO_PAGO[estadoPago].color}`}>
                  {LABELS_ESTADO_PAGO[estadoPago].texto}
                </span>
              </p>
              <p className="text-sm">
                Entrega:{' '}
                <span className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700">
                  {LABELS_ESTADO_PEDIDO[pedido.estado]}
                </span>
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Datos de entrega</h3>
              <p className="text-gray-600 text-sm">
                Tipo: {LABELS_ESTADO_PEDIDO[pedido.tipoEntrega] || pedido.tipoEntrega}
              </p>
              {pedido.direccionEntrega && (
                <p className="text-gray-600 text-sm">Direccion: {pedido.direccionEntrega}</p>
              )}
              {pedido.numeroSeguimiento && (
                <p className="text-gray-600 text-sm">Seguimiento: {pedido.numeroSeguimiento}</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default DetallePedido