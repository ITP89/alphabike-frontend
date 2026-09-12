import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, CalendarCheck, CheckCircle2, Clock, PackageSearch, ShieldCheck, Sparkles, Star, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/AsyncState'
import ImageFallback from '../components/ui/ImageFallback'
import alphaLogo from '../assets/alphabike-logo.png'
import heroImage from '../assets/hero-workshop.png'
import { formatDate, formatMoney } from '../utils/formatters'
import { getApiErrorMessage } from '../utils/apiError'

const beneficios = [
  {
    title: 'Tienda de Repuestos Pro',
    description: 'Catálogo completo con componentes originales, repuestos y accesorios de alto rendimiento.',
    to: '/tienda',
    icon: PackageSearch,
    color: 'from-red-500 to-red-600',
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
    color: 'from-red-600 to-red-700',
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
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-950 selection:bg-red-600 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[660px] overflow-hidden bg-zinc-100 text-zinc-950">
        <img
          src={heroImage}
          alt="Taller AlphaBike profesional"
          className="absolute inset-y-0 right-0 hidden h-full w-[62%] object-cover opacity-75 saturate-75 transition-transform duration-1000 hover:scale-105 lg:block"
        />
        <div className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(110deg,#09090b_0%,#111113_48%,rgba(17,17,19,0.88)_58%,rgba(17,17,19,0.12)_100%)] lg:w-[72%]" />
        <div className="absolute inset-y-0 right-0 hidden w-[30%] bg-[linear-gradient(90deg,rgba(220,38,38,0),rgba(220,38,38,0.86))] lg:block" />
        <div className="brand-grid absolute inset-0 opacity-70" />
        <div className="chain-ring absolute -right-20 top-20 hidden h-80 w-80 opacity-90 lg:block" />
        <div className="absolute -left-20 bottom-[-120px] h-80 w-80 rounded-full bg-red-600/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-600/15 px-4 py-2 text-xs font-black uppercase text-red-200 shadow-sm backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-red-300" />
              <span>TALLER Y TIENDA ESPECIALIZADA EN CICLISMO</span>
            </div>

            {/* Hero Heading */}
            <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight text-white sm:text-7xl lg:leading-[0.92]">
              Taller experto para una bici que <span className="text-red-500">se siente nueva</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base font-semibold text-zinc-200 sm:text-lg sm:leading-relaxed">
              Servicio mecánico especializado, repuestos originales y una atención rápida para que vuelvas a la ruta con confianza.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/tienda"
                className="group inline-flex items-center gap-2.5 rounded-lg bg-red-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-red-600/25 transition-all duration-200 hover:bg-red-500 hover:shadow-red-500/40 active:scale-95"
              >
                Explorar Tienda
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/mantenimiento"
                className="group inline-flex items-center gap-2.5 rounded-lg border border-white/15 bg-white/10 px-6 py-3.5 text-sm font-bold text-white shadow-md backdrop-blur-md transition-all duration-200 hover:bg-white/15 active:scale-95"
              >
                Agendar Cita en Taller
                <CalendarCheck className="h-4 w-4 text-red-300 transition-transform group-hover:scale-110" />
              </Link>
            </div>

            {/* Feature Badges */}
            <div className="mt-10 grid grid-cols-1 gap-3 border-t border-white/10 pt-6 sm:grid-cols-3">
              <div className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-3 shadow-sm backdrop-blur-md">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-red-300" />
                <span className="text-xs font-bold text-zinc-100">Técnicos Certificados</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-3 shadow-sm backdrop-blur-md">
                <ShieldCheck className="h-5 w-5 shrink-0 text-red-300" />
                <span className="text-xs font-bold text-zinc-100">Garantía en Servicio</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-3 shadow-sm backdrop-blur-md">
                <Clock className="h-5 w-5 shrink-0 text-red-300" />
                <span className="text-xs font-bold text-zinc-100">Entregas a Tiempo</span>
              </div>
            </div>
          </div>

          <div className="hidden justify-end lg:flex">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-6 bg-red-600/25 blur-3xl" />
              <div className="relative rounded-xl border border-white/15 bg-zinc-950/80 p-7 shadow-2xl shadow-black/45 backdrop-blur-xl">
                <div className="rounded-lg bg-white p-6 shadow-inner shadow-zinc-950/10">
                  <img src={alphaLogo} alt="Logo AlphaBike Workshop" className="mx-auto max-h-52 w-full object-contain" />
                </div>
                <div className="mt-7 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
                  <div>
                    <p className="text-2xl font-black text-white">30</p>
                    <p className="mt-1 text-[10px] font-bold uppercase text-zinc-400">Días garantía</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">24h</p>
                    <p className="mt-1 text-[10px] font-bold uppercase text-zinc-400">Respuesta</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-red-400">Pro</p>
                    <p className="mt-1 text-[10px] font-bold uppercase text-zinc-400">Setup taller</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-8 -left-10 rounded-lg border border-red-500/30 bg-white px-5 py-4 shadow-xl shadow-black/20">
                <p className="text-xs font-black uppercase text-red-600">Diagnóstico rápido</p>
                <p className="mt-1 text-sm font-bold text-zinc-900">Agenda y recibe atención personalizada</p>
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
                className="group brand-card border border-zinc-800 bg-zinc-950 p-6 text-white shadow-xl shadow-zinc-950/15 transition-all duration-300 hover:-translate-y-1 hover:border-red-500/60"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${item.color} text-white shadow-md transition-transform group-hover:scale-105`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-md bg-white/10 px-3 py-1 text-[11px] font-bold uppercase text-zinc-300">
                    {item.badge}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-extrabold text-white transition-colors group-hover:text-red-300">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  {item.description}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-red-300 transition-all group-hover:gap-2.5">
                  <span>Saber más</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-zinc-100 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-3 border-b border-zinc-300 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-600">Catálogo Pro</span>
            </div>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
              Productos Destacados
            </h2>
          </div>
          <Link
            to="/tienda"
            className="group inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-red-600"
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
                className="group brand-card flex flex-col border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-500/50 hover:shadow-xl hover:shadow-zinc-950/10"
              >
                <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-zinc-100">
                  <ImageFallback
                    src={prod.imagenUrl}
                    alt={prod.nombre}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-2.5 left-2.5 rounded-md bg-zinc-950/85 px-2.5 py-0.5 text-[10px] font-bold uppercase text-red-300 backdrop-blur-md">
                    {prod.marca || 'AlphaBike'}
                  </span>
                </div>
                <h3 className="line-clamp-2 text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  {prod.nombre}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {prod.categoriaNombre || 'Repuesto Original'}
                </p>
                <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-100">
                  <span className="text-base font-black text-slate-950">
                    {formatMoney(prod.precio)}
                  </span>
                  <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 transition-colors group-hover:bg-red-600 group-hover:text-white">
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
        </div>
      </section>

      {/* Workshop Gallery / Trabajos Realizados */}
      <section className="brand-grid border-y border-zinc-900 bg-[linear-gradient(135deg,#18181b_0%,#2b0d0d_62%,#111113_100%)] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-red-400 text-red-400" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-red-300">Resultados del Taller</span>
              </div>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Trabajos Destacados (Antes / Después)
              </h2>
            </div>
            <Link
              to="/galeria"
              className="group inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-red-600"
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
                  className="group overflow-hidden rounded-lg border border-white/10 bg-white shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-red-500/60"
                >
                  <div className="relative grid aspect-[16/9] grid-cols-2 gap-0.5 overflow-hidden bg-zinc-100">
                    <div className="relative">
                      <ImageFallback src={trabajo.imagenAntesUrl} alt={`${trabajo.titulo} antes`} className="h-full w-full object-cover" />
                      <span className="absolute bottom-2 left-2 rounded bg-zinc-950/80 px-2 py-0.5 text-[10px] font-bold text-red-300">
                        ANTES
                      </span>
                    </div>
                    <div className="relative">
                      <ImageFallback src={trabajo.imagenDespuesUrl} alt={`${trabajo.titulo} después`} className="h-full w-full object-cover" />
                      <span className="absolute bottom-2 right-2 rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        DESPUÉS
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-zinc-950 transition-colors group-hover:text-red-600">
                      {trabajo.titulo}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500">
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
            <img src={alphaLogo} alt="AlphaBike Workshop" className="h-10 w-10 rounded-lg border border-zinc-200 bg-white object-contain p-1" />
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


