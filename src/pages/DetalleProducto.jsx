import { useState } from 'react'
import { ArrowLeft, ArrowRight, Minus, PackageCheck, Plus, ShoppingCart } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { ErrorState, LoadingState } from '../components/ui/AsyncState'
import ImageFallback from '../components/ui/ImageFallback'
import { useCarrito } from '../context/CarritoContext'
import { useApiGet } from '../hooks/useApiGet'
import { classNames, formatMoney } from '../utils/formatters'

function DetalleProducto() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { agregarProducto } = useCarrito()
  const { data: producto, loading, error, refetch } = useApiGet(`/productos/${id}`, null, 'No se pudo cargar el producto')
  const [cantidad, setCantidad] = useState(1)
  const [agregado, setAgregado] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-10">
          <LoadingState text="Cargando producto..." />
        </main>
      </div>
    )
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-10">
          <ErrorState message={error || 'Producto no encontrado'} onRetry={refetch} />
        </main>
      </div>
    )
  }

  const sinStock = Number(producto.stock || 0) < 1

  function handleAgregarCarrito() {
    agregarProducto(producto, cantidad)
    setAgregado(true)
    window.setTimeout(() => setAgregado(false), 2000)
  }

  function handleComprarAhora() {
    agregarProducto(producto, cantidad)
    navigate('/carrito')
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Link to="/tienda" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver a tienda
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section>
            <div className="aspect-[4/3] overflow-hidden rounded-md border border-gray-200 bg-gray-100">
              <ImageFallback src={producto.imagenUrl} alt={producto.nombre} />
            </div>
          </section>

          <section>
            <p className="mb-2 text-xs font-medium uppercase tracking-normal text-blue-700">
              {producto.categoriaNombre || 'Producto'}
            </p>
            <h1 className="text-2xl font-semibold text-gray-950">{producto.nombre}</h1>
            <p className="mt-2 text-sm text-gray-500">{producto.marca || 'Marca no especificada'}</p>
            <p className="mt-4 text-3xl font-semibold text-gray-950">{formatMoney(producto.precio)}</p>

            <span
              className={classNames(
                'mt-4 inline-flex rounded-md px-2.5 py-1 text-xs font-semibold',
                sinStock ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700',
              )}
            >
              {sinStock ? 'Sin stock' : `En stock (${producto.stock})`}
            </span>

            <p className="mt-6 text-sm leading-6 text-gray-600">
              {producto.descripcion || 'Sin descripcion disponible.'}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Cantidad</span>
              <div className="flex items-center rounded-md border border-gray-300">
                <button
                  type="button"
                  onClick={() => setCantidad((current) => Math.max(1, current - 1))}
                  disabled={cantidad <= 1 || sinStock}
                  className="flex h-10 w-10 items-center justify-center text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <span className="min-w-10 text-center text-sm font-medium">{cantidad}</span>
                <button
                  type="button"
                  onClick={() => setCantidad((current) => Math.min(producto.stock, current + 1))}
                  disabled={cantidad >= producto.stock || sinStock}
                  className="flex h-10 w-10 items-center justify-center text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleAgregarCarrito}
                disabled={sinStock}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                {agregado ? 'Agregado' : 'Agregar al carrito'}
              </button>
              <button
                type="button"
                onClick={handleComprarAhora}
                disabled={sinStock}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Comprar ahora
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-8 rounded-md border border-gray-200 bg-gray-50 p-4">
              <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-950">
                <PackageCheck className="h-4 w-4 text-blue-600" aria-hidden="true" />
                Informacion de entrega
              </p>
              <p className="text-sm leading-6 text-gray-500">Recojo en tienda, delivery en Lima o envio a provincia.</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default DetalleProducto
