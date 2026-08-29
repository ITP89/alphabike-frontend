import { useState } from 'react'
import { Bike, CalendarCheck, Clock3, UserCircle, Wrench } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Alert from '../components/ui/Alert'
import { ErrorState, LoadingState } from '../components/ui/AsyncState'
import FormField from '../components/ui/FormField'
import { useAuth } from '../context/AuthContext'
import { useApiGet } from '../hooks/useApiGet'
import { getApiErrorMessage } from '../utils/apiError'
import { formatMoney } from '../utils/formatters'

const fechaMinima = new Date().toISOString().slice(0, 10)

function AgendarCita() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: servicios, loading, error: errorServicios, refetch } = useApiGet('/servicios', [], 'No se pudieron cargar los servicios')

  const [servicioId, setServicioId] = useState(location.state?.servicioId || '')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [biciDescripcion, setBiciDescripcion] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const servicioSeleccionado = servicios.find((servicio) => String(servicio.id) === String(servicioId))

  if (!usuario) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center">
          <UserCircle className="mb-4 h-10 w-10 text-gray-400" aria-hidden="true" />
          <p className="mb-4 text-sm text-gray-500">Debes iniciar sesion para agendar una cita.</p>
          <Link to="/login" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Iniciar sesion
          </Link>
        </div>
      </div>
    )
  }

  function clearField(field) {
    setFieldErrors((current) => ({ ...current, [field]: '' }))
    setError('')
  }

  function validate() {
    const errors = {}

    if (!servicioId) errors.servicioId = 'Selecciona un servicio'
    if (!fecha) errors.fecha = 'Selecciona una fecha'
    if (fecha && fecha < fechaMinima) errors.fecha = 'La fecha no puede ser anterior a hoy'
    if (!hora) errors.hora = 'Selecciona una hora'
    if (biciDescripcion.trim().length < 4) errors.biciDescripcion = 'Describe la bicicleta'

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!validate()) return

    setCargando(true)

    try {
      const response = await api.post('/citas', {
        servicioId,
        fecha,
        hora: `${hora}:00`,
        biciDescripcion: biciDescripcion.trim(),
        observaciones: observaciones.trim(),
      })
      navigate(`/citas/${response.data.data.id}`)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo agendar la cita. Intenta nuevamente.'))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[200px_1fr]">
        <aside>
          <h2 className="mb-3 text-sm font-semibold text-gray-950">Mi cuenta</h2>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/pedidos" className="text-gray-600 hover:text-blue-700">Mis pedidos</Link>
            <Link to="/citas" className="font-medium text-gray-950">Mis citas</Link>
            <Link to="/perfil" className="text-gray-600 hover:text-blue-700">Mi perfil</Link>
          </div>
        </aside>

        <section>
          <div className="mb-6">
            <p className="mb-2 inline-flex items-center gap-2 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              Nueva cita
            </p>
            <h1 className="text-2xl font-semibold text-gray-950">Agendar cita de mantenimiento</h1>
            <p className="mt-2 text-sm text-gray-500">Cuentanos sobre tu bicicleta y elige el horario que mas te acomode.</p>
          </div>

          {error && <Alert type="error" className="mb-4">{error}</Alert>}
          {loading && <LoadingState text="Cargando servicios..." />}
          {errorServicios && <ErrorState message={errorServicios} onRetry={refetch} />}

          {!loading && !errorServicios && (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
              <div className="space-y-4">
                <div className="rounded-md border border-gray-200 bg-white p-4">
                  <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-950">
                    <Wrench className="h-5 w-5 text-blue-600" aria-hidden="true" />
                    Servicio
                  </h2>
                  <FormField label="Servicio solicitado" error={fieldErrors.servicioId}>
                    <select
                      value={servicioId}
                      onChange={(e) => {
                        setServicioId(e.target.value)
                        clearField('servicioId')
                      }}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="">Selecciona un servicio</option>
                      {servicios.map((servicio) => (
                        <option key={servicio.id} value={servicio.id}>{servicio.nombre}</option>
                      ))}
                    </select>
                  </FormField>
                  {servicioSeleccionado && (
                    <p className="mt-3 text-xs text-gray-500">
                      Precio referencial: {formatMoney(servicioSeleccionado.precioBase)}. Puede variar segun diagnostico.
                    </p>
                  )}
                </div>

                <div className="rounded-md border border-gray-200 bg-white p-4">
                  <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-950">
                    <Bike className="h-5 w-5 text-blue-600" aria-hidden="true" />
                    Datos de la bicicleta
                  </h2>
                  <div className="space-y-3">
                    <FormField label="Marca, modelo o referencia" error={fieldErrors.biciDescripcion}>
                      <input
                        type="text"
                        value={biciDescripcion}
                        onChange={(e) => {
                          setBiciDescripcion(e.target.value)
                          clearField('biciDescripcion')
                        }}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                    </FormField>
                    <FormField label="Observaciones" hint="Opcional">
                      <textarea
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        rows="3"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                    </FormField>
                  </div>
                </div>

                <div className="rounded-md border border-gray-200 bg-white p-4">
                  <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-950">
                    <Clock3 className="h-5 w-5 text-blue-600" aria-hidden="true" />
                    Fecha y hora
                  </h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormField label="Fecha" error={fieldErrors.fecha}>
                      <input
                        type="date"
                        min={fechaMinima}
                        value={fecha}
                        onChange={(e) => {
                          setFecha(e.target.value)
                          clearField('fecha')
                        }}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                    </FormField>
                    <FormField label="Hora" error={fieldErrors.hora}>
                      <input
                        type="time"
                        value={hora}
                        onChange={(e) => {
                          setHora(e.target.value)
                          clearField('hora')
                        }}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                    </FormField>
                  </div>
                </div>
              </div>

              <aside className="lg:sticky lg:top-24 lg:self-start">
                <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
                  <h2 className="mb-4 text-base font-semibold text-gray-950">Resumen de la cita</h2>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium text-gray-950">Servicio:</span> {servicioSeleccionado?.nombre || 'Pendiente'}</p>
                    <p><span className="font-medium text-gray-950">Bicicleta:</span> {biciDescripcion || 'Pendiente'}</p>
                    <p><span className="font-medium text-gray-950">Fecha:</span> {fecha || 'Pendiente'}</p>
                    <p><span className="font-medium text-gray-950">Hora:</span> {hora || 'Pendiente'}</p>
                  </div>

                  <button
                    type="submit"
                    disabled={cargando}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {cargando ? 'Agendando...' : 'Confirmar cita'}
                    {!cargando && <CalendarCheck className="h-4 w-4" aria-hidden="true" />}
                  </button>
                  <p className="mt-3 text-center text-xs text-gray-500">
                    Recibiras una cotizacion final luego del diagnostico.
                  </p>
                </div>
              </aside>
            </form>
          )}
        </section>
      </main>
    </div>
  )
}

export default AgendarCita
