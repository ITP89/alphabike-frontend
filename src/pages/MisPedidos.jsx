import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'

const LABELS_ENTREGA = {
  RECOJO_TIENDA: 'Recojo en tienda',
  DELIVERY_LIMA: 'Delivery Lima',
  ENVIO_PROVINCIA: 'Envio a provincia',
}

const LABELS_ESTADO = {
  PENDIENTE: { texto: 'Pendiente de pago', color: 'bg-yellow-100 text-yellow-700' },
  PAGADO: { texto: 'Pagado', color: 'bg-green-100 text-green-700' },
  EN_PREPARACION: { texto: 'En preparacion', color: 'bg-gray-100 text-gray-700' },
  LISTO_PARA_RECOJO: { texto: 'Listo para recojo', color: 'bg-blue-100 text-blue-700' },
  EN_CAMINO: { texto: 'En camino', color: 'bg-blue-100 text-blue-700' },
  ENVIADO: { texto: 'Enviado', color: 'bg-blue-100 text-blue-700' },
  ENTREGADO: { texto: 'Entregado', color: 'bg-green-100 text-green-700' },
  CANCELADO: { texto: 'Cancelado', color: 'bg-red-100 text-red-700' },
}

function MisPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargarPedidos() {
      try {
        const response = await api.get('/pedidos/mios')
        setPedidos(response.data.data)
      } catch (err) {
        setError('No se pudieron cargar tus pedidos')
      } finally {
        setCargando(false)
      }
    }

    cargarPedidos()
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">

        {/* Sidebar */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Mi cuenta</h3>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/pedidos" className="text-gray-900 font-medium">Mis pedidos</Link>
            <Link to="/citas" className="text-gray-600 hover:text-blue-600">Mis citas</Link>
            <Link to="/perfil" className="text-gray-600 hover:text-blue-600">Mi perfil</Link>
          </div>
        </div>

        {/* Contenido */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Mis pedidos</h1>

          {cargando && <p className="text-gray-500 text-sm">Cargando pedidos...</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          {!cargando && !error && pedidos.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-3">Aun no tienes pedidos</p>
              <Link to="/tienda" className="text-blue-600 hover:underline text-sm">
                Ir a la tienda
              </Link>
            </div>
          )}

          {!cargando && !error && pedidos.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-5 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500">
                <span>Pedido</span>
                <span>Fecha</span>
                <span>Entrega</span>
                <span>Total</span>
                <span>Estado</span>
              </div>
              {pedidos.map((pedido) => {
                const estado = LABELS_ESTADO[pedido.estado] || { texto: pedido.estado, color: 'bg-gray-100 text-gray-700' }
                return (
                  <Link
                    to={`/pedidos/${pedido.id}`}
                    key={pedido.id}
                    className="grid grid-cols-5 px-4 py-3 border-t border-gray-200 text-sm items-center hover:bg-gray-50"
                  >
                    <span>#{pedido.id.slice(0, 8)}</span>
                    <span>{new Date(pedido.fecha).toLocaleDateString('es-PE')}</span>
                    <span>{LABELS_ENTREGA[pedido.tipoEntrega] || pedido.tipoEntrega}</span>
                    <span>S/ {pedido.total.toFixed(2)}</span>
                    <span className={`text-xs px-2 py-1 rounded-md inline-block w-fit ${estado.color}`}>
                      {estado.texto}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default MisPedidos