import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, it, vi } from 'vitest'
import Dashboard from './Dashboard'
import api from '../../api/axios'
vi.mock('../../api/axios', () => ({ default: { get: vi.fn() } }))
vi.mock('../../components/LayoutAdmin', () => ({ default: ({ children }) => <main>{children}</main> }))
it('reconcilia pagos de Mercado Pago, efectivo y otros sin sumar pendientes', async () => {
  api.get.mockImplementation(async path => ({ data: { data: path === '/pagos' ? [
    { estado: 'PAGADO', metodoPago: 'MERCADO_PAGO', monto: 95 },
    { estado: 'PAGADO', metodoPago: 'EFECTIVO', monto: 30 },
    { estado: 'PAGADO', metodoPago: 'OTRO', monto: 5 },
    { estado: 'PENDIENTE', metodoPago: 'MERCADO_PAGO', monto: 500 },
  ] : path === '/mercado-pago/config' ? { enabled: false } : [] } }))
  render(<MemoryRouter><Dashboard /></MemoryRouter>)
  const label = await screen.findByText('Mercado Pago')
  expect(within(label.parentElement).getByText('S/ 95.00')).toBeInTheDocument()
  expect(within(screen.getByText('Otros métodos').parentElement).getByText('S/ 5.00')).toBeInTheDocument()
  expect(screen.getByText('S/ 130.00')).toBeInTheDocument()
})
