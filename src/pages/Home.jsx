import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, CalendarCheck, CheckCircle2, Clock, PackageSearch, ShieldCheck, Sparkles, Star, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/AsyncState'
import ImageFallback from '../components/ui/ImageFallback'
import heroImage from '../assets/hero-workshop.png'
import { formatDate, formatMoney } from '../utils/formatters'
import { getApiErrorMessage } from '../utils/apiError'

const beneficios = [
  {
    title: 'Tienda de Repuestos Pro',
    description: 'Catálogo completo con componentes originales, repuestos y accesorios de alto rendimiento.',
    to: '/tienda',
    icon: PackageSearch,
    color: 'from-amber-500 to-amber-600',
    badge: 'Stock en vivo'
  },
  {
    title: 'Mantenimiento Especializado',
    description: 'Agenda tu cita en taller. Diagnóstico computarizado, calibración y puesta a punto profesional.',
    to: '/mantenimiento',
    icon: Wrench,
    color: 'from-slate-800 to-slate-900',
    badge: 'Citas rápidas'
  },
  {
    title: 'Seguimiento de Servicios',
    description: 'Monitorea el avance de tu bicicleta en taller y el estado de tus envíos en tiempo real.',
    to: '/perfil',
    icon: CalendarCheck,
    color: 'from-amber-600 to-amber-700',
    badge: '100% Transparente'
  },
]

