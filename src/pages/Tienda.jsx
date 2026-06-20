import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'

function Tienda() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargarProductos() {
      try {
        const response = await api.get('/productos')
        setProductos(response.data.data)
      } catch (err) {
        setError('No se pudieron cargar los productos')
      } finally {
        setCargando(false)
      }
    }

    cargarProductos()
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="px-6 py-4 border-b border-gray-200 flex gap-3 items-center max-w-6xl mx-auto">
        <input
          type="text"
          placeholder="Buscar productos..."
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
          <option>Relevancia</option>
          <option>Precio: menor a mayor</option>
          <option>Precio: mayor a menor</option>
        </select>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">

        {/* Filtros */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Filtros</h3>

          <div className="mb-4">
            <p className="text-gray-900 text-sm font-medium mb-2">Categoria</p>
            <div className="flex flex-col gap-1 text-sm text-gray-600">
              <label><input type="checkbox" className="mr-2" />Frenos</label>
              <label><input type="checkbox" className="mr-2" />Llantas</label>
              <label><input type="checkbox" className="mr-2" />Cadenas</label>
              <label><input type="checkbox" className="mr-2" />Lubricantes</label>
              <label><input type="checkbox" className="mr-2" />Accesorios</label>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-900 text-sm font-medium mb-2">Precio</p>
            <div className="flex gap-2">
              <input type="text" placeholder="Min" className="w-1/2 border border-gray-300 rounded-md px-2 py-1 text-sm" />
              <input type="text" placeholder="Max" className="w-1/2 border border-gray-300 rounded-md px-2 py-1 text-sm" />
            </div>
          </div>

          <button className="w-full bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700">
            Aplicar filtros
          </button>
        </div>

        {/* Grid de productos */}
        <div>
          {cargando && <p className="text-gray-500 text-sm">Cargando productos...</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {!cargando && !error && (
            <>
              <p className="text-gray-500 text-sm mb-4">
                Mostrando {productos.length} producto{productos.length !== 1 && 's'}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {productos.map((producto) => (
                  <Link
                    key={producto.id}
                    to={`/producto/${producto.id}`}
                    className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition"
                  >
                    <div className="bg-gray-100 h-28 rounded-md mb-2 flex items-center justify-center text-gray-400">
                      📷
                    </div>
                    <p className="text-gray-900 text-sm font-medium">{producto.nombre}</p>
                    <p className="text-gray-500 text-xs">{producto.categoriaNombre} / {producto.marca}</p>
                    <p className="text-gray-900 font-semibold text-sm my-1">S/ {producto.precio.toFixed(2)}</p>
                    <button className="w-full bg-blue-600 text-white text-xs py-1.5 rounded-md hover:bg-blue-700">
                      Agregar al carrito
                    </button>
                  </Link>
                ))}
              </div>
              {productos.length === 0 && (
                <p className="text-gray-500 text-sm">No hay productos disponibles todavia.</p>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  )
}

export default Tienda