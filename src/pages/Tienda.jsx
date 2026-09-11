import { useMemo, useState } from 'react'
import { Filter, Package, Search, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import Navbar from '../components/Navbar'
import { EmptyState, ErrorState } from '../components/ui/AsyncState'
import { CardSkeleton } from '../components/ui/Skeleton'
import ImageFallback from '../components/ui/ImageFallback'
import { useCarrito } from '../context/CarritoContext'
import { useApiGet } from '../hooks/useApiGet'
import { classNames, formatMoney } from '../utils/formatters'

function Tienda() {
  const { agregarProducto } = useCarrito()
  const {
    data: productos,
    loading: cargandoProductos,
    error: errorProductos,
    refetch: recargarProductos,
  } = useApiGet('/productos', [], 'No se pudieron cargar los productos')
  const {
    data: categorias,
    loading: cargandoCategorias,
    error: errorCategorias,
    refetch: recargarCategorias,
  } = useApiGet('/categorias', [], 'No se pudieron cargar las categorías')

  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [orden, setOrden] = useState('relevancia')

  const cargando = cargandoProductos || cargandoCategorias
  const error = errorProductos || errorCategorias

  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()
    const filtrados = productos.filter((producto) => {
      const coincideBusqueda = !termino ||
        producto.nombre?.toLowerCase().includes(termino) ||
        producto.marca?.toLowerCase().includes(termino) ||
        producto.descripcion?.toLowerCase().includes(termino) ||
        producto.categoriaNombre?.toLowerCase().includes(termino)
      const coincideCategoria = !categoriaId || String(producto.categoriaId) === String(categoriaId)
      return coincideBusqueda && coincideCategoria
    })

    return [...filtrados].sort((a, b) => {
      if (orden === 'precio-asc') return Number(a.precio) - Number(b.precio)
      if (orden === 'precio-desc') return Number(b.precio) - Number(a.precio)
      if (orden === 'nombre') return (a.nombre || '').localeCompare(b.nombre || '')
      if (orden === 'stock') return Number(b.stock || 0) - Number(a.stock || 0)
      return 0
    })
  }, [busqueda, categoriaId, orden, productos])

  function handleAgregar(producto) {
    agregarProducto(producto)
    toast.success(`¡${producto.nombre} añadido al carrito!`)
  }

  function limpiarFiltros() {
    setBusqueda('')
    setCategoriaId('')
    setOrden('relevancia')
  }

  function recargarTodo() {
    recargarProductos()
    recargarCategorias()
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-950 selection:bg-red-600 selection:text-white">
      <Navbar />

      {/* Header Banner */}
      <section className="brand-grid border-b border-zinc-800 bg-zinc-950 px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-bold text-red-300 backdrop-blur-md">
            <Package className="h-3.5 w-3.5" />
            <span>TIENDA PRO Y REPUESTOS ORIGINALES</span>
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
            Catálogo de Componentes & Accesorios
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Encuentra repuestos de las mejores marcas con garantía y disponibilidad inmediata en nuestro almacén.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Category Pills Header */}
        {categorias.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2 pb-2">
            <button
              type="button"
              onClick={() => setCategoriaId('')}
              className={classNames(
                'rounded-lg px-4 py-1.5 text-xs font-extrabold transition-all duration-200',
                !categoriaId
                  ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                  : 'border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100',
              )}
            >
              Todas ({productos.length})
            </button>
            {categorias.map((cat) => {
              const active = String(categoriaId) === String(cat.id)
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoriaId(cat.id)}
                  className={classNames(
                    'rounded-lg px-4 py-1.5 text-xs font-extrabold transition-all duration-200',
                    active
                      ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                      : 'border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100',
                  )}
                >
                  {cat.nombre}
                </button>
              )
            })}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar Controls */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-5">
            <div className="brand-card glass-card space-y-4 p-5">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-900">
                  <Filter className="h-4 w-4 text-red-500" />
                  Búsqueda & Filtros
                </span>
                {(busqueda || categoriaId || orden !== 'relevancia') && (
                  <button
                    type="button"
                    onClick={limpiarFiltros}
                    className="text-[11px] font-bold text-red-600 hover:underline"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {/* Search Box */}
              <div>
                <label className="mb-1 block text-xs font-bold text-zinc-700">Buscar por nombre o marca</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="search"
                    placeholder="Ej. Cadena Shimano..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-9 pr-3 text-xs font-semibold text-zinc-900 placeholder-zinc-400 transition-all focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="mb-1 block text-xs font-bold text-zinc-700">Categoría</label>
                <select
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs font-semibold text-zinc-900 transition-all focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20"
                >
                  <option value="">Todas las Categorías</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div>
                <label className="mb-1 block text-xs font-bold text-zinc-700">Ordenar por</label>
                <select
                  value={orden}
                  onChange={(e) => setOrden(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs font-semibold text-zinc-900 transition-all focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20"
                >
                  <option value="relevancia">Destacados primero</option>
                  <option value="precio-asc">Precio: Menor a Mayor</option>
                  <option value="precio-desc">Precio: Mayor a Menor</option>
                  <option value="nombre">Nombre (A-Z)</option>
                  <option value="stock">Mayor Stock Disponible</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <section>
            {cargando && <CardSkeleton count={6} />}
            {error && <ErrorState message={error} onRetry={recargarTodo} />}

            {!cargando && !error && (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    {productosFiltrados.length} Producto{productosFiltrados.length !== 1 && 's'} disponible{productosFiltrados.length !== 1 && 's'}
                  </span>
                </div>

                {productosFiltrados.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {productosFiltrados.map((prod) => {
                      const sinStock = Number(prod.stock || 0) < 1

                      return (
                        <article
                          key={prod.id}
                          className="group brand-card glass-card glass-card-hover flex flex-col p-4"
                        >
                          <Link to={`/producto/${prod.id}`} className="block relative">
                            <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-zinc-100">
                              <ImageFallback
                                src={prod.imagenUrl}
                                alt={prod.nombre}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <span className="absolute left-2.5 top-2.5 rounded-md bg-zinc-950/85 px-2.5 py-0.5 text-[10px] font-bold uppercase text-red-300 backdrop-blur-md">
                                {prod.marca || 'AlphaBike'}
                              </span>
                            </div>
                            <h2 className="line-clamp-2 text-sm font-extrabold text-zinc-900 transition-colors group-hover:text-red-600">
                              {prod.nombre}
                            </h2>
                            <p className="mt-1 text-xs text-zinc-500">
                              {prod.categoriaNombre || 'Accesorios'}
                            </p>
                            <p className="mt-2 text-lg font-black text-zinc-950">
                              {formatMoney(prod.precio)}
                            </p>
                          </Link>

                          <div className="mt-auto flex items-center justify-between gap-2 border-t border-zinc-100 pt-4">
                            <span className={classNames('text-xs font-bold', sinStock ? 'text-red-500' : 'text-emerald-600')}>
                              {sinStock ? 'Sin stock' : `${prod.stock} disponibles`}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAgregar(prod)}
                              disabled={sinStock}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-2 text-xs font-extrabold text-white shadow-sm transition-all duration-200 hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
                            >
                              <ShoppingCart className="h-3.5 w-3.5" />
                              Añadir
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                ) : (
                  <EmptyState
                    title="No se encontraron productos"
                    description="Prueba seleccionando otra categoría o cambiando la búsqueda."
                  />
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default Tienda


