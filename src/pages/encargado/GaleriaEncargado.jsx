import { useEffect, useState } from 'react'
import { Camera, Trash2 } from 'lucide-react'
import api from '../../api/axios'
import LayoutEncargado from '../../components/LayoutEncargado'
import Alert from '../../components/ui/Alert'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/AsyncState'
import ImageFallback from '../../components/ui/ImageFallback'
import { getApiErrorMessage } from '../../utils/apiError'
import { formatDate } from '../../utils/formatters'

const FORM_INICIAL = {
  titulo: '',
  descripcion: '',
  imagenAntesUrl: '',
  imagenDespuesUrl: '',
  destacado: false,
}

function GaleriaEncargado() {
  const [trabajos, setTrabajos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState(FORM_INICIAL)

  async function cargarTrabajos() {
    setCargando(true)
    setError('')

    try {
      const response = await api.get('/trabajos')
      setTrabajos(response.data.data || [])
    } catch (err) {
      setTrabajos([])
      setError(getApiErrorMessage(err, 'No se pudieron cargar los trabajos'))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarTrabajos()
  }, [])

  async function handlePublicar(e) {
    e.preventDefault()
    setMensaje(null)

    try {
      const response = await api.post('/trabajos', {
        ...form,
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        imagenAntesUrl: form.imagenAntesUrl.trim(),
        imagenDespuesUrl: form.imagenDespuesUrl.trim(),
      })
      setTrabajos((prev) => [...prev, response.data.data])
      setMostrarFormulario(false)
      setForm(FORM_INICIAL)
      setMensaje({ type: 'success', text: 'Trabajo publicado correctamente' })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo publicar el trabajo') })
    }
  }

  async function handleEliminar(id) {
    setMensaje(null)

    try {
      await api.delete(`/trabajos/${id}`)
      setTrabajos((prev) => prev.filter((trabajo) => trabajo.id !== id))
      setMensaje({ type: 'success', text: 'Trabajo eliminado correctamente' })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo eliminar el trabajo') })
    }
  }

  return (
    <LayoutEncargado>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">Galeria de trabajos</h1>
          <p className="mt-1 text-sm text-gray-500">Publica resultados antes/despues para la pagina publica.</p>
        </div>
        <button
          type="button"
          onClick={() => setMostrarFormulario((open) => !open)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {mostrarFormulario ? 'Cancelar' : '+ Publicar trabajo'}
        </button>
      </div>

      {mensaje && <Alert type={mensaje.type} className="mb-4">{mensaje.text}</Alert>}

      {mostrarFormulario && (
        <form onSubmit={handlePublicar} className="mb-6 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-gray-950">
            <Camera className="h-4 w-4 text-blue-600" aria-hidden="true" />
            Publicar nuevo trabajo
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              type="text"
              placeholder="Titulo del trabajo"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            />
            <input
              type="text"
              placeholder="URL foto antes"
              value={form.imagenAntesUrl}
              onChange={(e) => setForm({ ...form, imagenAntesUrl: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="URL foto despues"
              value={form.imagenDespuesUrl}
              onChange={(e) => setForm({ ...form, imagenDespuesUrl: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.destacado}
                onChange={(e) => setForm({ ...form, destacado: e.target.checked })}
              />
              Destacar en inicio
            </label>
            <textarea
              placeholder="Descripcion breve"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              rows="3"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm md:col-span-2"
            />
          </div>
          <button type="submit" className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Publicar
          </button>
        </form>
      )}

      {cargando && <LoadingState text="Cargando trabajos..." />}
      {error && <ErrorState message={error} onRetry={cargarTrabajos} />}

      {!cargando && !error && trabajos.length === 0 && (
        <EmptyState title="No hay trabajos publicados" description="Publica trabajos para alimentar la galeria publica." />
      )}

      {!cargando && !error && trabajos.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {trabajos.map((trabajo) => (
            <article key={trabajo.id} className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
              <div className="grid aspect-[16/9] grid-cols-2">
                <div className="relative border-r border-gray-200">
                  <ImageFallback src={trabajo.imagenAntesUrl} alt={`${trabajo.titulo} antes`} />
                  <span className="absolute left-2 top-2 rounded bg-gray-950/80 px-2 py-1 text-xs font-medium text-white">Antes</span>
                </div>
                <div className="relative">
                  <ImageFallback src={trabajo.imagenDespuesUrl} alt={`${trabajo.titulo} despues`} />
                  <span className="absolute left-2 top-2 rounded bg-blue-600/90 px-2 py-1 text-xs font-medium text-white">Despues</span>
                </div>
              </div>
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-950">{trabajo.titulo}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{trabajo.descripcion || 'Sin descripcion'}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                    {trabajo.fecha && <span>{formatDate(trabajo.fecha)}</span>}
                    {trabajo.destacado && <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">Destacado</span>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleEliminar(trabajo.id)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
                  aria-label="Eliminar trabajo"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </LayoutEncargado>
  )
}

export default GaleriaEncargado
