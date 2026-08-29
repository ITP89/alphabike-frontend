import { useEffect, useState } from 'react'
import { FolderTree, Plus, Sparkles, Edit, Trash2, X } from 'lucide-react'
import api from '../../api/axios'
import LayoutAdmin from '../../components/LayoutAdmin'
import Alert from '../../components/ui/Alert'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { getApiErrorMessage } from '../../utils/apiError'

const FORM_INICIAL = { nombre: '', descripcion: '' }

function GestionCategorias() {
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [editando, setEditando] = useState(null)
  const [mensaje, setMensaje] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState(FORM_INICIAL)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  async function cargarCategorias() {
    setCargando(true)
    setError('')

    try {
      const response = await api.get('/categorias')
      setCategorias(response.data.data || [])
    } catch (err) {
      setCategorias([])
      setError(getApiErrorMessage(err, 'No se pudieron cargar las categorías'))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarCategorias()
  }, [])

  function resetForm() {
    setForm(FORM_INICIAL)
    setEditando(null)
    setMostrarFormulario(false)
  }

  async function handleCrear(e) {
    e.preventDefault()
    setMensaje(null)

    try {
      const response = await api.post('/categorias', form)
      setCategorias((prev) => [...prev, response.data.data])
      resetForm()
      setMensaje({ type: 'success', text: 'Categoría creada correctamente en Supabase' })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo crear la categoría') })
    }
  }

  async function handleActualizar(e) {
    e.preventDefault()
    setMensaje(null)

    try {
      const response = await api.put(`/categorias/${editando.id}`, form)
      setCategorias((prev) => prev.map((categoria) => (
        categoria.id === editando.id ? response.data.data : categoria
      )))
      resetForm()
      setMensaje({ type: 'success', text: 'Categoría actualizada correctamente' })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo actualizar la categoría') })
    }
  }

  async function handleEliminar(id) {
    setMensaje(null)

    try {
      await api.delete(`/categorias/${id}`)
      setCategorias((prev) => prev.filter((categoria) => categoria.id !== id))
      setMensaje({ type: 'success', text: 'Categoría eliminada correctamente' })
    } catch (err) {
      setMensaje({
        type: 'error',
        text: getApiErrorMessage(err, 'No se pudo eliminar la categoría. Puede tener productos asociados.'),
      })
    }
  }

  function handleEditar(categoria) {
    setEditando(categoria)
    setForm({ nombre: categoria.nombre, descripcion: categoria.descripcion || '' })
    setMostrarFormulario(false)
  }

  return (
    <LayoutAdmin>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Clasificación de Catálogo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Gestión de Categorías</h1>
          <p className="mt-0.5 text-xs text-slate-500">Organiza los componentes, repuestos y accesorios de la tienda.</p>
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
          {mostrarFormulario || editando ? 'Cancelar' : 'Nueva Categoría'}
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
              <FolderTree className="h-5 w-5 text-amber-500" />
              {editando ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de categoría *</label>
                <input
                  type="text"
                  placeholder="Ej. Frenos e Hidráulicos"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción</label>
                <textarea
                  placeholder="Descripción de los repuestos incluidos..."
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows="3"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-amber-500 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 transition-all shadow-md active:scale-95"
                >
                  {editando ? 'Actualizar' : 'Guardar Categoría'}
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
          {cargando && <LoadingState text="Cargando categorías..." />}
          {error && <ErrorState message={error} onRetry={cargarCategorias} />}

          {!cargando && !error && categorias.length === 0 && (
            <EmptyState title="No hay categorías" description="Crea una categoría para clasificar los productos." />
          )}

          {!cargando && !error && categorias.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="hidden grid-cols-3 bg-slate-900 px-6 py-3 text-xs font-bold text-slate-300 md:grid">
                <span>Nombre Categoría</span>
                <span>Descripción</span>
                <span className="text-right">Acciones</span>
              </div>
              {categorias.map((categoria) => (
                <div key={categoria.id} className="grid grid-cols-1 gap-2 border-t border-slate-100 px-6 py-3.5 text-xs first:border-t-0 md:grid-cols-3 md:items-center md:gap-0 hover:bg-slate-50 transition-colors">
                  <span className="font-black text-slate-900">{categoria.nombre}</span>
                  <span className="font-medium text-slate-500">{categoria.descripcion || '-'}</span>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditar(categoria)}
                      className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1.5 rounded-xl hover:bg-amber-500 hover:text-slate-950 transition-all"
                    >
                      <Edit className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEliminar(categoria.id)}
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

export default GestionCategorias
