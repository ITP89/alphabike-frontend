import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Sparkles, Play, CheckCircle2, Eye } from 'lucide-react'
import api from '../../api/axios'
import LayoutAdmin from '../../components/LayoutAdmin'
import Alert from '../../components/ui/Alert'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { getApiErrorMessage } from '../../utils/apiError'
import { classNames } from '../../utils/formatters'

const LABELS_ESTADO = {
  PENDIENTE: { texto: 'Pendiente', color: 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold' },
  EN_PROCESO: { texto: 'En Proceso', color: 'bg-blue-100 text-blue-900 border-blue-300 font-black' },
  COMPLETADO: { texto: 'Completado', color: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black' },
  CANCELADO: { texto: 'Cancelado', color: 'bg-slate-100 text-slate-700 border-slate-300' },
}

function AdminCitas() {
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
      setMensaje({ type: 'success', text: 'Estado de la cita actualizado correctamente' })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo cambiar el estado') })
    }
  }

  return (
    <LayoutAdmin>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Atención de Taller Mecánico</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Gestión de Citas</h1>
          <p className="mt-0.5 text-xs text-slate-500">Monitorea y actualiza el estado de las citas agendadas por los clientes.</p>
        </div>
      </div>

      {mensaje && <Alert type={mensaje.type} className="mb-4 font-bold shadow-sm">{mensaje.text}</Alert>}

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-[220px_1fr]">
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm focus:border-amber-500"
        >
          <option value="">Todos los Estados</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="EN_PROCESO">En Proceso</option>
          <option value="COMPLETADO">Completados</option>
          <option value="CANCELADO">Cancelados</option>
        </select>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Buscar por cliente, servicio o modelo de bicicleta..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder-slate-400 shadow-sm focus:border-amber-500"
          />
        </div>
      </div>

      {cargando && <LoadingState text="Cargando citas del taller..." />}
      {error && <ErrorState message={error} onRetry={cargarCitas} />}

      {!cargando && !error && citasFiltradas.length === 0 && (
        <EmptyState title="No hay citas que mostrar" description="Prueba cambiando el estado o el texto de búsqueda." />
      )}

      {!cargando && !error && citasFiltradas.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="hidden grid-cols-6 bg-slate-900 px-6 py-3 text-xs font-bold text-slate-300 lg:grid">
            <span>Fecha & Hora</span>
            <span>Cliente</span>
            <span>Servicio</span>
            <span>Bicicleta</span>
            <span>Estado</span>
            <span className="text-right">Acciones</span>
          </div>

          {citasFiltradas.map((cita) => {
            const estado = LABELS_ESTADO[cita.estado] || { texto: cita.estado, color: 'bg-slate-100 text-slate-700' }

            return (
              <div key={cita.id} className="grid grid-cols-1 gap-2 border-t border-slate-100 px-6 py-3.5 text-xs first:border-t-0 lg:grid-cols-6 lg:items-center lg:gap-0 hover:bg-slate-50 transition-colors">
                <span className="font-black text-slate-900">{cita.fecha} {cita.hora}</span>
                <span className="font-extrabold text-slate-800">{cita.clienteNombre}</span>
                <span className="font-bold text-amber-700">{cita.servicioNombre}</span>
                <span className="font-semibold text-slate-600">{cita.biciDescripcion || '-'}</span>
                <div>
                  <span className={classNames('inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-wide', estado.color)}>
                    {estado.texto}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  {cita.estado === 'PENDIENTE' && (
                    <button
                      type="button"
                      onClick={() => cambiarEstado(cita.id, 'EN_PROCESO')}
                      className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-2.5 py-1.5 text-[11px] font-extrabold text-white hover:bg-blue-700 shadow-sm active:scale-95 transition-all"
                    >
                      <Play className="h-3 w-3 fill-current" /> Iniciar
                    </button>
                  )}
                  {cita.estado === 'EN_PROCESO' && (
                    <button
                      type="button"
                      onClick={() => cambiarEstado(cita.id, 'COMPLETADO')}
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1.5 text-[11px] font-extrabold text-white hover:bg-emerald-700 shadow-sm active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="h-3 w-3" /> Completar
                    </button>
                  )}
                  <Link
                    to={`/admin/citas/${cita.id}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    <Eye className="h-3 w-3 text-slate-500" /> Ver Detalle
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </LayoutAdmin>
  )
}

export default AdminCitas
