import { useState, useEffect } from 'react'
import api from '../../api/axios'
import LayoutAdmin from '../../components/LayoutAdmin'

function GestionCategorias() {
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [editando, setEditando] = useState(null)
  const [mensaje, setMensaje] = useState('')

  const [form, setForm] = useState({ nombre: '', descripcion: '' })
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  useEffect(() => {
    async function cargarCategorias() {
      try {
        const response = await api.get('/categorias')
        setCategorias(response.data.data)
      } catch (err) {
        console.error('Error cargando categorias', err)
      } finally {
        setCargando(false)
      }
    }
    cargarCategorias()
  }, [])

  async function handleCrear(e) {
    e.preventDefault()
    setMensaje('')
    try {
      const response = await api.post('/categorias', form)
      setCategorias((prev) => [...prev, response.data.data])
      setForm({ nombre: '', descripcion: '' })
      setMostrarFormulario(false)
      setMensaje('Categoria creada correctamente')
    } catch (err) {
      setMensaje('No se pudo crear la categoria')
    }
  }

  async function handleActualizar(e) {
    e.preventDefault()
    setMensaje('')
    try {
      const response = await api.put(`/categorias/${editando.id}`, form)
      setCategorias((prev) => prev.map((c) => c.id === editando.id ? response.data.data : c))
      setEditando(null)
      setForm({ nombre: '', descripcion: '' })
      setMensaje('Categoria actualizada correctamente')
    } catch (err) {
      setMensaje('No se pudo actualizar la categoria')
    }
  }

  async function handleEliminar(id) {
    setMensaje('')
    try {
      await api.delete(`/categorias/${id}`)
      setCategorias((prev) => prev.filter((c) => c.id !== id))
      setMensaje('Categoria eliminada')
    } catch (err) {
      setMensaje('No se pudo eliminar — puede tener productos asociados')
    }
  }

  function handleEditar(categoria) {
    setEditando(categoria)
    setForm({ nombre: categoria.nombre, descripcion: categoria.descripcion || '' })
    setMostrarFormulario(false)
  }

  return (
    <LayoutAdmin>
      <div className="flex justify-between items-baseline mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Gestion de categorias</h1>
        <button
          onClick={() => { setMostrarFormulario(!mostrarFormulario); setEditando(null) }}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {mostrarFormulario ? 'Cancelar' : '+ Nueva categoria'}
        </button>
      </div>

      {mensaje && (
        <p className={`text-sm mb-4 ${mensaje.includes('correctamente') || mensaje.includes('eliminada') ? 'text-green-600' : 'text-red-600'}`}>
          {mensaje}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">

        <div>
          {(mostrarFormulario || editando) && (
            <form
              onSubmit={editando ? handleActualizar : handleCrear}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <h3 className="font-semibold text-gray-900 mb-3">
                {editando ? 'Editar categoria' : 'Nueva categoria'}
              </h3>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  required
                />
                <textarea
                  placeholder="Descripcion (opcional)"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows="2"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <button type="submit"
                    className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700">
                    {editando ? 'Actualizar' : 'Crear'}
                  </button>
                  {editando && (
                    <button type="button"
                      onClick={() => { setEditando(null); setForm({ nombre: '', descripcion: '' }) }}
                      className="flex-1 border border-gray-300 text-sm py-2 rounded-md hover:bg-gray-50">
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>

        <div>
          {cargando ? (
            <p className="text-gray-500 text-sm">Cargando categorias...</p>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-3 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500">
                <span>Nombre</span><span>Descripcion</span><span>Acciones</span>
              </div>
              {categorias.length === 0 && (
                <p className="text-gray-500 text-sm px-4 py-3">No hay categorias</p>
              )}
              {categorias.map((categoria) => (
                <div key={categoria.id} className="grid grid-cols-3 px-4 py-3 border-t border-gray-200 text-sm items-center">
                  <span className="text-gray-900 font-medium">{categoria.nombre}</span>
                  <span className="text-gray-500">{categoria.descripcion || '—'}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditar(categoria)}
                      className="text-xs border border-gray-300 px-2 py-1 rounded-md hover:bg-gray-50"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(categoria.id)}
                      className="text-xs border border-red-300 text-red-600 px-2 py-1 rounded-md hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </LayoutAdmin>
  )
}

export default GestionCategorias