import { Link, useNavigate } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'
import { useState } from 'react'
import Navbar from '../components/Navbar'

const COSTOS_ENVIO = {
  RECOJO_TIENDA: 0,
  DELIVERY_LIMA: 10,
  ENVIO_PROVINCIA: 25,
}

function Carrito() {
  const { items, actualizarCantidad, eliminarProducto, subtotal } = useCarrito()
  const [tipoEntrega, setTipoEntrega] = useState('RECOJO_TIENDA')
  const navigate = useNavigate()

  const costoEnvio = COSTOS_ENVIO[tipoEntrega]
  const total = subtotal + costoEnvio

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">Tu carrito esta vacio</p>
          <Link to="/tienda" className="text-blue-600 hover:underline text-sm">
            Ir a la tienda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Carrito de compras</h1>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">

          {/* Items */}
          <div>
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 items-center py-3 border-b border-gray-200">
                <div className="w-14 h-14 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                  📷
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 text-sm">{item.nombre}</p>
                  <p className="text-gray-500 text-xs">{item.marca}</p>
                </div>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                    className="px-2 py-1"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-sm">{item.cantidad}</span>
                  <button
                    onClick={() => actualizarCantidad(item.id, Math.min(item.cantidad + 1, item.stock))}
                    className="px-2 py-1"
                  >
                    +
                  </button>
                </div>
                <p className="w-20 text-right text-sm font-medium text-gray-900">
                  S/ {(item.precio * item.cantidad).toFixed(2)}
                </p>
                <button
                  onClick={() => eliminarProducto(item.id)}
                  className="text-red-500 text-sm hover:text-red-700"
                >
                  🗑️
                </button>
              </div>
            ))}

            <Link to="/tienda" className="inline-block mt-4 text-sm text-blue-600 hover:underline">
              ← Seguir comprando
            </Link>
          </div>

          {/* Resumen */}
          <div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Resumen del pedido</h3>

              <div className="flex justify-between text-sm mb-2">
                <span>Subtotal</span>
                <span>S/ {subtotal.toFixed(2)}</span>
              </div>

              <div className="mb-2">
                <label className="text-sm text-gray-700 block mb-1">Tipo de entrega:</label>
                <select
                  value={tipoEntrega}
                  onChange={(e) => setTipoEntrega(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                >
                  <option value="RECOJO_TIENDA">Recojo en tienda</option>
                  <option value="DELIVERY_LIMA">Delivery Lima</option>
                  <option value="ENVIO_PROVINCIA">Envio a provincia</option>
                </select>
              </div>

              <div className="flex justify-between text-sm mb-3">
                <span>Costo de envio</span>
                <span>S/ {costoEnvio.toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-semibold text-gray-900 pt-3 border-t border-gray-200">
                <span>Total</span>
                <span>S/ {total.toFixed(2)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout', { state: { tipoEntrega } })}
                className="w-full bg-blue-600 text-white text-sm py-2 rounded-md mt-4 hover:bg-blue-700"
              >
                Proceder al pago
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Carrito