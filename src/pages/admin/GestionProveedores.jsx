import { useEffect, useMemo, useState } from 'react'
import { Building2, Edit, Mail, MapPin, Phone, Plus, Search, ShieldCheck, ToggleLeft, ToggleRight, X } from 'lucide-react'
import api from '../../api/axios'
import LayoutAdmin from '../../components/LayoutAdmin'
import Alert from '../../components/ui/Alert'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { getApiErrorMessage } from '../../utils/apiError'

const FORM_INICIAL = {
  nombre: '',
  ruc: '',
  telefono: '',
  email: '',
  direccion: '',
  contactoPrincipal: '',
}

function GestionProveedores() {
  const [proveedores, setProveedores] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(FORM_INICIAL)
  const [mensaje, setMensaje] = useState(null)
  const [error, setError] = useState('')

  async function cargarProveedores() {
    setCargando(true)
    setError('')

    try {
      const response = await api.get('/proveedores')
      setProveedores(response.data.data || [])
    } catch (err) {
      setProveedores([])
      setError(getApiErrorMessage(err, 'No se pudieron cargar los proveedores'))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarProveedores()
  }, [])

  const proveedoresFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()
    if (!termino) return proveedores

    return proveedores.filter((proveedor) => {
      const texto = `${proveedor.nombre || ''} ${proveedor.ruc || ''} ${proveedor.email || ''} ${proveedor.contactoPrincipal || ''}`.toLowerCase()
      return texto.includes(termino)
    })
  }, [busqueda, proveedores])

  function resetForm() {
    setForm(FORM_INICIAL)
    setEditando(null)
    setMostrarFormulario(false)
  }

  function abrirNuevo() {
    setForm(FORM_INICIAL)
    setEditando(null)
    setMostrarFormulario(true)
  }

  function abrirEdicion(proveedor) {
    setEditando(proveedor)
    setForm({
      nombre: proveedor.nombre || '',
      ruc: proveedor.ruc || '',
      telefono: proveedor.telefono || '',
      email: proveedor.email || '',
      direccion: proveedor.direccion || '',
      contactoPrincipal: proveedor.contactoPrincipal || '',
    })
    setMostrarFormulario(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMensaje(null)

    try {
      const response = editando
        ? await api.put(`/proveedores/${editando.id}`, form)
        : await api.post('/proveedores', form)

      setProveedores((prev) => {
        if (editando) {
          return prev.map((proveedor) => proveedor.id === editando.id ? response.data.data : proveedor)
        }
        return [response.data.data, ...prev]
      })
      resetForm()
      setMensaje({ type: 'success', text: editando ? 'Proveedor actualizado correctamente' : 'Proveedor registrado correctamente' })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo guardar el proveedor') })
    }
  }

  async function cambiarEstado(proveedor) {
    setMensaje(null)
    const siguienteEstado = proveedor.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'

    try {
      const response = await api.patch(`/proveedores/${proveedor.id}/estado?estado=${siguienteEstado}`)
      setProveedores((prev) => prev.map((item) => item.id === proveedor.id ? response.data.data : item))
      setMensaje({ type: 'success', text: `Proveedor ${siguienteEstado === 'ACTIVO' ? 'reactivado' : 'inactivado'} correctamente` })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo cambiar el estado del proveedor') })
    }
  }

  return (
    <LayoutAdmin>
      <div className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 inline-flex items-center gap-1.5 text-xs font-bold text-red-600">
            <ShieldCheck className="h-3.5 w-3.5" />
            Control de compras y abastecimiento
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Gestión de Proveedores</h1>
          <p className="mt-0.5 text-xs text-slate-500">Registra contactos comerciales, RUC y datos de abastecimiento para la tienda.</p>
        </div>
        <button
          type="button"
          onClick={mostrarFormulario ? resetForm : abrirNuevo}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white shadow-sm transition-all hover:bg-red-600 active:scale-95"
        >
          {mostrarFormulario ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4 text-red-300" />}
          {mostrarFormulario ? 'Cancelar' : 'Nuevo Proveedor'}
        </button>
      </div>

      {mensaje && <Alert type={mensaje.type} className="mb-4 font-bold shadow-sm">{mensaje.text}</Alert>}

      <div className={mostrarFormulario ? 'grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]' : ''}>
        {mostrarFormulario && (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-red-100 bg-white p-6 shadow-lg">
            <h2 className="mb-4 flex items-center gap-2 text-base font-black text-slate-900">
              <Building2 className="h-5 w-5 text-red-600" />
              {editando ? 'Editar proveedor' : 'Registrar proveedor'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Nombre comercial *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(event) => setForm({ ...form, nombre: event.target.value })}
                  placeholder="Ej. Importadora Bike Parts SAC"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">RUC *</label>
                  <input
                    type="text"
                    value={form.ruc}
                    onChange={(event) => setForm({ ...form, ruc: event.target.value })}
                    placeholder="20123456789"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-red-500 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Contacto principal</label>
                  <input
                    type="text"
                    value={form.contactoPrincipal}
                    onChange={(event) => setForm({ ...form, contactoPrincipal: event.target.value })}
                    placeholder="Ej. Rosa Pérez"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-red-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Teléfono *</label>
                  <input
                    type="text"
                    value={form.telefono}
                    onChange={(event) => setForm({ ...form, telefono: event.target.value })}
                    placeholder="+51 999 999 999"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-red-500 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Correo *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="ventas@proveedor.pe"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-red-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Dirección *</label>
                <textarea
                  value={form.direccion}
                  onChange={(event) => setForm({ ...form, direccion: event.target.value })}
                  placeholder="Dirección fiscal o almacén principal"
                  rows="3"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-red-500 focus:bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-red-600 py-2.5 text-xs font-black text-white shadow-md transition-all hover:bg-red-500 active:scale-95"
              >
                {editando ? 'Guardar Cambios' : 'Registrar Proveedor'}
              </button>
            </div>
          </form>
        )}

        <section>
          <label className="relative mb-5 block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por nombre, RUC, correo o contacto..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            />
          </label>

          {cargando && <LoadingState text="Cargando proveedores..." />}
          {error && <ErrorState message={error} onRetry={cargarProveedores} />}

          {!cargando && !error && proveedoresFiltrados.length === 0 && (
            <EmptyState title="No hay proveedores" description="Registra proveedores para controlar abastecimiento y compras." />
          )}

          {!cargando && !error && proveedoresFiltrados.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="hidden grid-cols-12 bg-slate-900 px-6 py-3 text-xs font-bold text-slate-300 lg:grid">
                <span className="col-span-3">Proveedor</span>
                <span className="col-span-2">RUC</span>
                <span className="col-span-3">Contacto</span>
                <span className="col-span-2">Estado</span>
                <span className="col-span-2 text-right">Acciones</span>
              </div>

              {proveedoresFiltrados.map((proveedor) => (
                <div key={proveedor.id} className="grid grid-cols-1 gap-3 border-t border-slate-100 px-6 py-4 text-xs first:border-t-0 lg:grid-cols-12 lg:items-center lg:gap-0">
                  <div className="col-span-3">
                    <p className="font-black text-slate-900">{proveedor.nombre}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                      <MapPin className="h-3 w-3 text-red-500" />
                      {proveedor.direccion}
                    </p>
                  </div>
                  <div className="col-span-2 font-bold text-slate-700">{proveedor.ruc}</div>
                  <div className="col-span-3 space-y-1 font-semibold text-slate-600">
                    <p>{proveedor.contactoPrincipal || 'Sin contacto asignado'}</p>
                    <p className="flex items-center gap-1 text-[11px]"><Phone className="h-3 w-3 text-emerald-600" /> {proveedor.telefono}</p>
                    <p className="flex items-center gap-1 text-[11px]"><Mail className="h-3 w-3 text-blue-600" /> {proveedor.email}</p>
                  </div>
                  <div className="col-span-2">
                    <span className={proveedor.estado === 'ACTIVO'
                      ? 'inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700 ring-1 ring-emerald-200'
                      : 'inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-500 ring-1 ring-slate-200'}
                    >
                      {proveedor.estado}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => abrirEdicion(proveedor)}
                      className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-700 transition-all hover:bg-amber-500 hover:text-slate-950"
                    >
                      <Edit className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => cambiarEstado(proveedor)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100"
                    >
                      {proveedor.estado === 'ACTIVO' ? <ToggleLeft className="h-3.5 w-3.5" /> : <ToggleRight className="h-3.5 w-3.5" />}
                      {proveedor.estado === 'ACTIVO' ? 'Inactivar' : 'Activar'}
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

export default GestionProveedores
