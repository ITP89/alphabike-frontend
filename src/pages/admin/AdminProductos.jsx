import { useRefreshCatalogo } from '../../hooks/useRefreshCatalogo'
import { useState, useEffect } from 'react'
import { ImagePlus, Upload, Plus, Search, X } from 'lucide-react'
import api from '../../api/axios'
import LayoutAdmin from '../../components/LayoutAdmin'
import Alert from '../../components/ui/Alert'
import { ErrorState, LoadingState } from '../../components/ui/AsyncState'
import InventarioProductos from '../../components/InventarioProductos'
import ImageFallback from '../../components/ui/ImageFallback'
import { getApiErrorMessage } from '../../utils/apiError'

function AdminProductos() {
  const refreshCatalogo = useRefreshCatalogo()
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [editandoStock, setEditandoStock] = useState(null)
  const [nuevoStock, setNuevoStock] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(null) // ID del producto siendo editado o null
  const [categorias, setCategorias] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    marca: '',
    precio: '',
    precioMinimoVenta: '',
    stock: '',
    categoriaId: '',
    proveedorId: '',
    imagenUrl: ''
  })
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [prodRes, catRes, provRes] = await Promise.all([
          api.get('/productos/todos'),
          api.get('/categorias'),
          api.get('/proveedores'),
        ])
        setProductos(prodRes.data.data || [])
        setCategorias(catRes.data.data || [])
        setProveedores((provRes.data.data || []).filter((proveedor) => proveedor.estado === 'ACTIVO'))
      } catch (err) {
        setError(getApiErrorMessage(err, 'No se pudieron cargar los productos'))
      } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [])

  const productosFiltrados = productos.filter((p) =>
    (p.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.marca || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  // Conversión de archivo local a Data URL Base64 para almacenar en la BD
  function handleSeleccionarArchivo(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setMensaje({ type: 'error', text: 'La imagen no debe superar los 5MB' })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, imagenUrl: reader.result }))
      setMensaje({ type: 'success', text: 'Imagen cargada correctamente' })
      window.setTimeout(() => setMensaje(null), 2000)
    }
    reader.readAsDataURL(file)
  }

  function handleNuevoProducto() {
    setModoEdicion(null)
    setForm({ nombre: '', descripcion: '', marca: '', precio: '', precioMinimoVenta: '', stock: '', categoriaId: '', proveedorId: '', imagenUrl: '' })
    setMostrarFormulario(true)
  }

  function handleEditarProducto(producto) {
    setModoEdicion(producto.id)
    setForm({
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      marca: producto.marca || '',
      precio: producto.precio ? String(producto.precio) : '',
      precioMinimoVenta: producto.precioMinimoVenta ? String(producto.precioMinimoVenta) : '',
      stock: producto.stock !== undefined ? String(producto.stock) : '',
      categoriaId: producto.categoriaId || '',
      proveedorId: producto.proveedorId || '',
      imagenUrl: producto.imagenUrl || ''
    })
    setMostrarFormulario(true)
  }

  async function handleGuardarProducto(e) {
    e.preventDefault()
    setMensaje(null)

    const precio = Number(form.precio)
    const precioMinimo = form.precioMinimoVenta === '' ? precio : Number(form.precioMinimoVenta)

    if (!Number.isFinite(precio) || !Number.isFinite(precioMinimo) || precio <= 0 || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0 || precioMinimo <= 0 || precioMinimo > precio) {
      setMensaje({ type: 'error', text: 'Revisa precio y stock antes de guardar' })
      return
    }

    try {
      const payload = {
        ...form,
        precio: parseFloat(form.precio),
        precioMinimoVenta: precioMinimo,
        stock: parseInt(form.stock),
      }

      if (modoEdicion) {
        // Actualizar producto existente
        const response = await api.put(`/productos/${modoEdicion}`, payload)
        await refreshCatalogo()
        setProductos((prev) => prev.map((p) => p.id === modoEdicion ? response.data.data : p))
        setMensaje({ type: 'success', text: 'Producto actualizado correctamente' })
      } else {
        // Crear nuevo producto
        const response = await api.post('/productos', payload)
        await refreshCatalogo()
        setProductos((prev) => [response.data.data, ...prev])
        setMensaje({ type: 'success', text: 'Nuevo producto creado correctamente' })
      }

      setMostrarFormulario(false)
      setModoEdicion(null)
      setForm({ nombre: '', descripcion: '', marca: '', precio: '', precioMinimoVenta: '', stock: '', categoriaId: '', proveedorId: '', imagenUrl: '' })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo guardar el producto') })
    }
  }

  async function handleActualizarStock(id) {
    if (String(nuevoStock).trim() === '' || !Number.isInteger(Number(nuevoStock)) || Number(nuevoStock) < 0 || Number(nuevoStock) > 2147483647) {
      setMensaje({ type: 'error', text: 'El stock debe ser un entero entre 0 y 2147483647' })
      return
    }

    try {
      const response = await api.patch(`/productos/${id}/stock?stock=${nuevoStock}`)
      await refreshCatalogo()
      setProductos((prev) => prev.map((p) => p.id === id ? response.data.data : p))
      setEditandoStock(null)
      setNuevoStock('')
      setMensaje({ type: 'success', text: 'Stock actualizado correctamente' })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo actualizar el stock') })
    }
  }

  async function handleEliminar(id) {
    try {
      await api.delete(`/productos/${id}`)
      await refreshCatalogo()
      setProductos((prev) => prev.map((p) => p.id === id ? { ...p, estado: 'DESCONTINUADO' } : p))
      setMensaje({ type: 'success', text: 'Producto descontinuado correctamente' })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo descontinuar el producto') })
    }
  }

  return (
    <LayoutAdmin>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Gestión de Productos</h1>
          <p className="text-xs text-slate-500 mt-1">Sube imágenes, administra precios y controla el inventario.</p>
        </div>
        <button
          onClick={mostrarFormulario ? () => setMostrarFormulario(false) : handleNuevoProducto}
          className="inline-flex items-center gap-2 bg-slate-950 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-amber-500 hover:text-slate-950 transition-all shadow-sm active:scale-95"
        >
          {mostrarFormulario ? (
            <>
              <X className="h-4 w-4" /> Cancelar
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 text-amber-400" /> Nuevo Producto
            </>
          )}
        </button>
      </div>

      {/* Formulario de Registro / Edición con Upload de Imagen */}
      {mostrarFormulario && (
        <form onSubmit={handleGuardarProducto} className="glass-card rounded-2xl p-6 mb-8 border border-amber-200/60 shadow-lg animate-fade-in">
          <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
            <ImagePlus className="h-5 w-5 text-amber-500" />
            {modoEdicion ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Columna Izquierda: Datos Principales */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del producto *</label>
                  <input
                    type="text"
                    placeholder="Ej. Freno Shimano Deore"
                    maxLength={255}
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Marca *</label>
                  <input
                    type="text"
                    placeholder="Ej. Shimano, FOX, RockShox"
                    maxLength={255}
                    value={form.marca}
                    onChange={(e) => setForm({ ...form, marca: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Precio (S/) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.precio}
                    onChange={(e) => setForm({ ...form, precio: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mínimo regateo (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej. 45.00"
                    value={form.precioMinimoVenta}
                    onChange={(e) => setForm({ ...form, precioMinimoVenta: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                  <p className="mt-1 text-[10px] font-semibold text-slate-400">Si lo dejas vacío, no tendrá rebaja autorizada.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Inicial *</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoría *</label>
                  <select
                    value={form.categoriaId}
                    onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    required
                  >
                    <option value="">Selecciona Categoría</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Proveedor</label>
                  <select
                    value={form.proveedorId}
                    onChange={(e) => setForm({ ...form, proveedorId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="">Sin proveedor asignado</option>
                    {proveedores.map((proveedor) => (
                      <option key={proveedor.id} value={proveedor.id}>{proveedor.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción</label>
                <textarea
                  rows="2"
                  placeholder="Detalles del componente o accesorio..."
                  maxLength={255}
                    value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            {/* Columna Derecha: Cargar Imagen (Archivo o URL) + Vista Previa */}
            <div className="space-y-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-900">Imagen del Producto</label>

              {/* Opción 1: Subir Archivo Local */}
              <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 rounded-xl bg-white cursor-pointer hover:border-amber-500 hover:bg-amber-50/40 transition-all">
                <Upload className="h-5 w-5 text-amber-500 mb-1" />
                <span className="text-[11px] font-extrabold text-slate-800">Seleccionar Imagen</span>
                <span className="text-[10px] text-slate-400">JPG, PNG o WebP (Máx. 5MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSeleccionarArchivo}
                  className="hidden"
                />
              </label>

              {/* Opción 2: Pegar URL Directa */}
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase text-center my-1">O escribe un enlace URL</span>
                <input
                  type="url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={form.imagenUrl}
                  onChange={(e) => setForm({ ...form, imagenUrl: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-amber-500"
                />
              </div>

              {/* Vista Previa de la Imagen */}
              {form.imagenUrl && (
                <div className="mt-2 text-center">
                  <span className="text-[10px] font-bold text-emerald-600 block mb-1">✓ Vista previa</span>
                  <div className="h-28 w-full rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
                    <ImageFallback src={form.imagenUrl} alt="Vista previa" className="h-full w-full object-cover" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setMostrarFormulario(false)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-extrabold text-slate-950 shadow-md hover:bg-amber-400 active:scale-95 transition-all"
            >
              {modoEdicion ? 'Guardar Cambios en Supabase' : 'Crear Producto en Supabase'}
            </button>
          </div>
        </form>
      )}

      {mensaje && (
        <Alert type={mensaje.type} className="mb-4 font-bold shadow-sm">
          {mensaje.text}
        </Alert>
      )}

      {/* Buscador */}
      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar producto por nombre o marca..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder-slate-400 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
        />
      </div>

      {cargando ? (
        <LoadingState text="Cargando productos..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <InventarioProductos
          productos={productosFiltrados}
          editandoStock={editandoStock}
          nuevoStock={nuevoStock}
          onNuevoStock={setNuevoStock}
          onEditarStock={(producto) => {
            setEditandoStock(producto.id)
            setNuevoStock(producto.stock)
          }}
          onGuardarStock={handleActualizarStock}
          onEditar={handleEditarProducto}
          onEliminar={handleEliminar}
        />
      )}
    </LayoutAdmin>
  )
}

export default AdminProductos
