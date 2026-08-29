import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, CalendarCheck, ClipboardCheck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Alert from '../components/ui/Alert'
import { ErrorState, LoadingState } from '../components/ui/AsyncState'
import { getApiErrorMessage } from '../utils/apiError'
import { formatMoney } from '../utils/formatters'

const LABELS_ESTADO_CITA = {
  PENDIENTE: { texto: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  EN_PROCESO: { texto: 'En proceso', color: 'bg-blue-100 text-blue-700' },
  COMPLETADO: { texto: 'Completado', color: 'bg-green-100 text-green-700' },
  CANCELADO: { texto: 'Cancelado', color: 'bg-gray-100 text-gray-700' },
}

const LABELS_ESTADO_COTIZACION = {
  PENDIENTE: { texto: 'Por aceptar', color: 'bg-yellow-100 text-yellow-700' },
  ACEPTADA: { texto: 'Aceptada', color: 'bg-green-100 text-green-700' },
  RECHAZADA: { texto: 'Rechazada', color: 'bg-red-100 text-red-700' },
}

function DetalleCita() {
  const { id } = useParams()
  const [cita, setCita] = useState(null)
  const [cotizacion, setCotizacion] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [procesando, setProcesando] = useState(false)

  const cargarDatos = useCallback(async () => {
    setCargando(true)
    setError('')

    try {
      const citaResponse = await api.get(`/citas/${id}`)
      setCita(citaResponse.data.data)

      try {
        const cotizacionResponse = await api.get(`/cotizaciones/cita/${id}`)
        setCotizacion(cotizacionResponse.data.data)
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

  async function responderCotizacion(estado) {
    setProcesando(true)
    setMensaje('')
    setError('')

    try {
      const response = await api.patch(`/cotizaciones/${cotizacion.id}/estado?estado=${estado}`)
      setCotizacion(response.data.data)
      setMensaje(estado === 'ACEPTADA' ? 'Cotizacion aceptada correctamente' : 'Cotizacion rechazada')
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo procesar tu respuesta'))
    } finally {
      setProcesando(false)
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-10">
          <LoadingState text="Cargando cita..." />
        </main>
      </div>
    )
  }

  if (error || !cita) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-10">
          <ErrorState message={error || 'Cita no encontrada'} onRetry={cargarDatos} />
        </main>
      </div>
    )
  }

  const estadoCita = LABELS_ESTADO_CITA[cita.estado] || { texto: cita.estado, color: 'bg-gray-100 text-gray-700' }
  const estadoCotizacion = cotizacion ? LABELS_ESTADO_COTIZACION[cotizacion.estado] : null

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Link to="/citas" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Mis citas
        </Link>

        {mensaje && <Alert type="success" className="mb-4">{mensaje}</Alert>}
        {error && <Alert type="error" className="mb-4">{error}</Alert>}

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-950">{cita.servicioNombre}</h1>
          <p className="mt-1 text-sm text-gray-500">Detalle de la cita y cotizacion asociada.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          <section className="space-y-4">
            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-950">
                <CalendarCheck className="h-5 w-5 text-blue-600" aria-hidden="true" />
                Informacion de la cita
              </h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Servicio: {cita.servicioNombre}</p>
                <p>Bicicleta: {cita.biciDescripcion || 'Sin descripcion'}</p>
                <p>Fecha y hora: {cita.fecha} {cita.hora}</p>
                <p>Observaciones: {cita.observaciones || 'Sin observaciones'}</p>
                <p>Atendido por: {cita.encargadoNombre || 'Sin asignar'}</p>
              </div>
            </div>

            {cotizacion && (
              <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-950">
                  <ClipboardCheck className="h-5 w-5 text-blue-600" aria-hidden="true" />
                  Cotizacion
                </h2>
                <p className="mb-3 text-sm leading-6 text-gray-600">{cotizacion.descripcion}</p>
                <p className="mb-4 text-lg font-semibold text-gray-950">
                  Monto: {formatMoney(cotizacion.monto)}
                </p>

                {cotizacion.estado === 'PENDIENTE' && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => responderCotizacion('ACEPTADA')}
                      disabled={procesando}
                      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Aceptar cotizacion
                    </button>
                    <button
                      type="button"
                      onClick={() => responderCotizacion('RECHAZADA')}
                      disabled={procesando}
                      className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-base font-semibold text-gray-950">Estado</h2>
              <div className="space-y-3 text-sm">
                <p className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Cita</span>
                  <span className={`rounded-md px-2 py-1 text-xs font-semibold ${estadoCita.color}`}>{estadoCita.texto}</span>
                </p>
                <p className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Cotizacion</span>
                  {estadoCotizacion ? (
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${estadoCotizacion.color}`}>{estadoCotizacion.texto}</span>
                  ) : (
                    <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">Sin cotizacion</span>
                  )}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default DetalleCita
