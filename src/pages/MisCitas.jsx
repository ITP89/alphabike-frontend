import { useEffect, useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import AccountNav from '../components/AccountNav'
import Navbar from '../components/Navbar'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/AsyncState'
import { getApiErrorMessage } from '../utils/apiError'
import { classNames } from '../utils/formatters'

const LABELS_ESTADO = {
  PENDIENTE: { texto: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  EN_PROCESO: { texto: 'En proceso', color: 'bg-blue-100 text-blue-700' },
  COMPLETADO: { texto: 'Completado', color: 'bg-emerald-100 text-emerald-700' },
  CANCELADO: { texto: 'Cancelado', color: 'bg-gray-100 text-gray-700' },
}

function MisCitas() {
  const [citas, setCitas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  async function cargarCitas() {
    setCargando(true)
    setError('')

    try {
      const response = await api.get('/citas/mias')
      setCitas(response.data.data || [])
    } catch (err) {
      setCitas([])
      setError(getApiErrorMessage(err, 'No se pudieron cargar tus citas'))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarCitas()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[220px_1fr]">
        <AccountNav />

        <section className="min-w-0">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-950">Mis citas</h1>
              <p className="mt-1 text-sm text-gray-500">Consulta tus servicios agendados y su avance.</p>
            </div>
            <Link
              to="/agendar-cita"
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              Agendar cita
            </Link>
          </div>

          {cargando && <LoadingState text="Cargando citas..." />}
          {error && <ErrorState message={error} onRetry={cargarCitas} />}

          {!cargando && !error && citas.length === 0 && (
            <EmptyState title="Aun no tienes citas" description="Agenda un servicio para que aparezca en este listado." />
          )}

          {!cargando && !error && citas.length > 0 && (
            <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
              <div className="hidden grid-cols-4 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500 md:grid">
                <span>Servicio</span>
                <span>Bicicleta</span>
                <span>Fecha / hora</span>
                <span>Estado</span>
              </div>
              {citas.map((cita) => {
                const estado = LABELS_ESTADO[cita.estado] || { texto: cita.estado, color: 'bg-gray-100 text-gray-700' }

                return (
                  <Link
                    to={`/citas/${cita.id}`}
                    key={cita.id}
                    className="grid grid-cols-1 gap-2 border-t border-gray-200 px-4 py-4 text-sm hover:bg-gray-50 md:grid-cols-4 md:items-center md:gap-0"
                  >
                    <span className="font-medium text-gray-950">{cita.servicioNombre}</span>
                    <span className="text-gray-600">{cita.biciDescripcion || '-'}</span>
                    <span className="text-gray-600">{cita.fecha} {cita.hora}</span>
                    <span className={classNames('inline-flex w-fit rounded-md px-2 py-1 text-xs font-medium', estado.color)}>
                      {estado.texto}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default MisCitas
