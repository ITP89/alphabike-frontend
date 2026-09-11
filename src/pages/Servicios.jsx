import { ArrowRight, CalendarCheck, Clock3, ShieldCheck, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { EmptyState, ErrorState } from '../components/ui/AsyncState'
import { CardSkeleton } from '../components/ui/Skeleton'
import { useApiGet } from '../hooks/useApiGet'
import { formatMoney } from '../utils/formatters'

function Servicios() {
  const {
    data: servicios,
    loading,
    error,
    refetch,
  } = useApiGet('/servicios', [], 'No se pudieron cargar los servicios')

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-950 selection:bg-red-600 selection:text-white">
      <Navbar />

      {/* Header Banner */}
      <section className="brand-grid border-b border-zinc-800 bg-zinc-950 px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-bold text-red-300 backdrop-blur-md">
            <Wrench className="h-3.5 w-3.5" />
            <span>TALLER DE MANTENIMIENTO ESPECIALIZADO</span>
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
            Servicios Mecánicos Pro
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Puesta a punto, calibración de frenos, suspensión y transmisiones ejecutados por técnicos certificados.
          </p>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="mx-auto max-w-7xl border-b border-zinc-200 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="brand-card glass-card p-5">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 text-sm font-black text-white">
              1
            </div>
            <h3 className="text-sm font-bold text-zinc-900">Reserva en Línea</h3>
            <p className="mt-1 text-xs text-zinc-500">Selecciona el servicio, fecha y horario de preferencia.</p>
          </div>
          <div className="brand-card glass-card p-5">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 text-sm font-black text-white">
              2
            </div>
            <h3 className="text-sm font-bold text-zinc-900">Diagnóstico y Mantenimiento</h3>
            <p className="mt-1 text-xs text-zinc-500">Nuestros mecánicos revisan y afinan cada componente.</p>
          </div>
          <div className="brand-card glass-card p-5">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 text-sm font-black text-white">
              3
            </div>
            <h3 className="text-sm font-bold text-zinc-900">Entrega con Garantía</h3>
            <p className="mt-1 text-xs text-zinc-500">Bicicleta lista para rodar con reporte de trabajo.</p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {loading && <CardSkeleton count={3} />}
        {error && <ErrorState message={error} onRetry={refetch} />}

        {!loading && !error && servicios.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {servicios.map((serv) => (
              <article
                key={serv.id}
                className="group brand-card glass-card glass-card-hover flex flex-col p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-950 text-red-300 shadow-md transition-colors group-hover:bg-red-600 group-hover:text-white">
                    <Wrench className="h-6 w-6" />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-3 py-1 text-[11px] font-bold text-zinc-600">
                    <Clock3 className="h-3 w-3 text-red-500" />
                    {serv.duracionMin || 45} min aprox.
                  </span>
                </div>

                <h2 className="text-lg font-black text-zinc-950 transition-colors group-hover:text-red-600">
                  {serv.nombre}
                </h2>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-zinc-600">
                  {serv.descripcion || 'Diagnóstico integral, lubricación, ajuste de cambios y control de torques.'}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Precio base desde</span>
                    <p className="text-xl font-black text-zinc-950">{formatMoney(serv.precioBase)}</p>
                  </div>
                </div>

                <Link
                  to="/agendar-cita"
                  state={{ servicioId: serv.id }}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-3 text-xs font-extrabold text-white shadow-sm transition-all duration-200 hover:bg-red-600 hover:text-white active:scale-95"
                >
                  <span>Agendar Cita</span>
                  <CalendarCheck className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && servicios.length === 0 && (
          <EmptyState title="No hay servicios registrados" description="Cuando se registren servicios en taller, aparecerán aquí." />
        )}
      </main>

      <section className="brand-grid bg-zinc-950 py-10 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-red-400 shrink-0" />
            <p className="text-xs text-zinc-300">
              Todos los trabajos incluyen garantía por 30 días en mano de obra.
            </p>
          </div>
          <Link
            to="/agendar-cita"
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md transition-all hover:bg-red-500"
          >
            Agendar Directamente
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Servicios


