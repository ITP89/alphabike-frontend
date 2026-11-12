import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vitest'
import AdminDetalleCita from './admin/AdminDetalleCita'
import DetalleCitaEncargado from './encargado/DetalleCitaEncargado'
import api from '../api/axios'
vi.mock('../api/axios', () => ({ default: { get: vi.fn(), post: vi.fn() } }))
vi.mock('../components/LayoutAdmin', () => ({ default: ({ children }) => <main>{children}</main> }))
vi.mock('../components/LayoutEncargado', () => ({ default: ({ children }) => <main>{children}</main> }))
vi.mock('../components/AsignacionCita', () => ({ default: () => null }))
vi.mock('../components/HistorialCita', () => ({ default: () => null }))
vi.mock('../hooks/useCitasRefresh', () => ({ useCitasRefresh: () => {} }))
afterEach(() => { cleanup(); vi.resetAllMocks() })
it.each([AdminDetalleCita, DetalleCitaEncargado])('permite cobrar una cita completada sin ofrecer duplicar un pago', async Component => {
  api.get.mockImplementation(async path => ({ data: { data: path.startsWith('/citas/')
    ? { id: 'c1', estado: 'COMPLETADO', servicioNombre: 'Mantenimiento', clienteNombre: 'Ana' }
    : path.startsWith('/cotizaciones/') ? { id: 'q1', monto: 50, estado: 'ACEPTADA', descripcion: 'Revisión' } : [] } }))
  api.post.mockResolvedValue({ data: { data: {} } })
  render(<MemoryRouter initialEntries={['/cita/c1']}><Routes><Route path="/cita/:id" element={<Component />} /></Routes></MemoryRouter>)
  fireEvent.click(await screen.findByRole('button', { name: 'Registrar pago pendiente' }))
  expect(await screen.findByText('Pago registrado. No hay cobros pendientes.')).toBeInTheDocument()
  expect(api.post).toHaveBeenCalledWith('/pagos', expect.objectContaining({ referenciaId: 'q1', monto: 50 }))
  expect(screen.queryByRole('button', { name: 'Registrar pago pendiente' })).not.toBeInTheDocument()
})
it('no ofrece cobrar de nuevo al volver a abrir una cita ya pagada', async () => {
  api.get.mockImplementation(async path => ({ data: { data: path.startsWith('/citas/')
    ? { id: 'c1', estado: 'COMPLETADO' } : path.startsWith('/cotizaciones/')
      ? { id: 'q1', monto: 50, estado: 'ACEPTADA' } : [{ estado: 'PAGADO' }] } }))
  render(<MemoryRouter initialEntries={['/cita/c1']}><Routes><Route path="/cita/:id" element={<AdminDetalleCita />} /></Routes></MemoryRouter>)
  expect(await screen.findByText('Pago registrado. No hay cobros pendientes.')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /Registrar pago/ })).not.toBeInTheDocument()
})
