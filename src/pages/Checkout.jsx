import { useState } from 'react'
import { ArrowRight, Lock, MapPin, PackageCheck, UserCircle } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import ComprobanteModal from '../components/checkout/ComprobanteModal'
import PasarelaPago from '../components/checkout/PasarelaPago'
import Alert from '../components/ui/Alert'
import FormField from '../components/ui/FormField'
import { useAuth } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'
import { procesarPago, validarDatosTarjeta } from '../services/paymentGateway'
import { getApiErrorMessage } from '../utils/apiError'
import { formatMoney } from '../utils/formatters'

const COSTOS_ENVIO = {
  RECOJO_TIENDA: 0,
  DELIVERY_LIMA: 10,
  ENVIO_PROVINCIA: 25,
}

const LABELS_ENTREGA = {
  RECOJO_TIENDA: 'Recojo en tienda (AlphaBike Taller)',
  DELIVERY_LIMA: 'Delivery Express Lima Metropolitana',
  ENVIO_PROVINCIA: 'Envío a provincia (Agencia Shalom / Olva)',
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

  // Estado para la pasarela de pago modular
  const [metodoPago, setMetodoPago] = useState('TARJETA')
  const [datosPago, setDatosPago] = useState({
    tarjeta: {
      numero: '',
      titular: usuario?.nombre || '',
      expiracion: '',
      cvv: '',
      documentoTipo: 'DNI',
      documentoNumero: '',
    },
    yape: {
      telefono: usuario?.telefono || '',
      codigoOperacion: '',
    },
    transferencia: {
      banco: 'BCP',
      numeroOperacion: '',
    },
  })

  // Modal de comprobante tras pago exitoso
  const [comprobanteExitoso, setComprobanteExitoso] = useState(null)
  const [pedidoExitoso, setPedidoExitoso] = useState(null)

  function handleDatosPagoChange(seccion, valor) {
    setDatosPago((prev) => ({
      ...prev,
      [seccion]: valor,
    }))
    // Limpiar errores asociados a la sección
    setFieldErrors((prev) => {
      const actualizados = { ...prev }
      if (seccion === 'tarjeta') {
        delete actualizados.numero
        delete actualizados.titular
        delete actualizados.expiracion
        delete actualizados.cvv
      }
      if (seccion === 'yape') delete actualizados.yapeTelefono
      if (seccion === 'transferencia') delete actualizados.transferOperacion
      return actualizados
    })
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center">
          <UserCircle className="mb-4 h-10 w-10 text-gray-400" aria-hidden="true" />
          <p className="mb-4 text-sm text-gray-500">Debes iniciar sesión para continuar con la compra.</p>
          <Link to="/login" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Iniciar sesión
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0 && !comprobanteExitoso) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center">
          <PackageCheck className="mb-4 h-10 w-10 text-gray-400" aria-hidden="true" />
          <p className="mb-4 text-sm text-gray-500">Tu carrito está vacío.</p>
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
      errors.direccion = 'Ingresa una dirección válida con calle/avenida y número'
    }

    if (requiereDireccion && distrito.trim().length < 3) {
      errors.distrito = 'Ingresa el distrito de entrega'
    }

    setFieldErrors((prev) => ({ ...prev, ...errors }))
    return Object.keys(errors).length === 0
  }

  function validarPago() {
    const errors = {}

    if (metodoPago === 'TARJETA') {
      const resTarjeta = validarDatosTarjeta(datosPago.tarjeta)
      if (!resTarjeta.valido) {
        setFieldErrors((prev) => ({ ...prev, ...resTarjeta.errors }))
        return false
      }
    } else if (metodoPago === 'YAPE' || metodoPago === 'PLIN') {
      const tel = (datosPago.yape?.telefono || '').trim()
      if (!tel || tel.length < 9) {
        errors.yapeTelefono = 'Ingresa el número de 9 dígitos asociado a tu Yape/Plin'
      }
    } else if (metodoPago === 'TRANSFERENCIA') {
      const op = (datosPago.transferencia?.numeroOperacion || '').trim()
      if (!op || op.length < 4) {
        errors.transferOperacion = 'Ingresa el número de operación bancaria emitido por tu banco'
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...errors }))
      return false
    }

    return true
  }

  async function handleConfirmar() {
    setError('')

    const entregaOk = validarEntrega()
    const pagoOk = validarPago()

    if (!entregaOk || !pagoOk) {
      setError('Por favor revisa los campos requeridos en el formulario antes de continuar.')
      return
    }

    setCargando(true)

    try {
      const detalles = items.map((item) => ({
        productoId: item.id,
        cantidad: item.cantidad,
      }))

      const direccionCompleta = requiereDireccion
        ? `${direccion.trim()}, ${distrito.trim()}`
        : null

      // 1. Crear el pedido en el backend
      const response = await api.post('/pedidos', {
        tipoEntrega,
        direccionEntrega: direccionCompleta,
        detalles,
      })

      const nuevoPedido = response.data?.data || response.data

      // 2. Procesar el pago mediante la pasarela modular (Sandbox o Real)
      const comprobante = await procesarPago({
        metodo: metodoPago,
        monto: total,
        pedidoId: nuevoPedido.id,
        datosTarjeta: datosPago.tarjeta,
        datosYape: datosPago.yape,
        datosTransferencia: datosPago.transferencia,
        cliente: usuario,
      })

      // 3. Vaciar carrito y mostrar comprobante digital
      vaciarCarrito()
      setPedidoExitoso(nuevoPedido)
      setComprobanteExitoso(comprobante)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo procesar la transacción. Intenta nuevamente.'))
    } finally {
      setCargando(false)
    }
  }

  function handleContinuarTrasPago() {
    if (pedidoExitoso?.id) {
      navigate(`/pedidos/${pedidoExitoso.id}`)
    } else {
      navigate('/mis-pedidos')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">Finalizar Compra</h1>
            <p className="mt-1 text-xs text-slate-500 font-medium">AlphaBike Store • Checkout Seguro y Verificado</p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            <span>Pasarela de Pago Protegida</span>
          </div>
        </div>

        {error && <Alert type="error" className="mb-5 shadow-sm font-semibold">{error}</Alert>}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          {/* Columna Izquierda: Datos, Entrega y Pasarela */}
          <section className="space-y-5">
            {/* Datos del Cliente */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-800">
                <UserCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
                1. Datos del Cliente
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl bg-slate-50 p-3.5 text-xs">
                <div>
                  <span className="text-slate-400 block font-bold">Nombre Completo</span>
                  <p className="font-extrabold text-slate-900">{usuario.nombre}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">Correo Electrónico</span>
                  <p className="font-extrabold text-slate-900">{usuario.email}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">Teléfono de Contacto</span>
                  <p className="font-extrabold text-slate-900">{usuario.telefono || 'No registrado'}</p>
                </div>
              </div>
            </div>

            {/* Método de Entrega */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-800">
                <MapPin className="h-5 w-5 text-red-600" aria-hidden="true" />
                2. Método de Entrega
              </h2>
              <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs font-bold text-slate-800">
                {LABELS_ENTREGA[tipoEntrega]}
              </div>

              {requiereDireccion ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="Dirección exacta de entrega" error={fieldErrors.direccion}>
                    <input
                      type="text"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      placeholder="Ej. Av. Larco 743, Dpto 402"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                  </FormField>
                  <FormField label="Distrito / Ciudad" error={fieldErrors.distrito}>
                    <input
                      type="text"
                      value={distrito}
                      onChange={(e) => setDistrito(e.target.value)}
                      placeholder="Ej. Miraflores / Lima"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                  </FormField>
                </div>
              ) : (
                <p className="text-xs font-semibold text-slate-500 bg-slate-50 rounded-xl p-3 border border-dashed border-slate-200">
                  📍 Tu pedido será preparado y guardado en nuestro local principal. Te notificaremos cuando esté listo para su recojo inmediato.
                </p>
              )}
            </div>

            {/* 3. Pasarela de Pago Completa */}
            <div>
              <PasarelaPago
                total={total}
                tipoEntrega={tipoEntrega}
                metodoSeleccionado={metodoPago}
                onMetodoChange={setMetodoPago}
                datosPago={datosPago}
                onDatosPagoChange={handleDatosPagoChange}
                fieldErrors={fieldErrors}
              />
            </div>
          </section>

          {/* Columna Derecha: Resumen y CTA */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-black text-slate-900 border-b border-slate-100 pb-3">
                Resumen de Compra
              </h2>
              
              <div className="mb-4 max-h-56 space-y-3 overflow-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-3 text-xs border-b border-slate-50 pb-2.5 last:border-b-0">
                    <div>
                      <p className="font-extrabold text-slate-900 line-clamp-1">{item.nombre}</p>
                      <p className="text-[11px] font-semibold text-slate-400">Cantidad: {item.cantidad}</p>
                    </div>
                    <span className="font-black text-slate-900">{formatMoney(item.precio * item.cantidad)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-slate-200 pt-4 text-xs font-bold">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal productos</span>
                  <span className="text-slate-900">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Costo de envío</span>
                  <span className="text-slate-900">{costoEnvio === 0 ? '¡Gratis!' : formatMoney(costoEnvio)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-black text-slate-950">
                  <span>Total a Pagar</span>
                  <span className="text-red-600">{formatMoney(total)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmar}
                disabled={cargando}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white hover:bg-red-700 shadow-lg shadow-red-600/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {cargando ? (
                  <>Procesando Pago Seguro...</>
                ) : (
                  <>
                    {metodoPago === 'TARJETA' && `Pagar ${formatMoney(total)}`}
                    {metodoPago === 'YAPE' && `Pagar con Yape ${formatMoney(total)}`}
                    {metodoPago === 'PLIN' && `Pagar con Plin ${formatMoney(total)}`}
                    {metodoPago === 'TRANSFERENCIA' && `Confirmar Transferencia`}
                    {metodoPago === 'EFECTIVO' && `Confirmar Pedido Tienda`}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-400">
                <Lock className="h-3 w-3 text-emerald-600" />
                <span>Cifrado bancario seguro SSL 256-bit</span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Modal de Comprobante Electrónico */}
      <ComprobanteModal
        comprobante={comprobanteExitoso}
        pedido={pedidoExitoso}
        onContinuar={handleContinuarTrasPago}
      />
    </div>
  )
}

export default Checkout

