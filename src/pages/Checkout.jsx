import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Navbar from '../components/Navbar'

const COSTOS_ENVIO = {
  RECOJO_TIENDA: 0,
  DELIVERY_LIMA: 10,
  ENVIO_PROVINCIA: 25,
}

const LABELS_ENTREGA = {
  RECOJO_TIENDA: 'Recojo en tienda',
  DELIVERY_LIMA: 'Delivery Lima',
  ENVIO_PROVINCIA: 'Envio a provincia',
}

function Checkout() {
  const { items, subtotal, vaciarCarrito } = useCarrito()
  const { usuario } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const tipoEntrega = location.state?.tipoEntrega || 'RECOJO_TIENDA'
  const costoEnvio = COSTOS_ENVIO[tipoEntrega]
  const total = subtotal + costoEnvio

  const [direccion, setDireccion] = useState('')
  const [distrito, setDistrito] = useState('')
  const [metodoPago, setMetodoPago] = useState('YAPE')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  if (!usuario) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">Debes iniciar sesion para continuar con la compra</p>
          <Link to="/login" className="text-blue-600 hover:underline text-sm">
            Iniciar sesion
          </Link>
        </div>
      </div>
    )
  }

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

  async function handleConfirmar() {
    setError('')

    if (tipoEntrega !== 'RECOJO_TIENDA' && !direccion.trim()) {
      setError('La direccion de entrega es obligatoria')
      return
    }

    setCargando(true)

    try {
      const detalles = items.map((item) => ({
        productoId: item.id,
        cantidad: item.cantidad,
      }))

      const direccionCompleta = tipoEntrega !== 'RECOJO_TIENDA'
        ? `${direccion}, ${distrito}`
        : null

      const response = await api.post('/pedidos', {
        tipoEntrega,
        direccionEntrega: direccionCompleta,
        detalles,
      })

      vaciarCarrito()
      navigate(`/pedidos/${response.data.data.id}`)
    } catch (err) {
      setError('No se pudo confirmar el pedido. Intenta nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Finalizar compra</h1>
        <p className="text-gray-500 text-sm mb-6">Carrito &gt; Datos de entrega y pago &gt; Confirmacion</p>

        {error && (
          <p className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-md mb-4">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">

          <div className="flex flex-col gap-4">

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Datos del cliente</h3>
              <p className="text-gray-600 text-sm">{usuario.nombre}</p>
              <p className="text-gray-600 text-sm">{usuario.email}</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Tipo de entrega seleccionado</h3>
              <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-700 mb-3">
                {LABELS_ENTREGA[tipoEntrega]}
              </div>

              {tipoEntrega !== 'RECOJO_TIENDA' && (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Direccion de entrega"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Distrito"
                    value={distrito}
                    onChange={(e) => setDistrito(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Metodo de pago</h3>
              <div className="flex flex-col gap-2 text-sm text-gray-700">
                <label>
                  <input
                    type="radio"
                    name="pago"
                    checked={metodoPago === 'YAPE'}
                    onChange={() => setMetodoPago('YAPE')}
                    className="mr-2"
                  />
                  Yape / Plin
                </label>
                <label>
                  <input
                    type="radio"
                    name="pago"
                    checked={metodoPago === 'TRANSFERENCIA'}
                    onChange={() => setMetodoPago('TRANSFERENCIA')}
                    className="mr-2"
                  />
                  Transferencia bancaria
                </label>
                <label>
                  <input
                    type="radio"
                    name="pago"
                    checked={metodoPago === 'EFECTIVO'}
                    onChange={() => setMetodoPago('EFECTIVO')}
                    className="mr-2"
                  />
                  Pago en tienda (al recoger)
                </label>
              </div>
            </div>

          </div>

          <div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Resumen del pedido</h3>
              <div className="flex justify-between text-sm mb-2">
                <span>{items.length} producto{items.length !== 1 && 's'}</span>
                <span>S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span>Envio</span>
                <span>S/ {costoEnvio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 pt-3 border-t border-gray-200 mb-4">
                <span>Total</span>
                <span>S/ {total.toFixed(2)}</span>
              </div>

              <button
                onClick={handleConfirmar}
                disabled={cargando}
                className="w-full bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {cargando ? 'Confirmando...' : 'Confirmar pedido'}
              </button>
              <p className="text-center text-xs text-gray-500 mt-2">
                Al confirmar, el pedido quedara como pendiente de pago
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Checkout