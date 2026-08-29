import { ArrowRight, CalendarCheck, Clock3, ShieldCheck, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/AsyncState'
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-amber-400 selection:text-slate-950">
      <Navbar />

      {/* Header Banner */}
      <section className="border-b border-slate-200/80 bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-bold text-amber-400 backdrop-blur-md">
            <Wrench className="h-3.5 w-3.5" />
            <span>TALLER DE MANTENIMIENTO ESPECIALIZADO</span>
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
            Servicios Mecánicos Pro
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Puesta a punto, calibración de frenos, suspensión y transmisiones ejecutados por técnicos certificados.
          </p>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="glass-card rounded-2xl p-5">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black text-sm mb-3">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Reserva en Línea</h3>
            <p className="text-xs text-slate-500 mt-1">Selecciona el servicio, fecha y horario de preferencia.</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black text-sm mb-3">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Diagnóstico y Mantenimiento</h3>
            <p className="text-xs text-slate-500 mt-1">Nuestros mecánicos revisan y afinan cada componente.</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black text-sm mb-3">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Entrega con Garantía</h3>
            <p className="text-xs text-slate-500 mt-1">Bicicleta lista para rodar con reporte de trabajo.</p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {loading && <LoadingState text="Cargando catálogo de servicios..." />}
        {error && <ErrorState message={error} onRetry={refetch} />}

        {!loading && !error && servicios.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {servicios.map((serv) => (
              <article
                key={serv.id}
                className="group glass-card glass-card-hover flex flex-col rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-amber-400 shadow-md group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                    <Wrench className="h-6 w-6" />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
                    <Clock3 className="h-3 w-3 text-amber-500" />
                    {serv.duracionMin || 45} min aprox.
                  </span>
                </div>

                <h2 className="text-lg font-black text-slate-950 group-hover:text-amber-600 transition-colors">
                  {serv.nombre}
                </h2>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed flex-1">
                  {serv.descripcion || 'Diagnóstico integral, lubricación, ajuste de cambios y control de torques.'}
                </p>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Precio base desde</span>
                    <p className="text-xl font-black text-slate-950">{formatMoney(serv.precioBase)}</p>
                  </div>
                </div>

                <Link
                  to="/agendar-cita"
                  state={{ servicioId: serv.id }}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-extrabold text-white shadow-sm transition-all duration-200 hover:bg-amber-500 hover:text-slate-950 active:scale-95"
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

      <section className="bg-slate-900 text-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-amber-400 shrink-0" />
            <p className="text-xs text-slate-300">
              Todos los trabajos incluyen garantía por 30 días en mano de obra.
            </p>
          </div>
          <Link
            to="/agendar-cita"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-extrabold text-slate-950 shadow-md hover:bg-amber-400 transition-all"
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
