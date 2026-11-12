import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import AdminPagos from './AdminPagos'
import api from '../../api/axios'
vi.mock('../../api/axios', () => ({ default: { get: vi.fn() } }))
vi.mock('../../components/LayoutAdmin', () => ({ default: ({ children }) => <main>{children}</main> }))
it('busca por cliente y muestra datos reales sin inventar RUC ni autorización', async () => {
  api.get.mockResolvedValue({ data: { data: [{ id: 'pago-123', referenciaTipo: 'PEDIDO', referenciaId: 'pedido-123',
    clienteNombre: 'Ana Perez', estado: 'PAGADO', monto: 95, metodoPago: 'TARJETA',
    fecha: '2026-11-11T10:00:00', tarjetaMarca: 'VISA', tarjetaUltimos4: '4242', transaccionId: 'TEST-123' }] } })
  render(<AdminPagos />)
  await screen.findByText('VISA •••• 4242')
  const search = screen.getByRole('textbox')
  fireEvent.change(search, { target: { value: 'Ana Perez' } })
  expect(screen.getByText('VISA •••• 4242')).toBeInTheDocument()
  const button = screen.getAllByRole('button').find(button => button.querySelector('svg.lucide-eye'))
  expect(button).toBeTruthy()
  fireEvent.click(button)
  expect(await screen.findByText('Ana Perez')).toBeInTheDocument()
  expect(screen.getByText('No registrada')).toBeInTheDocument()
  expect(screen.getByText(/No es comprobante tributario/)).toBeInTheDocument()
  expect(screen.queryByText(/20608945123/)).not.toBeInTheDocument()
})
