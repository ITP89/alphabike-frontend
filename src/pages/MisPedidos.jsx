import { useEffect, useState } from 'react'
import { ArrowRight, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import AccountNav from '../components/AccountNav'
import Navbar from '../components/Navbar'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/AsyncState'
import { getApiErrorMessage } from '../utils/apiError'
import { classNames, formatDate, formatMoney } from '../utils/formatters'

const LABELS_ENTREGA = {
  RECOJO_TIENDA: 'Recojo en tienda',
  DELIVERY_LIMA: 'Delivery Lima',
  ENVIO_PROVINCIA: 'Envio a provincia',
}

const LABELS_ESTADO = {
  PENDIENTE: { texto: 'Pendiente de pago', color: 'bg-yellow-100 text-yellow-700' },
  PAGADO: { texto: 'Pagado', color: 'bg-emerald-100 text-emerald-700' },
  EN_PREPARACION: { texto: 'En preparacion', color: 'bg-gray-100 text-gray-700' },
  LISTO_PARA_RECOJO: { texto: 'Listo para recojo', color: 'bg-blue-100 text-blue-700' },
  EN_CAMINO: { texto: 'En camino', color: 'bg-blue-100 text-blue-700' },
  ENVIADO: { texto: 'Enviado', color: 'bg-blue-100 text-blue-700' },
  ENTREGADO: { texto: 'Entregado', color: 'bg-emerald-100 text-emerald-700' },
  CANCELADO: { texto: 'Cancelado', color: 'bg-red-100 text-red-700' },
}

function MisPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  async function cargarPedidos() {
    setCargando(true)
    setError('')

    try {
      const response = await api.get('/pedidos/mios')
      setPedidos(response.data.data || [])
    } catch (err) {
      setPedidos([])
      setError(getApiErrorMessage(err, 'No se pudieron cargar tus pedidos'))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarPedidos()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[220px_1fr]">
        <AccountNav />

        <section className="min-w-0">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-950">Mis pedidos</h1>
              <p className="mt-1 text-sm text-gray-500">Revisa el estado de tus compras y entregas.</p>
            </div>
            <Link
              to="/tienda"
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              Ir a tienda
            </Link>
          </div>

          {cargando && <LoadingState text="Cargando pedidos..." />}
          {error && <ErrorState message={error} onRetry={cargarPedidos} />}

          {!cargando && !error && pedidos.length === 0 && (
            <EmptyState title="Aun no tienes pedidos" description="Cuando compres en la tienda, tus pedidos apareceran aqui." />
          )}

          {!cargando && !error && pedidos.length > 0 && (
            <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
              <div className="hidden grid-cols-5 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500 md:grid">
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
                    className="grid grid-cols-1 gap-2 border-t border-gray-200 px-4 py-4 text-sm hover:bg-gray-50 md:grid-cols-5 md:items-center md:gap-0"
                  >
                    <span className="font-medium text-gray-950">#{pedido.id.slice(0, 8)}</span>
                    <span className="text-gray-600">{formatDate(pedido.fecha)}</span>
                    <span className="text-gray-600">{LABELS_ENTREGA[pedido.tipoEntrega] || pedido.tipoEntrega}</span>
                    <span className="font-medium text-gray-950">{formatMoney(pedido.total)}</span>
                    <span className={classNames('inline-flex w-fit rounded-md px-2 py-1 text-xs font-medium', estado.color)}>
                      {estado.texto}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 md:hidden">
                      Ver detalle
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default MisPedidos
