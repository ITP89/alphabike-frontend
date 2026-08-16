import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import LayoutAdmin from '../../components/LayoutAdmin'

const LABELS_ROL = {
  ADMIN: { texto: 'Admin', color: 'bg-purple-100 text-purple-700' },
  ENCARGADO: { texto: 'Encargado', color: 'bg-blue-100 text-blue-700' },
  CLIENTE: { texto: 'Cliente', color: 'bg-gray-100 text-gray-700' },
}

function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtroRol, setFiltroRol] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', password: '', telefono: '', rol: 'ENCARGADO' })
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    async function cargarUsuarios() {
      try {
        const response = await api.get('/usuarios')
        setUsuarios(response.data.data)
      } catch (err) {
        console.error('Error cargando usuarios', err)
      } finally {
        setCargando(false)
      }
    }
    cargarUsuarios()
  }, [])

  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideRol = filtroRol ? u.rol === filtroRol : true
    const coincideEstado = filtroEstado ? u.estado === filtroEstado : true
    const coincideBusqueda = busqueda
      ? u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email.toLowerCase().includes(busqueda.toLowerCase())
      : true
    return coincideRol && coincideEstado && coincideBusqueda
  })

  async function handleCrearUsuario(e) {
    e.preventDefault()
    setMensaje('')
    try {
      const response = await api.post('/usuarios', form)
      setUsuarios((prev) => [...prev, response.data.data])
      setMostrarFormulario(false)
      setForm({ nombre: '', email: '', password: '', telefono: '', rol: 'ENCARGADO' })
      setMensaje('Usuario creado correctamente')
    } catch (err) {
      setMensaje('No se pudo crear el usuario')
    }
  }

  async function handleCambiarEstado(id, estadoActual) {
    const nuevoEstado = estadoActual === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
    try {
      const response = await api.patch(`/usuarios/${id}/estado?estado=${nuevoEstado}`)
      setUsuarios((prev) => prev.map((u) => u.id === id ? response.data.data : u))
    } catch (err) {
      console.error('Error cambiando estado', err)
    }
  }

  async function handleCambiarRol(id, rol) {
    try {
      const response = await api.patch(`/usuarios/${id}/rol?rol=${rol}`)
      setUsuarios((prev) => prev.map((u) => u.id === id ? response.data.data : u))
    } catch (err) {
      console.error('Error cambiando rol', err)
    }
  }

  return (
    <LayoutAdmin>
      <div className="flex justify-between items-baseline mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Gestion de usuarios</h1>
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {mostrarFormulario ? 'Cancelar' : '+ Nuevo encargado'}
        </button>
      </div>

      {mensaje && (
        <p className={`text-sm mb-4 ${mensaje.includes('correctamente') ? 'text-green-600' : 'text-red-600'}`}>
          {mensaje}
        </p>
      )}

      {mostrarFormulario && (
        <form onSubmit={handleCrearUsuario} className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Nuevo usuario</h3>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Nombre" value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm" required />
            <input type="email" placeholder="Correo" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm" required />
            <input type="text" placeholder="Telefono" value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm" required />
            <input type="password" placeholder="Contrasena" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm" required />
            <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
              <option value="ENCARGADO">Encargado</option>
              <option value="ADMIN">Admin</option>
              <option value="CLIENTE">Cliente</option>
            </select>
          </div>
          <button type="submit"
            className="mt-3 bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700">
            Crear usuario
          </button>
        </form>
      )}

      <div className="flex gap-3 mb-4">
        <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
          <option value="">Rol: todos</option>
          <option value="ADMIN">Admin</option>
          <option value="ENCARGADO">Encargado</option>
          <option value="CLIENTE">Cliente</option>
        </select>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
          <option value="">Estado: todos</option>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
        </select>
        <input type="text" placeholder="Buscar por nombre o correo"
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1" />
      </div>

      {cargando ? (
        <p className="text-gray-500 text-sm">Cargando usuarios...</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-6 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500">
            <span className="col-span-2">Usuario</span>
            <span>Telefono</span>
            <span>Rol</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>

          {usuariosFiltrados.map((usuario) => {
            const rol = LABELS_ROL[usuario.rol] || { texto: usuario.rol, color: 'bg-gray-100' }
            return (
              <div key={usuario.id} className="grid grid-cols-6 px-4 py-3 border-t border-gray-200 text-sm items-center">
                <div className="col-span-2">
                  <p className="text-gray-900">{usuario.nombre}</p>
                  <p className="text-gray-500 text-xs">{usuario.email}</p>
                </div>
                <span>{usuario.telefono}</span>
                <div>
                  <select
                    value={usuario.rol}
                    onChange={(e) => handleCambiarRol(usuario.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-md border-0 ${rol.color} cursor-pointer`}
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="ENCARGADO">Encargado</option>
                    <option value="CLIENTE">Cliente</option>
                  </select>
                </div>
                <span className={`text-xs px-2 py-1 rounded-md inline-block w-fit ${
                  usuario.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {usuario.estado}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCambiarEstado(usuario.id, usuario.estado)}
                    className="text-xs border border-gray-300 px-2 py-1 rounded-md hover:bg-gray-50"
                  >
                    {usuario.estado === 'ACTIVO' ? 'Inactivar' : 'Activar'}
                  </button>
                  <Link
                    to={`/admin/usuarios/${usuario.id}`}
                    className="text-xs border border-gray-300 px-2 py-1 rounded-md hover:bg-gray-50"
                  >
                    Historial
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

export default GestionUsuarios