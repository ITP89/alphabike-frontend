import { useState, useEffect } from 'react'
import api from '../../api/axios'
import LayoutEncargado from '../../components/LayoutEncargado'

function VentaPresencial() {
  const [productos, setProductos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [carrito, setCarrito] = useState([])
  const [metodoPago, setMetodoPago] = useState('EFECTIVO')
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    async function cargarProductos() {
      try {
        const response = await api.get('/productos')
        setProductos(response.data.data)
      } catch (err) {
        console.error('Error cargando productos', err)
      }
    }
    cargarProductos()
  }, [])

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.marca.toLowerCase().includes(busqueda.toLowerCase())
  )

  function agregarAlCarrito(producto) {
    setCarrito((prev) => {
      const existente = prev.find((item) => item.id === producto.id)
      if (existente) {
        return prev.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1, precioAcordado: item.precioAcordado }
            : item
        )
      }
      return [...prev, { ...producto, cantidad: 1, precioAcordado: producto.precio }]
    })
  }

  function actualizarPrecio(id, precio) {
    setCarrito((prev) =>
      prev.map((item) => item.id === id ? { ...item, precioAcordado: parseFloat(precio) } : item)
    )
  }

  function eliminarDelCarrito(id) {
    setCarrito((prev) => prev.filter((item) => item.id !== id))
  }

  const total = carrito.reduce((sum, item) => sum + item.precioAcordado * item.cantidad, 0)

  async function handleRegistrarVenta() {
    if (carrito.length === 0) return
    setProcesando(true)
    setMensaje('')

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
      setMensaje('Venta registrada correctamente')
    } catch (err) {
      setMensaje('No se pudo registrar la venta')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <LayoutEncargado>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Registrar venta presencial</h1>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">

        <div>
          <input
            type="text"
            placeholder="Buscar producto por nombre o marca..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full mb-4"
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {productosFiltrados.map((producto) => (
              <div key={producto.id} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="bg-gray-100 h-16 rounded-md mb-2 flex items-center justify-center text-gray-400">
                  📷
                </div>
                <p className="text-gray-900 text-sm font-medium">{producto.nombre}</p>
                <p className="text-gray-500 text-xs">S/ {Number(producto.precio).toFixed(2)} | Stock: {producto.stock}</p>
                <button
                  onClick={() => agregarAlCarrito(producto)}
                  disabled={producto.stock === 0}
                  className="w-full mt-2 bg-blue-600 text-white text-xs py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Agregar
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Detalle de venta</h3>

            {mensaje && (
              <p className={`text-sm mb-3 ${mensaje.includes('correctamente') ? 'text-green-600' : 'text-red-600'}`}>
                {mensaje}
              </p>
            )}

            {carrito.length === 0 ? (
              <p className="text-gray-500 text-sm">Agrega productos al carrito</p>
            ) : (
              <>
                <div className="flex flex-col gap-2 mb-3">
                  {carrito.map((item) => (
                    <div key={item.id} className="border-b border-gray-100 pb-2">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-900">{item.nombre}</p>
                        <button
                          onClick={() => eliminarDelCarrito(item.id)}
                          className="text-red-500 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex gap-2 mt-1 items-center">
                        <span className="text-xs text-gray-500">Cant: {item.cantidad}</span>
                        <span className="text-xs text-gray-500">|</span>
                        <span className="text-xs text-gray-500">Precio:</span>
                        <input
                          type="number"
                          value={item.precioAcordado}
                          onChange={(e) => actualizarPrecio(item.id, e.target.value)}
                          className="border border-gray-300 rounded px-1 py-0.5 text-xs w-20"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between font-semibold text-gray-900 mb-3">
                  <span>Total</span>
                  <span>S/ {total.toFixed(2)}</span>
                </div>

                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-3 bg-white"
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="YAPE">Yape / Plin</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select>

                <button
                  onClick={handleRegistrarVenta}
                  disabled={procesando}
                  className="w-full bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {procesando ? 'Registrando...' : 'Registrar venta'}
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </LayoutEncargado>
  )
}

export default VentaPresencial