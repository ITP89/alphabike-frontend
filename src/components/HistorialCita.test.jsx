import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, expect, it, vi } from 'vitest'
import HistorialCita from './HistorialCita'
import api from '../api/axios'

vi.mock('../api/axios', () => ({ default: { get: vi.fn() } }))
beforeEach(() => vi.clearAllMocks())
function show() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return render(<QueryClientProvider client={client}><HistorialCita citaId="cita-1" /></QueryClientProvider>)
}

it('muestra los eventos persistidos del historial', async () => {
  api.get.mockResolvedValue({ data: { data: [{ id: 'e1', estado: 'EN_PROCESO', ocurridoEn: '2026-11-10T15:00:00Z' }] } })
  show()
  expect(await screen.findByText('Estado registrado: En proceso')).toBeInTheDocument()
  expect(api.get).toHaveBeenCalledWith('/citas/cita-1/historial', expect.objectContaining({ params: { pagina: 0 } }))
})

it('permite reintentar cuando el historial no esta disponible', async () => {
  api.get.mockRejectedValueOnce({ response: { status: 503, data: { message: 'No se pudo cargar el historial' } } })
    .mockResolvedValue({ data: { data: [] } })
  show()
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar el historial')
  fireEvent.click(screen.getByRole('button', { name: 'Actualizar historial' }))
  expect(await screen.findByText(/Sin eventos en esta pagina/)).toBeInTheDocument()
})
