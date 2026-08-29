import { ArrowLeft, PackageCheck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { ErrorState, LoadingState } from '../components/ui/AsyncState'
import ImageFallback from '../components/ui/ImageFallback'
import { useApiGet } from '../hooks/useApiGet'
import { classNames, formatDate, formatMoney } from '../utils/formatters'

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

const LABELS_ENTREGA = {
  RECOJO_TIENDA: 'Recojo en tienda',
  DELIVERY_LIMA: 'Delivery Lima',
  ENVIO_PROVINCIA: 'Envio a provincia',
}

function DetallePedido() {
  const { id } = useParams()
  const { data: pedido, loading, error, refetch } = useApiGet(`/pedidos/${id}`, null, 'No se pudo cargar el pedido')

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-10">
          <LoadingState text="Cargando pedido..." />
        </main>
      </div>
    )
  }

  if (error || !pedido) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-10">
          <ErrorState message={error || 'Pedido no encontrado'} onRetry={refetch} />
        </main>
      </div>
    )
  }

  const estadoPago = pedido.estado === 'PAGADO' || pedido.estado === 'ENTREGADO' ? 'PAGADO' : 'PENDIENTE'
  const pago = LABELS_ESTADO_PAGO[estadoPago]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Link to="/pedidos" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Mis pedidos
        </Link>

        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-950">Pedido #{pedido.id?.slice(0, 8)}</h1>
            <p className="mt-1 text-sm text-gray-500">{formatDate(pedido.fecha)}</p>
          </div>
          <span className={classNames('w-max rounded-md px-2.5 py-1 text-xs font-semibold', pago.color)}>
            Pago {pago.texto.toLowerCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          <section>
            <h2 className="mb-3 text-base font-semibold text-gray-950">Productos</h2>

            {pedido.detalles && pedido.detalles.length > 0 ? (
              <div className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
                {pedido.detalles.map((detalle) => (
                  <article key={detalle.id} className="grid grid-cols-[56px_1fr] gap-3 p-4 sm:grid-cols-[64px_1fr_auto] sm:items-center">
                    <div className="h-14 overflow-hidden rounded-md bg-gray-100">
                      <ImageFallback src={detalle.imagenUrl} alt={detalle.productoNombre} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-950">{detalle.productoNombre}</p>
                      <p className="mt-1 text-xs text-gray-500">Cantidad: {detalle.cantidad}</p>
                    </div>
                    <div className="col-start-2 text-sm sm:col-start-auto sm:text-right">
                      <p className="text-xs text-gray-500">Precio: {formatMoney(detalle.precioAcordado)}</p>
                      <p className="font-semibold text-gray-950">{formatMoney(detalle.subtotal)}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
                Sin detalle disponible.
              </p>
            )}
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-950">
                <PackageCheck className="h-5 w-5 text-blue-600" aria-hidden="true" />
                Estado
              </h2>
              <div className="space-y-3 text-sm">
                <p className="flex justify-between gap-3">
                  <span className="text-gray-500">Pedido</span>
                  <span className="font-medium text-gray-950">{LABELS_ESTADO_PEDIDO[pedido.estado] || pedido.estado}</span>
                </p>
                <p className="flex justify-between gap-3">
                  <span className="text-gray-500">Entrega</span>
                  <span className="font-medium text-gray-950">{LABELS_ENTREGA[pedido.tipoEntrega] || pedido.tipoEntrega}</span>
                </p>
                {pedido.direccionEntrega && (
                  <p className="border-t border-gray-200 pt-3 text-gray-600">Direccion: {pedido.direccionEntrega}</p>
                )}
                {pedido.numeroSeguimiento && (
                  <p className="text-gray-600">Seguimiento: {pedido.numeroSeguimiento}</p>
                )}
              </div>
            </div>

            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-base font-semibold text-gray-950">Total</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Envio</span>
                  <span className="font-medium text-gray-900">{formatMoney(pedido.costoEnvio || 0)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-semibold text-gray-950">
                  <span>Total</span>
                  <span>{formatMoney(pedido.total)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default DetallePedido
