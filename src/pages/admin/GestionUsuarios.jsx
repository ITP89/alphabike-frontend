import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, Search, UserCheck, Lock, Unlock, History, Sparkles } from 'lucide-react'
import api from '../../api/axios'
import LayoutAdmin from '../../components/LayoutAdmin'
import Alert from '../../components/ui/Alert'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { getApiErrorMessage } from '../../utils/apiError'
import { classNames } from '../../utils/formatters'

const LABELS_ROL = {
  ADMIN: { texto: 'Admin', color: 'bg-amber-100 text-amber-900 border-amber-300 font-black' },
  ENCARGADO: { texto: 'Encargado', color: 'bg-blue-100 text-blue-800 border-blue-300 font-extrabold' },
  CLIENTE: { texto: 'Cliente', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' },
}

const FORM_INICIAL = { nombre: '', email: '', password: '', telefono: '', rol: 'ENCARGADO' }

function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtroRol, setFiltroRol] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [form, setForm] = useState(FORM_INICIAL)
  const [mensaje, setMensaje] = useState(null)
  const [error, setError] = useState('')

  async function cargarUsuarios() {
    setCargando(true)
    setError('')

    try {
      const response = await api.get('/usuarios')
      setUsuarios(response.data.data || [])
    } catch (err) {
      setUsuarios([])
      setError(getApiErrorMessage(err, 'No se pudieron cargar los usuarios'))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const usuariosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    return usuarios.filter((usuario) => {
      const coincideRol = filtroRol ? usuario.rol === filtroRol : true
      const coincideEstado = filtroEstado ? usuario.estado === filtroEstado : true
      const texto = `${usuario.nombre || ''} ${usuario.email || ''} ${usuario.telefono || ''}`.toLowerCase()
      const coincideBusqueda = !termino || texto.includes(termino)
      return coincideRol && coincideEstado && coincideBusqueda
    })
  }, [busqueda, filtroEstado, filtroRol, usuarios])

  async function handleCrearUsuario(e) {
    e.preventDefault()
    setMensaje(null)

    try {
      const response = await api.post('/usuarios', {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        password: form.password,
        telefono: form.telefono.trim(),
        rol: form.rol,
      })
      setUsuarios((prev) => [...prev, response.data.data])
      setMostrarFormulario(false)
      setForm(FORM_INICIAL)
      setMensaje({ type: 'success', text: 'Usuario registrado correctamente' })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo crear el usuario') })
    }
  }

  async function handleCambiarEstado(id, estadoActual) {
    const nuevoEstado = estadoActual === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
    setMensaje(null)

    try {
      const response = await api.patch(`/usuarios/${id}/estado?estado=${nuevoEstado}`)
      setUsuarios((prev) => prev.map((usuario) => (usuario.id === id ? response.data.data : usuario)))
      setMensaje({ type: 'success', text: 'Estado del usuario actualizado' })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo cambiar el estado del usuario') })
    }
  }

  async function handleCambiarRol(id, rol) {
    setMensaje(null)

    try {
      const response = await api.patch(`/usuarios/${id}/rol?rol=${rol}`)
      setUsuarios((prev) => prev.map((usuario) => (usuario.id === id ? response.data.data : usuario)))
      setMensaje({ type: 'success', text: 'Rol del usuario actualizado' })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo cambiar el rol del usuario') })
    }
  }

  return (
    <LayoutAdmin>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Gestión de Roles & Accesos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Gestión de Usuarios</h1>
          <p className="mt-0.5 text-xs text-slate-500">Administra cuentas de clientes, técnicos encargados y administradores.</p>
        </div>
        <button
          type="button"
          onClick={() => setMostrarFormulario((open) => !open)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white hover:bg-amber-500 hover:text-slate-950 transition-all shadow-sm active:scale-95"
        >
          <UserPlus className="h-4 w-4 text-amber-400" />
          {mostrarFormulario ? 'Cancelar' : 'Nuevo Usuario'}
        </button>
      </div>

      {mensaje && <Alert type={mensaje.type} className="mb-4 font-bold shadow-sm">{mensaje.text}</Alert>}

      {mostrarFormulario && (
        <form onSubmit={handleCrearUsuario} className="mb-8 rounded-2xl border border-amber-200 bg-white p-6 shadow-lg animate-fade-in">
          <h2 className="mb-4 text-base font-black text-slate-900 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-amber-500" />
            Registrar Nuevo Usuario
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nombre completo *</label>
              <input
                type="text"
                placeholder="Ej. Juan Pérez"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Correo electrónico *</label>
              <input
                type="email"
                placeholder="juan@ejemplo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono / WhatsApp *</label>
              <input
                type="text"
                placeholder="+51 987 654 321"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contraseña inicial *</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rol de asignación *</label>
              <select
                value={form.rol}
                onChange={(e) => setForm({ ...form, rol: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-extrabold text-slate-900 focus:bg-white focus:border-amber-500"
              >
                <option value="ENCARGADO">Encargado de Taller</option>
                <option value="ADMIN">Administrador General</option>
                <option value="CLIENTE">Cliente Regular</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="submit"
              className="rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 transition-all shadow-md active:scale-95"
            >
              Guardar Usuario
            </button>
          </div>
        </form>
      )}

      {/* Buscador y Filtros */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm focus:border-amber-500"
        >
          <option value="">Todos los Roles</option>
          <option value="ADMIN">Administradores</option>
          <option value="ENCARGADO">Encargados de Taller</option>
          <option value="CLIENTE">Clientes</option>
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm focus:border-amber-500"
        >
          <option value="">Todos los Estados</option>
          <option value="ACTIVO">Activos</option>
          <option value="INACTIVO">Inactivos</option>
        </select>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Buscar por nombre, correo o teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder-slate-400 shadow-sm focus:border-amber-500"
          />
        </div>
      </div>

      {cargando && <LoadingState text="Cargando lista de usuarios..." />}
      {error && <ErrorState message={error} onRetry={cargarUsuarios} />}

      {!cargando && !error && usuariosFiltrados.length === 0 && (
        <EmptyState title="No hay usuarios que mostrar" description="Prueba con otro rol, estado o texto de búsqueda." />
      )}

      {!cargando && !error && usuariosFiltrados.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="hidden grid-cols-6 bg-slate-900 px-6 py-3 text-xs font-bold text-slate-300 lg:grid">
            <span className="col-span-2">Usuario / Correo</span>
            <span>Teléfono</span>
            <span>Rol de Permisos</span>
            <span>Estado</span>
            <span className="text-right">Acciones</span>
          </div>

          {usuariosFiltrados.map((usuario) => {
            const rol = LABELS_ROL[usuario.rol] || { texto: usuario.rol, color: 'bg-slate-100 text-slate-700' }

            return (
              <div key={usuario.id} className="grid grid-cols-1 gap-2 border-t border-slate-100 px-6 py-3.5 text-xs first:border-t-0 lg:grid-cols-6 lg:items-center lg:gap-0 hover:bg-slate-50 transition-colors">
                <div className="lg:col-span-2">
                  <p className="font-extrabold text-slate-900">{usuario.nombre}</p>
                  <p className="text-[11px] font-medium text-slate-500">{usuario.email}</p>
                </div>
                <span className="font-semibold text-slate-600">{usuario.telefono || '-'}</span>
                <div>
                  <select
                    value={usuario.rol}
                    onChange={(e) => handleCambiarRol(usuario.id, e.target.value)}
                    className={classNames('rounded-xl border px-2.5 py-1 text-[11px] cursor-pointer focus:outline-none', rol.color)}
                  >
                    <option value="ADMIN">ADMINISTRADOR</option>
                    <option value="ENCARGADO">ENCARGADO TALLER</option>
                    <option value="CLIENTE">CLIENTE</option>
                  </select>
                </div>
                <div>
                  <span className={classNames(
                    'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase',
                    usuario.estado === 'ACTIVO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200',
                  )}>
                    {usuario.estado}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleCambiarEstado(usuario.id, usuario.estado)}
                    className={classNames(
                      'inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-[11px] font-bold transition-all',
                      usuario.estado === 'ACTIVO'
                        ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
                    )}
                  >
                    {usuario.estado === 'ACTIVO' ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                    {usuario.estado === 'ACTIVO' ? 'Inactivar' : 'Activar'}
                  </button>
                  <Link
                    to={`/admin/usuarios/${usuario.id}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    <History className="h-3 w-3 text-slate-500" />
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
