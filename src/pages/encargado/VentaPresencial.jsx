import { useCallback, useEffect, useMemo, useState } from 'react'
import { CreditCard, Search, ShoppingCart, Trash2 } from 'lucide-react'
import api from '../../api/axios'
import LayoutEncargado from '../../components/LayoutEncargado'
import Alert from '../../components/ui/Alert'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/AsyncState'
import ImageFallback from '../../components/ui/ImageFallback'
import { getApiErrorMessage } from '../../utils/apiError'
import { formatMoney } from '../../utils/formatters'

function VentaPresencial() {
  const [productos, setProductos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [carrito, setCarrito] = useState([])
  const [metodoPago, setMetodoPago] = useState('EFECTIVO')
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [cargandoProductos, setCargandoProductos] = useState(true)
  const [errorProductos, setErrorProductos] = useState('')

  const cargarProductos = useCallback(async () => {
    setCargandoProductos(true)
    setErrorProductos('')

    try {
      const response = await api.get('/productos')
      setProductos(response.data.data || [])
    } catch (err) {
      setProductos([])
      setErrorProductos(getApiErrorMessage(err, 'No se pudieron cargar los productos'))
    } finally {
      setCargandoProductos(false)
    }
  }, [])

  useEffect(() => {
    cargarProductos()
  }, [cargarProductos])

  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()
    if (!termino) return productos

    return productos.filter((producto) => {
      const texto = `${producto.nombre || ''} ${producto.marca || ''} ${producto.categoriaNombre || ''}`.toLowerCase()
      return texto.includes(termino)
    })
  }, [busqueda, productos])

  function agregarAlCarrito(producto) {
    const stock = Number(producto.stock || 0)
    const cantidadActual = carrito.find((item) => item.id === producto.id)?.cantidad || 0

    if (stock < 1) {
      setMensaje({ type: 'error', text: `${producto.nombre} no tiene stock disponible` })
      return
    }

    if (cantidadActual >= stock) {
      setMensaje({ type: 'error', text: `Stock insuficiente para ${producto.nombre}` })
      return
    }

    setCarrito((prev) => {
      const existente = prev.find((item) => item.id === producto.id)
      if (existente) {
        return prev.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      }
      return [...prev, { ...producto, cantidad: 1, precioAcordado: Number(producto.precio || 0) }]
    })
    setMensaje(null)
  }

  function actualizarPrecio(id, precio) {
    setCarrito((prev) =>
      prev.map((item) => item.id === id ? { ...item, precioAcordado: Number(precio) } : item)
    )
  }

  function eliminarDelCarrito(id) {
    setCarrito((prev) => prev.filter((item) => item.id !== id))
  }

  const total = carrito.reduce((sum, item) => sum + Number(item.precioAcordado || 0) * item.cantidad, 0)

  async function handleRegistrarVenta() {
    if (carrito.length === 0) {
      setMensaje({ type: 'error', text: 'Agrega al menos un producto para registrar la venta' })
      return
    }

    if (carrito.some((item) => !item.precioAcordado || item.precioAcordado <= 0)) {
      setMensaje({ type: 'error', text: 'Todos los precios deben ser mayores a cero' })
      return
    }

    setProcesando(true)
    setMensaje(null)

    try {
      const response = await api.post('/pedidos', {
        tipoEntrega: 'RECOJO_TIENDA',
        direccionEntrega: null,
        detalles: carrito.map((item) => ({
          productoId: item.id,
          cantidad: item.cantidad,
          precioAcordado: item.precioAcordado,
        })),
      })

      await api.post('/pagos', {
        referenciaTipo: 'PEDIDO',
        referenciaId: response.data.data.id,
        monto: total,
        metodoPago,
      })

      setCarrito([])
      setMensaje({ type: 'success', text: 'Venta registrada correctamente' })
      cargarProductos()
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo registrar la venta') })
    } finally {
      setProcesando(false)
    }
  }

  return (
    <LayoutEncargado>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">Registrar venta presencial</h1>
          <p className="mt-1 text-sm text-gray-500">Selecciona productos, verifica stock y registra el pago en tienda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <section className="min-w-0">
          <label className="relative mb-4 block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar producto por nombre, marca o categoria"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm"
            />
          </label>

          {cargandoProductos && <LoadingState text="Cargando productos..." />}
          {errorProductos && <ErrorState message={errorProductos} onRetry={cargarProductos} />}

          {!cargandoProductos && !errorProductos && productosFiltrados.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {productosFiltrados.map((producto) => {
                const sinStock = Number(producto.stock || 0) < 1

                return (
                  <article key={producto.id} className="flex h-full flex-col rounded-md border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="mb-3 aspect-[4/3] overflow-hidden rounded-md bg-gray-100">
                      <ImageFallback src={producto.imagenUrl} alt={producto.nombre} />
                    </div>
                    <p className="text-xs font-medium uppercase tracking-normal text-blue-700">
                      {producto.categoriaNombre || 'Producto'}
                    </p>
                    <h2 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-950">{producto.nombre}</h2>
                    <p className="mt-1 text-xs text-gray-500">{producto.marca || 'Marca no especificada'}</p>
                    <p className="mt-3 text-base font-semibold text-gray-950">{formatMoney(producto.precio)}</p>
                    <p className={sinStock ? 'mt-1 text-xs font-medium text-red-600' : 'mt-1 text-xs font-medium text-emerald-700'}>
                      {sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
                    </p>
                    <button
                      type="button"
                      onClick={() => agregarAlCarrito(producto)}
                      disabled={sinStock}
                      className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                      Agregar
                    </button>
                  </article>
                )
              })}
            </div>
          )}

          {!cargandoProductos && !errorProductos && productosFiltrados.length === 0 && (
            <EmptyState title="No hay productos para mostrar" description="Prueba con otro texto de busqueda." />
          )}
        </section>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-950">
              <CreditCard className="h-5 w-5 text-blue-600" aria-hidden="true" />
              Detalle de venta
            </h2>

            {mensaje && <Alert type={mensaje.type} className="mb-4">{mensaje.text}</Alert>}

            {carrito.length === 0 ? (
              <p className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                Agrega productos al carrito para registrar una venta.
              </p>
            ) : (
              <>
                <div className="mb-4 max-h-[360px] space-y-3 overflow-auto pr-1">
                  {carrito.map((item) => (
                    <div key={item.id} className="rounded-md border border-gray-200 p-3">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-950">{item.nombre}</p>
                          <p className="text-xs text-gray-500">Cantidad: {item.cantidad}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => eliminarDelCarrito(item.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
                          aria-label="Eliminar producto de la venta"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                      <label className="block text-xs font-medium text-gray-600">
                        Precio acordado
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.precioAcordado}
                          onChange={(e) => actualizarPrecio(item.id, e.target.value)}
                          className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                        />
                      </label>
                    </div>
                  ))}
                </div>

                <div className="mb-4 flex justify-between border-t border-gray-200 pt-4 text-base font-semibold text-gray-950">
                  <span>Total</span>
                  <span>{formatMoney(total)}</span>
                </div>

                <label className="mb-4 block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">Metodo de pago</span>
                  <select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="YAPE">Yape</option>
                    <option value="PLIN">Plin</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                  </select>
                </label>

                <button
                  type="button"
                  onClick={handleRegistrarVenta}
                  disabled={procesando}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {procesando ? 'Registrando...' : 'Registrar venta'}
                </button>
              </>
            )}
          </div>
        </aside>
      </div>
    </LayoutEncargado>
  )
}

export default VentaPresencial
