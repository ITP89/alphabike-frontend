import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import { getApiErrorMessage } from '../utils/apiError'

const ESTADOS = {
  PENDIENTE: 'Pendiente', EN_PROCESO: 'En proceso',
  COMPLETADO: 'Completado', CANCELADO: 'Cancelado',
}

export default function HistorialCita({ citaId }) {
  const [pagina, setPagina] = useState(0)
  const { data = [], isPending, error, refetch, isFetching } = useQuery({
    queryKey: ['citas', citaId, 'historial', pagina],
    queryFn: async ({ signal }) => {
      const response = await api.get(`/citas/${citaId}/historial`, { params: { pagina }, signal })
      return response.data.data
    },
    // History is eventually consistent; WS may arrive before Mongo acknowledges.
    refetchInterval: 5000,
    retry: false,
  })

  return (
    <section className="mt-6 min-w-0 rounded-md border border-gray-200 bg-white p-4 shadow-sm" aria-label="Historial de la cita">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-gray-950">Historial de la cita</h2>
        <button type="button" onClick={() => refetch()} disabled={isFetching}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:opacity-50">
          Actualizar historial
        </button>
      </div>
      {isPending && <p className="mt-3 text-sm text-gray-500" role="status">Cargando historial...</p>}
      {error && <p className="mt-3 text-sm text-red-700" role="alert">{getApiErrorMessage(error, 'No se pudo cargar el historial. Intenta nuevamente.')}</p>}
      {!isPending && !error && data.length === 0 && (
        <p className="mt-3 text-sm text-gray-500">Sin eventos en esta pagina. Los cambios recientes pueden tardar unos segundos en aparecer.</p>
      )}
      {!error && data.length > 0 && <ol className="mt-4 space-y-3">
        {data.map(evento => <li key={evento.id} className="flex flex-wrap justify-between gap-2 border-l-2 border-blue-200 pl-3 text-sm">
          <span className="font-medium text-gray-800">Estado registrado: {ESTADOS[evento.estado] || evento.estado}</span>
          <time dateTime={evento.ocurridoEn} className="text-gray-500">
            {new Date(evento.ocurridoEn).toLocaleString('es-PE', { timeZone: 'America/Lima' })}
          </time>
        </li>)}
      </ol>}
      {(pagina > 0 || data.length === 50) && <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <button type="button" disabled={pagina === 0 || isFetching} onClick={() => setPagina(p => p - 1)} className="rounded border px-3 py-2 disabled:opacity-50">Mas recientes</button>
        <span>Pagina {pagina + 1}</span>
        <button type="button" disabled={data.length < 50 || isFetching || pagina >= 10000} onClick={() => setPagina(p => p + 1)} className="rounded border px-3 py-2 disabled:opacity-50">Mas antiguos</button>
      </div>}
    </section>
  )
}
