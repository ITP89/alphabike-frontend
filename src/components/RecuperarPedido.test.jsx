import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import RecuperarPedido from './RecuperarPedido'
import api from '../api/axios'
import { procesarPago } from '../services/paymentGateway'
vi.mock('../api/axios', () => ({ default: { patch: vi.fn() } }))
vi.mock('../hooks/useRefreshCatalogo', () => ({ useRefreshCatalogo: () => vi.fn() }))
vi.mock('../services/paymentGateway', () => ({ procesarPago: vi.fn(), validarDatosTarjeta: () => ({ valido: true }) }))
vi.mock('./checkout/PasarelaPago', () => ({ default: () => <p>Formulario de pago</p> }))
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.clearAllMocks() })
const pedido = { id: 'p1', estado: 'PENDIENTE', total: 95, tipoEntrega: 'RECOJO_TIENDA' }
it('retoma el mismo pedido sin crear otro ni duplicar un envío', async () => {
  const actualizar = vi.fn()
  procesarPago.mockResolvedValue({})
  render(<RecuperarPedido pedido={pedido} config={{ enabled: false }} onActualizar={actualizar} />)
  const boton = screen.getByRole('button', { name: 'Completar pago de prueba' })
  fireEvent.click(boton); fireEvent.click(boton)
  await waitFor(() => expect(actualizar).toHaveBeenCalledOnce())
  expect(procesarPago).toHaveBeenCalledOnce()
  expect(procesarPago).toHaveBeenCalledWith(expect.objectContaining({ pedidoId: 'p1', monto: 95 }))
})
it('cancelar requiere confirmación y vuelve a consultar el estado', async () => {
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  api.patch.mockResolvedValue({})
  const actualizar = vi.fn()
  render(<RecuperarPedido pedido={pedido} config={{ enabled: true }} onActualizar={actualizar} />)
  expect(screen.queryByRole('button', { name: 'Completar pago de prueba' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar pedido pendiente' }))
  await waitFor(() => expect(actualizar).toHaveBeenCalledOnce())
  expect(api.patch).toHaveBeenCalledWith('/pedidos/p1/cancelar')
})
it('un pedido ya pagado no muestra acciones de recuperación', () => {
  render(<RecuperarPedido pedido={{ ...pedido, estado: 'PAGADO' }} onActualizar={vi.fn()} />)
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})
