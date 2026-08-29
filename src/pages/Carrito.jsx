import { ArrowLeft, ArrowRight, Minus, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ImageFallback from '../components/ui/ImageFallback'
import { useCarrito } from '../context/CarritoContext'
import { formatMoney } from '../utils/formatters'

const COSTOS_ENVIO = {
  RECOJO_TIENDA: 0,
  DELIVERY_LIMA: 10,
  ENVIO_PROVINCIA: 25,
}

function Carrito() {
  const { items, actualizarCantidad, eliminarProducto, subtotal } = useCarrito()
  const [tipoEntrega, setTipoEntrega] = useState('RECOJO_TIENDA')
  const navigate = useNavigate()

  const costoEnvio = COSTOS_ENVIO[tipoEntrega] ?? 0
  const total = subtotal + costoEnvio

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center">
          <p className="mb-4 text-sm text-gray-500">Tu carrito esta vacio.</p>
          <Link to="/tienda" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Ir a la tienda
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-950">Carrito de compras</h1>
            <p className="mt-1 text-sm text-gray-500">{items.length} producto{items.length !== 1 && 's'} seleccionado{items.length !== 1 && 's'}</p>
          </div>
          <Link to="/tienda" className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Seguir comprando
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <section className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
            {items.map((item) => (
              <article key={item.id} className="grid grid-cols-[72px_1fr] gap-4 p-4 sm:grid-cols-[80px_1fr_auto_auto] sm:items-center">
                <div className="h-20 overflow-hidden rounded-md bg-gray-100">
                  <ImageFallback src={item.imagenUrl} alt={item.nombre} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-950">{item.nombre}</p>
                  <p className="mt-1 text-xs text-gray-500">{item.marca || item.categoriaNombre || 'Producto'}</p>
                  <p className="mt-1 text-xs text-gray-500">Stock disponible: {item.stock}</p>
                </div>
                <div className="col-start-2 flex w-max items-center rounded-md border border-gray-300 sm:col-start-auto">
                  <button
                    type="button"
                    onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                    disabled={item.cantidad <= 1}
                    className="flex h-9 w-9 items-center justify-center text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Disminuir cantidad"
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="min-w-10 px-2 text-center text-sm font-medium">{item.cantidad}</span>
                  <button
                    type="button"
                    onClick={() => actualizarCantidad(item.id, Math.min(item.cantidad + 1, item.stock))}
                    disabled={item.cantidad >= item.stock}
                    className="flex h-9 w-9 items-center justify-center text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="col-start-2 flex items-center justify-between gap-3 sm:col-start-auto sm:block sm:text-right">
                  <p className="text-sm font-semibold text-gray-950">{formatMoney(item.precio * item.cantidad)}</p>
                  <button
                    type="button"
                    onClick={() => eliminarProducto(item.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
                    aria-label="Eliminar producto"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </section>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-gray-950">Resumen del pedido</h2>

              <label className="mb-4 block">
                <span className="mb-1 block text-sm font-medium text-gray-700">Tipo de entrega</span>
                <select
                  value={tipoEntrega}
                  onChange={(e) => setTipoEntrega(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="RECOJO_TIENDA">Recojo en tienda</option>
                  <option value="DELIVERY_LIMA">Delivery Lima</option>
                  <option value="ENVIO_PROVINCIA">Envio a provincia</option>
                </select>
              </label>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Costo de envio</span>
                  <span className="font-medium text-gray-900">{formatMoney(costoEnvio)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-semibold text-gray-950">
                  <span>Total</span>
                  <span>{formatMoney(total)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/checkout', { state: { tipoEntrega } })}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Continuar
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default Carrito
