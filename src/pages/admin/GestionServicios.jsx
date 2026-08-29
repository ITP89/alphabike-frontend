import { useEffect, useState } from 'react'
import { Wrench, Plus, Sparkles, Edit, Trash2, X, Clock3 } from 'lucide-react'
import api from '../../api/axios'
import LayoutAdmin from '../../components/LayoutAdmin'
import Alert from '../../components/ui/Alert'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { getApiErrorMessage } from '../../utils/apiError'
import { formatMoney } from '../../utils/formatters'

const FORM_INICIAL = {
  nombre: '',
  descripcion: '',
  precioBase: '',
  duracionMin: '',
}

function GestionServicios() {
  const [servicios, setServicios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [editando, setEditando] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState(FORM_INICIAL)

  async function cargarServicios() {
    setCargando(true)
    setError('')

    try {
      const response = await api.get('/servicios')
      setServicios(response.data.data || [])
    } catch (err) {
      setServicios([])
      setError(getApiErrorMessage(err, 'No se pudieron cargar los servicios'))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarServicios()
  }, [])

  function resetForm() {
    setEditando(null)
    setMostrarFormulario(false)
    setForm(FORM_INICIAL)
  }

  function validarNumeros() {
    return Number(form.precioBase) > 0 && Number(form.duracionMin) > 0
  }

  async function handleCrear(e) {
    e.preventDefault()
    setMensaje(null)

    if (!validarNumeros()) {
      setMensaje({ type: 'error', text: 'El precio y la duración deben ser mayores a cero' })
      return
    }

    try {
      const response = await api.post('/servicios', {
        ...form,
        precioBase: parseFloat(form.precioBase),
        duracionMin: parseInt(form.duracionMin),
      })
      setServicios((prev) => [...prev, response.data.data])
      resetForm()
      setMensaje({ type: 'success', text: 'Servicio creado correctamente en Supabase' })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo crear el servicio') })
    }
  }

  async function handleActualizar(e) {
    e.preventDefault()
    setMensaje(null)

    if (!validarNumeros()) {
      setMensaje({ type: 'error', text: 'El precio y la duración deben ser mayores a cero' })
      return
    }

    try {
      const response = await api.put(`/servicios/${editando.id}`, {
        ...form,
        precioBase: parseFloat(form.precioBase),
        duracionMin: parseInt(form.duracionMin),
      })
      setServicios((prev) => prev.map((servicio) => (
        servicio.id === editando.id ? response.data.data : servicio
      )))
      resetForm()
      setMensaje({ type: 'success', text: 'Servicio actualizado correctamente' })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo actualizar el servicio') })
    }
  }

  async function handleEliminar(id) {
    setMensaje(null)

    try {
      await api.delete(`/servicios/${id}`)
      setServicios((prev) => prev.filter((servicio) => servicio.id !== id))
      setMensaje({ type: 'success', text: 'Servicio eliminado correctamente' })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo eliminar el servicio') })
    }
  }

  function handleEditar(servicio) {
    setEditando(servicio)
    setForm({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || '',
      precioBase: servicio.precioBase,
      duracionMin: servicio.duracionMin,
    })
    setMostrarFormulario(false)
  }

  return (
    <LayoutAdmin>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Catálogo de Taller Especializado</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Gestión de Servicios</h1>
          <p className="mt-0.5 text-xs text-slate-500">Administra los servicios de mantenimiento, tarifas y tiempos de atención.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setMostrarFormulario((open) => !open)
            setEditando(null)
            setForm(FORM_INICIAL)
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white hover:bg-amber-500 hover:text-slate-950 transition-all shadow-sm active:scale-95"
        >
          {mostrarFormulario || editando ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4 text-amber-400" />}
          {mostrarFormulario || editando ? 'Cancelar' : 'Nuevo Servicio'}
        </button>
      </div>

      {mensaje && <Alert type={mensaje.type} className="mb-4 font-bold shadow-sm">{mensaje.text}</Alert>}

      <div className={(mostrarFormulario || editando) ? 'grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]' : ''}>
        {(mostrarFormulario || editando) && (
          <form
            onSubmit={editando ? handleActualizar : handleCrear}
            className="rounded-2xl border border-amber-200 bg-white p-6 shadow-lg animate-fade-in"
          >
            <h2 className="mb-4 text-base font-black text-slate-900 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-amber-500" />
              {editando ? 'Editar Servicio' : 'Nuevo Servicio de Taller'}
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del servicio *</label>
                <input
                  type="text"
                  placeholder="Ej. Purga de Frenos Hidráulicos"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción técnica</label>
                <textarea
                  placeholder="Detalles del trabajo ejecutado..."
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows="3"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Precio Base (S/) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.precioBase}
                    onChange={(e) => setForm({ ...form, precioBase: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duración (min) *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="45"
                    value={form.duracionMin}
                    onChange={(e) => setForm({ ...form, duracionMin: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-amber-500 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 transition-all shadow-md active:scale-95"
                >
                  {editando ? 'Actualizar' : 'Guardar Servicio'}
                </button>
                {editando && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </form>
        )}

        <section>
          {cargando && <LoadingState text="Cargando servicios..." />}
          {error && <ErrorState message={error} onRetry={cargarServicios} />}

          {!cargando && !error && servicios.length === 0 && (
            <EmptyState title="No hay servicios" description="Crea servicios para mostrarlos en mantenimiento." />
          )}

          {!cargando && !error && servicios.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="hidden grid-cols-5 bg-slate-900 px-6 py-3 text-xs font-bold text-slate-300 md:grid">
                <span className="col-span-2">Nombre del Servicio</span>
                <span>Precio Base</span>
                <span>Duración Est.</span>
                <span className="text-right">Acciones</span>
              </div>
              {servicios.map((servicio) => (
                <div key={servicio.id} className="grid grid-cols-1 gap-2 border-t border-slate-100 px-6 py-3.5 text-xs first:border-t-0 md:grid-cols-5 md:items-center md:gap-0 hover:bg-slate-50 transition-colors">
                  <div className="md:col-span-2">
                    <p className="font-black text-slate-900">{servicio.nombre}</p>
                    <p className="text-[11px] font-medium text-slate-500">{servicio.descripcion || '-'}</p>
                  </div>
                  <span className="font-black text-slate-950 text-sm">{formatMoney(servicio.precioBase)}</span>
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                      <Clock3 className="h-3 w-3 text-amber-600" />
                      {servicio.duracionMin} min
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditar(servicio)}
                      className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1.5 rounded-xl hover:bg-amber-500 hover:text-slate-950 transition-all"
                    >
                      <Edit className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEliminar(servicio.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold border border-red-200 text-red-600 px-2.5 py-1.5 rounded-xl hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </LayoutAdmin>
  )
}

export default GestionServicios
