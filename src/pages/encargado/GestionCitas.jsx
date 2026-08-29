import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import LayoutEncargado from '../../components/LayoutEncargado'
import Alert from '../../components/ui/Alert'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { getApiErrorMessage } from '../../utils/apiError'
import { classNames } from '../../utils/formatters'

const LABELS_ESTADO = {
  PENDIENTE: { texto: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  EN_PROCESO: { texto: 'En proceso', color: 'bg-blue-100 text-blue-700' },
  COMPLETADO: { texto: 'Completado', color: 'bg-emerald-100 text-emerald-700' },
  CANCELADO: { texto: 'Cancelado', color: 'bg-gray-100 text-gray-700' },
}

function GestionCitas() {
  const [citas, setCitas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState(null)

  async function cargarCitas() {
    setCargando(true)
    setError('')

    try {
      const response = await api.get('/citas')
      setCitas(response.data.data || [])
    } catch (err) {
      setCitas([])
      setError(getApiErrorMessage(err, 'No se pudieron cargar las citas'))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarCitas()
  }, [])

  const citasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    return citas.filter((cita) => {
      const coincideEstado = filtroEstado ? cita.estado === filtroEstado : true
      const texto = `${cita.clienteNombre || ''} ${cita.servicioNombre || ''} ${cita.biciDescripcion || ''}`.toLowerCase()
      const coincideBusqueda = !termino || texto.includes(termino)
      return coincideEstado && coincideBusqueda
    })
  }, [busqueda, citas, filtroEstado])

  async function cambiarEstado(id, estado) {
    setMensaje(null)

    try {
      const response = await api.patch(`/citas/${id}/estado?estado=${estado}`)
      setCitas((prev) => prev.map((cita) => (cita.id === id ? response.data.data : cita)))
      setMensaje({ type: 'success', text: 'Estado actualizado correctamente' })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo cambiar el estado') })
    }
  }

  return (
    <LayoutEncargado>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-950">Gestion de citas</h1>
        <p className="mt-1 text-sm text-gray-500">Filtra, revisa y actualiza el avance de los servicios.</p>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[220px_1fr]">
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Estado: todos</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PROCESO">En proceso</option>
          <option value="COMPLETADO">Completado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
        <input
          type="search"
          placeholder="Buscar cliente, servicio o bicicleta"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {mensaje && <Alert type={mensaje.type} className="mb-4">{mensaje.text}</Alert>}
      {cargando && <LoadingState text="Cargando citas..." />}
      {error && <ErrorState message={error} onRetry={cargarCitas} />}

      {!cargando && !error && citasFiltradas.length === 0 && (
        <EmptyState title="No hay citas que mostrar" description="Prueba con otro estado o texto de busqueda." />
      )}

      {!cargando && !error && citasFiltradas.length > 0 && (
        <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
          <div className="hidden grid-cols-6 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500 lg:grid">
            <span>Fecha / hora</span>
            <span>Cliente</span>
            <span>Servicio</span>
            <span>Bicicleta</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>

          {citasFiltradas.map((cita) => {
            const estado = LABELS_ESTADO[cita.estado] || { texto: cita.estado, color: 'bg-gray-100 text-gray-700' }

            return (
              <div key={cita.id} className="grid grid-cols-1 gap-2 border-t border-gray-200 px-4 py-4 text-sm first:border-t-0 lg:grid-cols-6 lg:items-center lg:gap-0">
                <span className="font-medium text-gray-950">{cita.fecha} {cita.hora}</span>
                <span className="text-gray-700">{cita.clienteNombre}</span>
                <span className="text-gray-700">{cita.servicioNombre}</span>
                <span className="text-gray-600">{cita.biciDescripcion || '-'}</span>
                <span className={classNames('inline-flex w-fit rounded-md px-2 py-1 text-xs font-medium', estado.color)}>
                  {estado.texto}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {cita.estado === 'PENDIENTE' && (
                    <button
                      type="button"
                      onClick={() => cambiarEstado(cita.id, 'EN_PROCESO')}
                      className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      Iniciar
                    </button>
                  )}
                  {cita.estado === 'EN_PROCESO' && (
                    <button
                      type="button"
                      onClick={() => cambiarEstado(cita.id, 'COMPLETADO')}
                      className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                    >
                      Completar
                    </button>
                  )}
                  <Link
                    to={`/encargado/citas/${cita.id}`}
                    className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Ver
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </LayoutEncargado>
  )
}

export default GestionCitas
