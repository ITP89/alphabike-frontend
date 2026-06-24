import { useState, useEffect } from 'react'
import api from '../../api/axios'
import LayoutEncargado from '../../components/LayoutEncargado'

function GaleriaEncargado() {
  const [trabajos, setTrabajos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    imagenAntesUrl: '',
    imagenDespuesUrl: '',
    destacado: false,
  })

  useEffect(() => {
    async function cargarTrabajos() {
      try {
        const response = await api.get('/trabajos')
        setTrabajos(response.data.data)
      } catch (err) {
        console.error('Error cargando trabajos', err)
      } finally {
        setCargando(false)
      }
    }
    cargarTrabajos()
  }, [])

  async function handlePublicar(e) {
    e.preventDefault()
    setMensaje('')
    try {
      const response = await api.post('/trabajos', form)
      setTrabajos((prev) => [...prev, response.data.data])
      setMostrarFormulario(false)
      setForm({ titulo: '', descripcion: '', imagenAntesUrl: '', imagenDespuesUrl: '', destacado: false })
      setMensaje('Trabajo publicado correctamente')
    } catch (err) {
      setMensaje('No se pudo publicar el trabajo')
    }
  }

  async function handleEliminar(id) {
    try {
      await api.delete(`/trabajos/${id}`)
      setTrabajos((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      console.error('Error eliminando trabajo', err)
    }
  }

  return (
    <LayoutEncargado>
      <div className="flex justify-between items-baseline mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Galeria de trabajos</h1>
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {mostrarFormulario ? 'Cancelar' : '+ Publicar trabajo'}
        </button>
      </div>

      {mensaje && (
        <p className={`text-sm mb-4 ${mensaje.includes('correctamente') ? 'text-green-600' : 'text-red-600'}`}>
          {mensaje}
        </p>
      )}

      {mostrarFormulario && (
        <form onSubmit={handlePublicar} className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Publicar nuevo trabajo</h3>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Titulo del trabajo"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            />
            <textarea
              placeholder="Descripcion breve"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              rows="2"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="URL foto antes"
              value={form.imagenAntesUrl}
              onChange={(e) => setForm({ ...form, imagenAntesUrl: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="URL foto despues"
              value={form.imagenDespuesUrl}
              onChange={(e) => setForm({ ...form, imagenDespuesUrl: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.destacado}
                onChange={(e) => setForm({ ...form, destacado: e.target.checked })}
              />
              Destacar en la pagina de inicio
            </label>
            <button
              type="submit"
              className="bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700"
            >
              Publicar
            </button>
          </div>
        </form>
      )}

      {cargando ? (
        <p className="text-gray-500 text-sm">Cargando trabajos...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trabajos.length === 0 && (
            <p className="text-gray-500 text-sm">No hay trabajos publicados aun</p>
          )}
          {trabajos.map((trabajo) => (
            <div key={trabajo.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-2">
                <div className="h-32 bg-gray-100 flex items-center justify-center border-r border-gray-200">
                  {trabajo.imagenAntesUrl ? (
                    <img src={trabajo.imagenAntesUrl} alt="Antes" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-xs">Antes</span>
                  )}
                </div>
                <div className="h-32 bg-gray-100 flex items-center justify-center">
                  {trabajo.imagenDespuesUrl ? (
                    <img src={trabajo.imagenDespuesUrl} alt="Despues" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-xs">Despues</span>
                  )}
                </div>
              </div>
              <div className="p-3 flex justify-between items-center">
                <div>
                  <p className="text-gray-900 text-sm font-medium">{trabajo.titulo}</p>
                  {trabajo.destacado && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-md">Destacado</span>
                  )}
                </div>
                <button
                  onClick={() => handleEliminar(trabajo.id)}
                  className="text-red-500 text-xs hover:text-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </LayoutEncargado>
  )
}

export default GaleriaEncargado