import { act, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import MisCitas from './MisCitas'
import api from '../api/axios'

vi.mock('../api/axios', () => ({ default: { get: vi.fn() } }))
vi.mock('../components/Navbar', () => ({ default: () => <nav>AlphaBike</nav> }))
vi.mock('../components/AccountNav', () => ({ default: () => <nav>Mi cuenta</nav> }))

beforeEach(() => vi.clearAllMocks())

it('actualiza la cita cuando llega el evento sin navegar ni recargar', async () => {
  const cita = { id: 'cita-1', servicioNombre: 'Revision en vivo', fecha: '2026-12-01', hora: '10:00', estado: 'PENDIENTE' }
  api.get.mockResolvedValueOnce({ data: { data: [cita] } })
  render(<MemoryRouter><MisCitas /></MemoryRouter>)
  expect(await screen.findByText('Pendiente')).toBeInTheDocument()
  api.get.mockResolvedValueOnce({ data: { data: [{ ...cita, estado: 'EN_PROCESO' }] } })
  act(() => window.dispatchEvent(new CustomEvent('alphabike:citas-changed', {
    detail: { type: 'CITA_UPDATED', citaId: cita.id, estado: 'EN_PROCESO' },
  })))
  expect(await screen.findByText('En proceso')).toBeInTheDocument()
  await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2))
})
