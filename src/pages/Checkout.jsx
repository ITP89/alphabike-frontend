import { useState } from 'react'
import { ArrowRight, CreditCard, MapPin, PackageCheck, UserCircle } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Alert from '../components/ui/Alert'
import FormField from '../components/ui/FormField'
import { useAuth } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'
import { getApiErrorMessage } from '../utils/apiError'
import { formatMoney } from '../utils/formatters'

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
  const requiereDireccion = tipoEntrega !== 'RECOJO_TIENDA'
  const costoEnvio = COSTOS_ENVIO[tipoEntrega] ?? 0
  const total = subtotal + costoEnvio

  const [direccion, setDireccion] = useState('')
  const [distrito, setDistrito] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  if (!usuario) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center">
          <UserCircle className="mb-4 h-10 w-10 text-gray-400" aria-hidden="true" />
          <p className="mb-4 text-sm text-gray-500">Debes iniciar sesion para continuar con la compra.</p>
          <Link to="/login" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Iniciar sesion
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center">
          <PackageCheck className="mb-4 h-10 w-10 text-gray-400" aria-hidden="true" />
          <p className="mb-4 text-sm text-gray-500">Tu carrito esta vacio.</p>
          <Link to="/tienda" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Ir a la tienda
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    )
  }

  function validarEntrega() {
    const errors = {}

    if (requiereDireccion && direccion.trim().length < 6) {
      errors.direccion = 'Ingresa una direccion valida'
    }

    if (requiereDireccion && distrito.trim().length < 3) {
      errors.distrito = 'Ingresa el distrito'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleConfirmar() {
    setError('')

    if (!validarEntrega()) return

    setCargando(true)

    try {
      const detalles = items.map((item) => ({
        productoId: item.id,
        cantidad: item.cantidad,
      }))

      const direccionCompleta = requiereDireccion
        ? `${direccion.trim()}, ${distrito.trim()}`
        : null

      const response = await api.post('/pedidos', {
        tipoEntrega,
        direccionEntrega: direccionCompleta,
        detalles,
      })

      vaciarCarrito()
      navigate(`/pedidos/${response.data.data.id}`)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo confirmar el pedido. Intenta nuevamente.'))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-950">Finalizar compra</h1>
          <p className="mt-1 text-sm text-gray-500">Carrito / Entrega / Confirmacion del pedido</p>
        </div>

        {error && <Alert type="error" className="mb-4">{error}</Alert>}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <section className="space-y-4">
            <div className="rounded-md border border-gray-200 bg-white p-4">
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-950">
                <UserCircle className="h-5 w-5 text-blue-600" aria-hidden="true" />
                Datos del cliente
              </h2>
              <p className="text-sm text-gray-700">{usuario.nombre}</p>
              <p className="text-sm text-gray-500">{usuario.email}</p>
              {usuario.telefono && <p className="text-sm text-gray-500">{usuario.telefono}</p>}
            </div>

            <div className="rounded-md border border-gray-200 bg-white p-4">
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-950">
                <MapPin className="h-5 w-5 text-blue-600" aria-hidden="true" />
                Entrega
              </h2>
              <div className="mb-4 rounded-md bg-gray-50 p-3 text-sm font-medium text-gray-700">
                {LABELS_ENTREGA[tipoEntrega]}
              </div>

              {requiereDireccion ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField label="Direccion de entrega" error={fieldErrors.direccion}>
                    <input
                      type="text"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      placeholder="Av. Principal 123"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </FormField>
                  <FormField label="Distrito" error={fieldErrors.distrito}>
                    <input
                      type="text"
                      value={distrito}
                      onChange={(e) => setDistrito(e.target.value)}
                      placeholder="Miraflores"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </FormField>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Te avisaremos cuando el pedido este listo para recoger en tienda.</p>
              )}
            </div>

            <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
              <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-blue-950">
                <CreditCard className="h-5 w-5 text-blue-700" aria-hidden="true" />
                Pago
              </h2>
              <p className="text-sm leading-6 text-blue-800">
                Al confirmar se crea el pedido como pendiente. El encargado o administrador registrara el pago cuando verifique el monto y el metodo usado.
              </p>
            </div>
          </section>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-gray-950">Resumen del pedido</h2>
              <div className="mb-4 max-h-56 space-y-3 overflow-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-3 text-sm">
                    <div>
                      <p className="font-medium text-gray-800">{item.nombre}</p>
                      <p className="text-xs text-gray-500">Cantidad: {item.cantidad}</p>
                    </div>
                    <span className="font-medium text-gray-900">{formatMoney(item.precio * item.cantidad)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-gray-200 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Envio</span>
                  <span className="font-medium text-gray-900">{formatMoney(costoEnvio)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-semibold text-gray-950">
                  <span>Total</span>
                  <span>{formatMoney(total)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmar}
                disabled={cargando}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cargando ? 'Confirmando...' : 'Crear pedido'}
                {!cargando && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              </button>
              <p className="mt-3 text-center text-xs text-gray-500">
                El stock se valida nuevamente antes de crear el pedido.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default Checkout