function Home() {
  const [productos, setProductos] = useState([])
  const [trabajos, setTrabajos] = useState([])
  const [cargandoProductos, setCargandoProductos] = useState(true)
  const [cargandoTrabajos, setCargandoTrabajos] = useState(true)
  const [errorProductos, setErrorProductos] = useState('')
  const [errorTrabajos, setErrorTrabajos] = useState('')

  const cargarProductos = useCallback(async () => {
    setCargandoProductos(true)
    setErrorProductos('')

    try {
      const response = await api.get('/productos')
      setProductos((response.data.data || []).slice(0, 4))
    } catch (err) {
      setProductos([])
      setErrorProductos(getApiErrorMessage(err, 'No se pudieron cargar los productos destacados'))
    } finally {
      setCargandoProductos(false)
    }
  }, [])

  const cargarTrabajos = useCallback(async () => {
    setCargandoTrabajos(true)
    setErrorTrabajos('')

    try {
      const response = await api.get('/trabajos/destacados')
      setTrabajos((response.data.data || []).slice(0, 3))
    } catch (err) {
      setTrabajos([])
      setErrorTrabajos(getApiErrorMessage(err, 'No se pudieron cargar los trabajos destacados'))
    } finally {
      setCargandoTrabajos(false)
    }
  }, [])

  useEffect(() => {
    cargarProductos()
    cargarTrabajos()
  }, [cargarProductos, cargarTrabajos])

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-amber-400 selection:text-slate-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[580px] overflow-hidden bg-slate-950 text-white">
        <img
          src={heroImage}
          alt="Taller AlphaBike profesional"
          className="absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-1000 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/20" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-50 via-slate-50/50 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/20 px-4 py-1.5 text-xs font-bold text-amber-400 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>TALLER Y TIENDA ESPECIALIZADA EN CICLISMO</span>
            </div>

            {/* Hero Heading */}
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-6xl lg:leading-tight drop-shadow-md">
              Potencia tu ruta con <span className="text-amber-500">AlphaBike</span>
            </h1>

            <p className="mt-4 text-base text-slate-200 sm:text-lg sm:leading-relaxed drop-shadow">
              Mantenimiento experto, repuestos originales y seguimiento transparente para ciclistas exigentes.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/tienda"
                className="group inline-flex items-center gap-2.5 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-500/25 transition-all duration-200 hover:bg-amber-400 hover:shadow-amber-500/40 active:scale-95"
              >
                Explorar Tienda
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/mantenimiento"
                className="group inline-flex items-center gap-2.5 rounded-xl border border-white/20 bg-slate-900/90 px-6 py-3.5 text-sm font-bold text-white shadow-md backdrop-blur-md transition-all duration-200 hover:bg-slate-800 active:scale-95"
              >
                Agendar Cita en Taller
                <CalendarCheck className="h-4 w-4 text-amber-400 transition-transform group-hover:scale-110" />
              </Link>
            </div>

            {/* Feature Badges */}
            <div className="mt-10 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-200">Técnicos Certificados</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-200">Garantía en Servicio</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-5 w-5 text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-200">Entregas a Tiempo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Showcase Cards */}
      <section className="relative z-10 mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {beneficios.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.title}
                to={item.to}
                className="group glass-card glass-card-hover rounded-2xl p-6 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white shadow-md transition-transform group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
                    {item.badge}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-extrabold text-slate-950 group-hover:text-amber-600 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-600 group-hover:gap-2.5 transition-all">
                  <span>Saber más</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Catálogo Pro</span>
            </div>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Productos Destacados
            </h2>
          </div>
          <Link
            to="/tienda"
            className="group inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-amber-500 hover:text-slate-950"
          >
            <span>Ver Catálogo Completo</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {cargandoProductos && <LoadingState text="Cargando catálogo destacado..." />}
        {errorProductos && <ErrorState message={errorProductos} onRetry={cargarProductos} />}

        {!cargandoProductos && !errorProductos && productos.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {productos.map((prod) => (
              <Link
                key={prod.id}
                to={`/producto/${prod.id}`}
                className="group glass-card glass-card-hover flex flex-col rounded-2xl overflow-hidden p-4"
              >
                <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-slate-100">
                  <ImageFallback
                    src={prod.imagenUrl}
                    alt={prod.nombre}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-2.5 left-2.5 rounded-full bg-slate-950/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-amber-400">
                    {prod.marca || 'AlphaBike'}
                  </span>
                </div>
                <h3 className="line-clamp-2 text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  {prod.nombre}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {prod.categoriaNombre || 'Repuesto Original'}
                </p>
                <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-100">
                  <span className="text-base font-black text-slate-950">
                    {formatMoney(prod.precio)}
                  </span>
                  <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                    Ver Detalle
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!cargandoProductos && !errorProductos && productos.length === 0 && (
          <EmptyState title="No hay productos activos" description="No se registraron productos en el catálogo." />
        )}
      </section>

      {/* Workshop Gallery / Trabajos Realizados */}
      <section className="bg-slate-900 text-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">Resultados del Taller</span>
              </div>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Trabajos Destacados (Antes / Después)
              </h2>
            </div>
            <Link
              to="/galeria"
              className="group inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 transition-all hover:bg-amber-500 hover:text-slate-950"
            >
              <span>Ver Galería Completa</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {cargandoTrabajos && <LoadingState text="Cargando galería..." />}
          {errorTrabajos && <ErrorState message={errorTrabajos} onRetry={cargarTrabajos} />}

          {!cargandoTrabajos && !errorTrabajos && trabajos.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {trabajos.map((trabajo) => (
                <Link
                  key={trabajo.id}
                  to="/galeria"
                  className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60 transition-all duration-300 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10"
                >
                  <div className="relative grid aspect-[16/9] grid-cols-2 gap-0.5 overflow-hidden bg-slate-800">
                    <div className="relative">
                      <ImageFallback src={trabajo.imagenAntesUrl} alt={`${trabajo.titulo} antes`} className="h-full w-full object-cover" />
                      <span className="absolute bottom-2 left-2 rounded bg-slate-950/80 px-2 py-0.5 text-[10px] font-bold text-red-400">
                        ANTES
                      </span>
                    </div>
                    <div className="relative">
                      <ImageFallback src={trabajo.imagenDespuesUrl} alt={`${trabajo.titulo} después`} className="h-full w-full object-cover" />
                      <span className="absolute bottom-2 right-2 rounded bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-slate-950">
                        DESPUÉS
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors">
                      {trabajo.titulo}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      Entregado el {formatDate(trabajo.fecha)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!cargandoTrabajos && !errorTrabajos && trabajos.length === 0 && (
            <EmptyState title="No hay trabajos destacados" description="Los trabajos publicados por el equipo aparecerán aquí." />
          )}
        </div>
      </section>

      {/* Footer Banner */}
      <footer className="border-t border-slate-200 bg-white py-10 text-slate-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-slate-950 text-amber-400 flex items-center justify-center font-black text-xs">
              AB
            </div>
            <span className="font-bold text-slate-900 text-sm">AlphaBike Taller & Tienda Pro</span>
          </div>
          <p className="text-xs text-slate-500 text-center md:text-right">
            © 2026 AlphaBike. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home
