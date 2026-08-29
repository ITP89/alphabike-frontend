import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, CreditCard, FileText } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import LayoutEncargado from '../../components/LayoutEncargado'
import Alert from '../../components/ui/Alert'
import { ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { getApiErrorMessage } from '../../utils/apiError'
import { formatMoney } from '../../utils/formatters'

function DetalleCitaEncargado() {
  const { id } = useParams()
  const [cita, setCita] = useState(null)
  const [cotizacion, setCotizacion] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState(null)

  const [descCotizacion, setDescCotizacion] = useState('')
  const [montoCotizacion, setMontoCotizacion] = useState('')
  const [guardandoCotizacion, setGuardandoCotizacion] = useState(false)

  const [metodoPago, setMetodoPago] = useState('EFECTIVO')
  const [registrandoPago, setRegistrandoPago] = useState(false)

  const cargarDatos = useCallback(async () => {
    setCargando(true)
    setError('')

    try {
      const citaRes = await api.get(`/citas/${id}`)
      setCita(citaRes.data.data)

      try {
        const cotRes = await api.get(`/cotizaciones/cita/${id}`)
        setCotizacion(cotRes.data.data)
        setDescCotizacion(cotRes.data.data.descripcion || '')
        setMontoCotizacion(cotRes.data.data.monto || '')
      } catch {
        setCotizacion(null)
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo cargar la cita'))
    } finally {
      setCargando(false)
    }
  }, [id])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  async function cambiarEstado(estado) {
    setMensaje(null)

    try {
      const response = await api.patch(`/citas/${id}/estado?estado=${estado}`)
      setCita(response.data.data)
      setMensaje({ type: 'success', text: 'Estado actualizado correctamente' })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo cambiar el estado') })
    }
  }

  async function handleGuardarCotizacion(e) {
    e.preventDefault()
    setMensaje(null)

    if (Number(montoCotizacion) <= 0) {
      setMensaje({ type: 'error', text: 'El monto de la cotizacion debe ser mayor a cero' })
      return
    }

    setGuardandoCotizacion(true)

    try {
      const response = await api.post(`/cotizaciones/cita/${id}`, {
        descripcion: descCotizacion.trim(),
        monto: parseFloat(montoCotizacion),
      })
      setCotizacion(response.data.data)
      setMensaje({ type: 'success', text: 'Cotizacion guardada correctamente' })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo guardar la cotizacion') })
    } finally {
      setGuardandoCotizacion(false)
    }
  }

  async function handleRegistrarPago() {
    if (!cotizacion) return

    setRegistrandoPago(true)
    setMensaje(null)

    try {
      await api.post('/pagos', {
        referenciaTipo: 'COTIZACION',
        referenciaId: cotizacion.id,
        monto: cotizacion.monto,
        metodoPago,
      })
      setCotizacion((prev) => ({ ...prev, estado: 'ACEPTADA' }))
      setCita((prev) => ({ ...prev, estado: 'COMPLETADO' }))
      setMensaje({ type: 'success', text: 'Pago registrado correctamente' })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo registrar el pago') })
    } finally {
      setRegistrandoPago(false)
    }
  }

  if (cargando) {
    return (
      <LayoutEncargado>
        <LoadingState text="Cargando cita..." />
      </LayoutEncargado>
    )
  }

  if (error || !cita) {
    return (
      <LayoutEncargado>
        <ErrorState message={error || 'Cita no encontrada'} onRetry={cargarDatos} />
      </LayoutEncargado>
    )
  }

  return (
    <LayoutEncargado>
      <Link to="/encargado/citas" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a citas
      </Link>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">{cita.servicioNombre}</h1>
          <p className="mt-1 text-sm text-gray-500">Cliente: {cita.clienteNombre}</p>
        </div>
        <select
          value={cita.estado}
          onChange={(e) => cambiarEstado(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm lg:w-56"
        >
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PROCESO">En proceso</option>
          <option value="COMPLETADO">Completado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      {mensaje && <Alert type={mensaje.type} className="mb-4">{mensaje.text}</Alert>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-semibold text-gray-950">Informacion de la cita</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Cliente: {cita.clienteNombre}</p>
              <p>Bicicleta: {cita.biciDescripcion || '-'}</p>
              <p>Fecha: {cita.fecha} {cita.hora}</p>
              <p>Descripcion: {cita.observaciones || '-'}</p>
              <p>Encargado: {cita.encargadoNombre || 'Sin asignar'}</p>
            </div>
          </div>

          <form onSubmit={handleGuardarCotizacion} className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-gray-950">
              <FileText className="h-4 w-4 text-blue-600" aria-hidden="true" />
              Cotizacion
            </h2>
            <textarea
              placeholder="Descripcion del trabajo a realizar"
              value={descCotizacion}
              onChange={(e) => setDescCotizacion(e.target.value)}
              rows="3"
              className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[160px_1fr]">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Monto S/"
                value={montoCotizacion}
                onChange={(e) => setMontoCotizacion(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={guardandoCotizacion}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {guardandoCotizacion ? 'Guardando...' : 'Guardar cotizacion'}
              </button>
            </div>
            {cotizacion && <p className="mt-3 text-xs text-gray-500">Estado: {cotizacion.estado}</p>}
          </form>
        </section>

        <section className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-gray-950">
            <CreditCard className="h-4 w-4 text-blue-600" aria-hidden="true" />
            Registrar pago
          </h2>
          {cotizacion ? (
            <>
              <p className="mb-3 text-sm text-gray-600">Monto: {formatMoney(cotizacion.monto)}</p>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="mb-3 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="YAPE">Yape</option>
                <option value="PLIN">Plin</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
              <button
                type="button"
                onClick={handleRegistrarPago}
                disabled={registrandoPago}
                className="w-full rounded-md bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {registrandoPago ? 'Registrando...' : 'Registrar pago'}
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-500">Genera una cotizacion primero.</p>
          )}
        </section>
      </div>
    </LayoutEncargado>
  )
}

export default DetalleCitaEncargado
