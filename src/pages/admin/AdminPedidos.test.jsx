import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, it, vi } from 'vitest'
import AdminPedidos from './AdminPedidos'
import api from '../../api/axios'
vi.mock('../../api/axios', () => ({ default: { get: vi.fn() } }))
vi.mock('../../components/LayoutAdmin', () => ({ default: ({ children }) => <main>{children}</main> }))
vi.mock('../../hooks/useRefreshCatalogo', () => ({ useRefreshCatalogo: () => vi.fn() }))
it('muestra precio acordado y correo del contrato real, y no verifica pedidos cancelados', async () => {
  api.get.mockImplementation(async path => ({ data: { data: path === '/pedidos' ? [{ id: '12345678-1', clienteNombre: 'Ana', clienteEmail: 'ana@example.test', fecha: '2026-11-11T10:00:00', total: 95, tipoEntrega: 'RECOJO_TIENDA', estado: 'CANCELADO', detalles: [{ id: 'd1', productoNombre: 'Luz', cantidad: 1, precioAcordado: 95, subtotal: 95 }] }] : [] } }))
  render(<MemoryRouter><AdminPedidos /></MemoryRouter>)
  fireEvent.click(await screen.findByTitle('Ver detalles completos del pedido'))
  expect(screen.getByText(/1 unid. × S\/ 95.00/)).toBeInTheDocument()
  expect(screen.getByText('ana@example.test')).toBeInTheDocument()
  expect(screen.queryByText('Reciente')).not.toBeInTheDocument()
  expect(screen.getAllByText('11/11/2026').length).toBeGreaterThan(0)
  expect(screen.getByText('Pedido cancelado')).toBeInTheDocument()
  expect(screen.queryByText('Transacción Verificada')).not.toBeInTheDocument()
})
