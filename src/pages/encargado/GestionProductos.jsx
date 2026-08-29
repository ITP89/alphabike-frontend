import { useState, useEffect } from 'react'
import api from '../../api/axios'
import LayoutEncargado from '../../components/LayoutEncargado'
import Alert from '../../components/ui/Alert'
import { ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { getApiErrorMessage } from '../../utils/apiError'
import { formatMoney } from '../../utils/formatters'

function GestionProductos() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [editandoStock, setEditandoStock] = useState(null)
  const [nuevoStock, setNuevoStock] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [categorias, setCategorias] = useState([])
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState(null)

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    marca: '',
    precio: '',
    stock: '',
    categoriaId: '',
  })

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/productos/todos'),
          api.get('/categorias'),
        ])
        setProductos(prodRes.data.data || [])
        setCategorias(catRes.data.data || [])
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

  async function handleActualizarStock(id) {
    if (Number(nuevoStock) < 0) {
      setMensaje({ type: 'error', text: 'El stock no puede ser negativo' })
      return
    }

    try {
      const response = await api.patch(`/productos/${id}/stock?stock=${nuevoStock}`)
      setProductos((prev) => prev.map((p) => p.id === id ? response.data.data : p))
      setEditandoStock(null)
      setNuevoStock('')
      setMensaje({ type: 'success', text: 'Stock actualizado correctamente' })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo actualizar el stock') })
    }
  }

  async function handleCrearProducto(e) {
    e.preventDefault()
    setMensaje(null)

    if (Number(form.precio) <= 0 || Number(form.stock) < 0) {
      setMensaje({ type: 'error', text: 'Revisa precio y stock antes de crear el producto' })
      return
    }

    try {
      const response = await api.post('/productos', {
        ...form,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock),
      })
      setProductos((prev) => [...prev, response.data.data])
      setMostrarFormulario(false)
      setForm({ nombre: '', descripcion: '', marca: '', precio: '', stock: '', categoriaId: '' })
      setMensaje({ type: 'success', text: 'Producto creado correctamente' })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo crear el producto') })
    }
  }

  return (
    <LayoutEncargado>
      <div className="flex justify-between items-baseline mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Gestion de productos</h1>
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {mostrarFormulario ? 'Cancelar' : '+ Nuevo producto'}
        </button>
      </div>

      {mostrarFormulario && (
        <form onSubmit={handleCrearProducto} className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Nuevo producto</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            />
            <input
              type="text"
              placeholder="Marca"
              value={form.marca}
              onChange={(e) => setForm({ ...form, marca: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            />
            <input
              type="number"
              placeholder="Precio S/"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            />
            <input
              type="number"
              placeholder="Stock"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            />
            <select
              value={form.categoriaId}
              onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
              required
            >
              <option value="">Selecciona categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Descripcion (opcional)"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="mt-3 bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Crear producto
          </button>
        </form>
      )}

      {mensaje && <Alert type={mensaje.type} className="mb-4">{mensaje.text}</Alert>}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar producto o marca..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
        />
      </div>

      {cargando ? (
        <LoadingState text="Cargando productos..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-6 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500">
            <span className="col-span-2">Producto</span>
            <span>Categoria</span>
            <span>Precio</span>
            <span>Stock</span>
            <span>Estado</span>
          </div>

          {productosFiltrados.map((producto) => (
            <div key={producto.id} className="grid grid-cols-6 px-4 py-3 border-t border-gray-200 text-sm items-center">
              <div className="col-span-2">
                <p className="text-gray-900">{producto.nombre}</p>
                <p className="text-gray-500 text-xs">{producto.marca}</p>
              </div>
              <span>{producto.categoriaNombre}</span>
              <span>{formatMoney(producto.precio)}</span>
              <div>
                {editandoStock === producto.id ? (
                  <div className="flex gap-1 items-center">
                    <input
                      type="number"
                      value={nuevoStock}
                      onChange={(e) => setNuevoStock(e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 text-xs w-16"
                    />
                    <button
                      onClick={() => handleActualizarStock(producto.id)}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded-md"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditandoStock(producto.id); setNuevoStock(producto.stock) }}
                    className={`text-xs px-2 py-1 rounded-md ${producto.stock < 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {producto.stock} uds
                  </button>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded-md inline-block w-fit ${
                producto.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {producto.estado}
              </span>
            </div>
          ))}
        </div>
      )}
    </LayoutEncargado>
  )
}

export default GestionProductos
