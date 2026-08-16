import { useState, useEffect } from 'react'
import api from '../../api/axios'
import LayoutAdmin from '../../components/LayoutAdmin'

function GestionServicios() {
  const [servicios, setServicios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [editando, setEditando] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precioBase: '',
    duracionMin: '',
  })

  useEffect(() => {
    async function cargarServicios() {
      try {
        const response = await api.get('/servicios')
        setServicios(response.data.data)
      } catch (err) {
        console.error('Error cargando servicios', err)
      } finally {
        setCargando(false)
      }
    }
    cargarServicios()
  }, [])

  async function handleCrear(e) {
    e.preventDefault()
    setMensaje('')
    try {
      const response = await api.post('/servicios', {
        ...form,
        precioBase: parseFloat(form.precioBase),
        duracionMin: parseInt(form.duracionMin),
      })
      setServicios((prev) => [...prev, response.data.data])
      setForm({ nombre: '', descripcion: '', precioBase: '', duracionMin: '' })
      setMostrarFormulario(false)
      setMensaje('Servicio creado correctamente')
    } catch (err) {
      setMensaje('No se pudo crear el servicio')
    }
  }

  async function handleActualizar(e) {
    e.preventDefault()
    setMensaje('')
    try {
      const response = await api.put(`/servicios/${editando.id}`, {
        ...form,
        precioBase: parseFloat(form.precioBase),
        duracionMin: parseInt(form.duracionMin),
      })
      setServicios((prev) => prev.map((s) => s.id === editando.id ? response.data.data : s))
      setEditando(null)
      setForm({ nombre: '', descripcion: '', precioBase: '', duracionMin: '' })
      setMensaje('Servicio actualizado correctamente')
    } catch (err) {
      setMensaje('No se pudo actualizar el servicio')
    }
  }

  async function handleEliminar(id) {
    setMensaje('')
    try {
      await api.delete(`/servicios/${id}`)
      setServicios((prev) => prev.filter((s) => s.id !== id))
      setMensaje('Servicio eliminado')
    } catch (err) {
      setMensaje('No se pudo eliminar el servicio')
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
      <div className="flex justify-between items-baseline mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Gestion de servicios</h1>
        <button
          onClick={() => { setMostrarFormulario(!mostrarFormulario); setEditando(null) }}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {mostrarFormulario ? 'Cancelar' : '+ Nuevo servicio'}
        </button>
      </div>

      {mensaje && (
        <p className={`text-sm mb-4 ${mensaje.includes('correctamente') || mensaje.includes('eliminado') ? 'text-green-600' : 'text-red-600'}`}>
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
                {editando ? 'Editar servicio' : 'Nuevo servicio'}
              </h3>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Nombre del servicio"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  required
                />
                <textarea
                  placeholder="Descripcion"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows="2"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Precio base S/"
                  value={form.precioBase}
                  onChange={(e) => setForm({ ...form, precioBase: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  required
                />
                <input
                  type="number"
                  placeholder="Duracion estimada (min)"
                  value={form.duracionMin}
                  onChange={(e) => setForm({ ...form, duracionMin: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  required
                />
                <div className="flex gap-2">
                  <button type="submit"
                    className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700">
                    {editando ? 'Actualizar' : 'Crear'}
                  </button>
                  {editando && (
                    <button type="button"
                      onClick={() => { setEditando(null); setForm({ nombre: '', descripcion: '', precioBase: '', duracionMin: '' }) }}
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
            <p className="text-gray-500 text-sm">Cargando servicios...</p>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-5 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500">
                <span className="col-span-2">Nombre</span>
                <span>Precio base</span>
                <span>Duracion</span>
                <span>Acciones</span>
              </div>
              {servicios.length === 0 && (
                <p className="text-gray-500 text-sm px-4 py-3">No hay servicios</p>
              )}
              {servicios.map((servicio) => (
                <div key={servicio.id} className="grid grid-cols-5 px-4 py-3 border-t border-gray-200 text-sm items-center">
                  <div className="col-span-2">
                    <p className="text-gray-900 font-medium">{servicio.nombre}</p>
                    <p className="text-gray-500 text-xs">{servicio.descripcion || '—'}</p>
                  </div>
                  <span>S/ {Number(servicio.precioBase).toFixed(2)}</span>
                  <span>{servicio.duracionMin} min</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditar(servicio)}
                      className="text-xs border border-gray-300 px-2 py-1 rounded-md hover:bg-gray-50"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(servicio.id)}
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

export default GestionServicios