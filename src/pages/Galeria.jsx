import { useMemo, useState } from 'react'
import { Camera, Search, Sparkles, X, ChevronRight, Wrench, Calendar, Tag } from 'lucide-react'
import Navbar from '../components/Navbar'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/AsyncState'
import ImageFallback from '../components/ui/ImageFallback'
import { useApiGet } from '../hooks/useApiGet'
import { classNames, formatDate } from '../utils/formatters'
import { Link } from 'react-router-dom'

function obtenerCategoria(trabajo) {
  return trabajo.categoriaNombre || trabajo.servicioNombre || trabajo.titulo?.split(' ')[0] || 'Restauración'
}

function Galeria() {
  const { data: trabajos, loading, error, refetch } = useApiGet('/trabajos', [], 'No se pudieron cargar los trabajos realizados')
  const [filtro, setFiltro] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [trabajoSeleccionado, setTrabajoSeleccionado] = useState(null)

  const categorias = useMemo(() => {
    const nombres = trabajos.map(obtenerCategoria).filter(Boolean)
    return [...new Set(nombres)]
  }, [trabajos])

  const trabajosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    return trabajos.filter((trabajo) => {
      const categoria = obtenerCategoria(trabajo)
      const coincideFiltro = filtro === 'todos' || categoria === filtro
      const texto = `${trabajo.titulo || ''} ${trabajo.descripcion || ''} ${categoria}`.toLowerCase()
      const coincideBusqueda = !termino || texto.includes(termino)
      return coincideFiltro && coincideBusqueda
    })
  }, [busqueda, filtro, trabajos])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Navbar />

      {/* Signature Hero Header (Dark Navy AlphaBike Theme) */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-slate-950 px-6 py-14 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-6xl relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-400 backdrop-blur-md mb-3">
            <Camera className="h-4 w-4 text-amber-400" />
            <span>SHOWCASE DE RESULTADOS REALIZADOS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Galería <span className="text-amber-500">Antes & Después</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Explora las transformaciones, restauraciones y mantenimientos ejecutados por nuestros mecánicos certificados en el taller AlphaBike.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Buscador y Filtros por Categoría */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar trabajo por título o descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder-slate-400 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFiltro('todos')}
              className={classNames(
                'rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-sm',
                filtro === 'todos'
                  ? 'bg-amber-500 text-slate-950 shadow-amber-500/20 font-black'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100',
              )}
            >
              Todos ({trabajos.length})
            </button>
            {categorias.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFiltro(cat)}
                className={classNames(
                  'rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-sm',
                  filtro === cat
                    ? 'bg-amber-500 text-slate-950 shadow-amber-500/20 font-black'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100',
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading && <LoadingState text="Cargando galería de trabajos..." />}
        {error && <ErrorState message={error} onRetry={refetch} />}

        {/* Grid de Trabajos en Tarjetas Blancas Elegantes */}
        {!loading && !error && trabajosFiltrados.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trabajosFiltrados.map((trabajo) => (
              <article
                key={trabajo.id}
                onClick={() => setTrabajoSeleccionado(trabajo)}
                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                {/* Comparación Visual Antes / Después */}
                <div className="relative grid aspect-[16/9] grid-cols-2 overflow-hidden bg-slate-100">
                  <div className="relative border-r border-slate-200 overflow-hidden">
                    <ImageFallback
                      src={trabajo.imagenAntesUrl}
                      alt={`${trabajo.titulo} antes`}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute left-2.5 top-2.5 rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-sm">
                      Antes
                    </span>
                  </div>
                  <div className="relative overflow-hidden">
                    <ImageFallback
                      src={trabajo.imagenDespuesUrl}
                      alt={`${trabajo.titulo} después`}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute left-2.5 top-2.5 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-black uppercase text-slate-950 shadow-sm">
                      Después
                    </span>
                  </div>
                </div>

                {/* Info Body */}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-amber-700 tracking-wider">
                      <Tag className="h-3 w-3 text-amber-600" /> {obtenerCategoria(trabajo)}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {formatDate(trabajo.fecha)}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                    {trabajo.titulo}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600 font-medium">
                    {trabajo.descripcion || 'Trabajo realizado con precisión técnica en el taller AlphaBike.'}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                    <span>Ver Detalles Completos</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && trabajosFiltrados.length === 0 && (
          <EmptyState title="No hay trabajos para mostrar" description="Prueba cambiando el filtro o la búsqueda." />
        )}
      </main>

      {/* Modal Interactivo en Alta Definición */}
      {trabajoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl overflow-hidden">
            <button
              onClick={() => setTrabajoSeleccionado(null)}
              className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-all z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-md bg-amber-100 text-amber-800 px-3 py-1 text-xs font-bold uppercase">
                {obtenerCategoria(trabajoSeleccionado)}
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                {formatDate(trabajoSeleccionado.fecha)}
              </span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-4">{trabajoSeleccionado.titulo}</h2>

            {/* Comparación Lado a Lado HD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-64 sm:h-72 shadow-inner">
                <ImageFallback
                  src={trabajoSeleccionado.imagenAntesUrl}
                  alt="Antes"
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-3 top-3 rounded-lg bg-slate-900/90 px-3 py-1 text-xs font-bold uppercase text-white shadow-md">
                  Estado Anterior
                </span>
              </div>
              <div className="relative rounded-2xl overflow-hidden border border-amber-300 bg-slate-100 h-64 sm:h-72 shadow-inner">
                <ImageFallback
                  src={trabajoSeleccionado.imagenDespuesUrl}
                  alt="Después"
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-3 top-3 rounded-lg bg-amber-500 px-3 py-1 text-xs font-black uppercase text-slate-950 shadow-md">
                  Resultado Final
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {trabajoSeleccionado.descripcion}
            </p>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <Wrench className="h-4 w-4 text-amber-600" />
                <span>Ejecutado por Mecánicos Especializados AlphaBike</span>
              </div>
              <Link
                to="/servicios"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 transition-all shadow-md active:scale-95"
              >
                <Sparkles className="h-4 w-4" /> Agendar Servicio Similar
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Galeria
