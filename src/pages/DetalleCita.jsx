import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'

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
  const [procesando, setProcesando] = useState(false)

  useEffect(() => {
    async function cargarDatos() {
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
        setError('No se pudo cargar la cita')
      } finally {
        setCargando(false)
      }
    }

    cargarDatos()
  }, [id])

  async function responderCotizacion(estado) {
    setProcesando(true)
    try {
      const response = await api.patch(`/cotizaciones/${cotizacion.id}/estado?estado=${estado}`)
      setCotizacion(response.data.data)
    } catch (err) {
      setError('No se pudo procesar tu respuesta')
    } finally {
      setProcesando(false)
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <p className="text-center text-gray-500 py-10">Cargando cita...</p>
      </div>
    )
  }

  if (error || !cita) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <p className="text-center text-red-600 py-10">{error || 'Cita no encontrada'}</p>
      </div>
    )
  }

  const estadoCita = LABELS_ESTADO_CITA[cita.estado] || { texto: cita.estado, color: 'bg-gray-100' }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link to="/citas" className="text-sm text-blue-600 hover:underline">
          ← Mis citas
        </Link>

        <h1 className="text-xl font-semibold text-gray-900 mt-2 mb-6">
          {cita.servicioNombre}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">

          <div className="flex flex-col gap-4">

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Informacion de la cita</h3>
              <p className="text-sm text-gray-600">Servicio: {cita.servicioNombre}</p>
              <p className="text-sm text-gray-600">Bicicleta: {cita.biciDescripcion || '—'}</p>
              <p className="text-sm text-gray-600">
                Fecha y hora: {cita.fecha} {cita.hora}
              </p>
              <p className="text-sm text-gray-600">Observaciones: {cita.observaciones || '—'}</p>
              <p className="text-sm text-gray-600">
                Atendido por: {cita.encargadoNombre || 'Sin asignar'}
              </p>
            </div>

            {cotizacion && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Cotizacion</h3>
                <p className="text-sm text-gray-600 mb-2">{cotizacion.descripcion}</p>
                <p className="text-lg font-semibold text-gray-900 mb-3">
                  Monto: S/ {cotizacion.monto.toFixed(2)}
                </p>

                {cotizacion.estado === 'PENDIENTE' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => responderCotizacion('ACEPTADA')}
                      disabled={procesando}
                      className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      Aceptar cotizacion
                    </button>
                    <button
                      onClick={() => responderCotizacion('RECHAZADA')}
                      disabled={procesando}
                      className="flex-1 border border-gray-300 text-sm py-2 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

          <div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Estado</h3>
              <p className="text-sm mb-2">
                Cita:{' '}
                <span className={`text-xs px-2 py-1 rounded-md ${estadoCita.color}`}>
                  {estadoCita.texto}
                </span>
              </p>
              <p className="text-sm">
                Cotizacion:{' '}
                {cotizacion ? (
                  <span className={`text-xs px-2 py-1 rounded-md ${LABELS_ESTADO_COTIZACION[cotizacion.estado].color}`}>
                    {LABELS_ESTADO_COTIZACION[cotizacion.estado].texto}
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700">
                    Sin cotizacion
                  </span>
                )}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default DetalleCita