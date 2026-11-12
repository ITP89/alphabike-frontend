import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import GestionEntregas from './GestionEntregas'
import api from '../../api/axios'
vi.mock('../../api/axios', () => ({ default: { get: vi.fn() } }))
vi.mock('../../components/LayoutEncargado', () => ({ default: ({ children }) => <main>{children}</main> }))
it('permite consultar productos, destino y guía de un envío existente', async () => {
  api.get.mockResolvedValue({ data: { data: [{ id: 'pedido-1', clienteNombre: 'Ana', clienteEmail: 'ana@example.test',
    tipoEntrega: 'ENVIO_PROVINCIA', direccionEntrega: 'Av. Prueba 123, Cusco', estado: 'ENVIADO',
    numeroSeguimiento: 'GUIA-321', total: 95, detalles: [{ id: 'd1', cantidad: 2, productoNombre: 'Luz de bicicleta', subtotal: 95 }] }] } })
  render(<GestionEntregas />)
  expect(await screen.findByText(/Av. Prueba 123, Cusco/)).toBeInTheDocument()
  expect(screen.getByText(/GUIA-321/)).toBeInTheDocument()
  expect(screen.getByText(/2 × Luz de bicicleta/)).toBeInTheDocument()
})
