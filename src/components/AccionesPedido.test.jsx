import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AccionesPedido from './AccionesPedido'

describe('flujo de entregas', () => {
  it.each(['RECOJO_TIENDA', 'DELIVERY_LIMA', 'ENVIO_PROVINCIA'])('exige preparar un pedido pagado de %s', async tipoEntrega => {
    const onEstado = vi.fn().mockResolvedValue(undefined)
    render(<AccionesPedido pedido={{ id: '1', estado: 'PAGADO', tipoEntrega }} onEstado={onEstado} />)
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar preparación' }))
    await waitFor(() => expect(onEstado).toHaveBeenCalledWith('1', 'EN_PREPARACION'))
  })
  it('no ofrece despacho antes de pagar ni después de cancelar', () => {
    const { rerender } = render(<AccionesPedido pedido={{ estado: 'PENDIENTE' }} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    rerender(<AccionesPedido pedido={{ estado: 'CANCELADO', tipoEntrega: 'ENVIO_PROVINCIA' }} />)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
  it('pide guía al enviar a provincia y permite confirmar entrega después', async () => {
    const onSeguimiento = vi.fn().mockResolvedValue(undefined), onEstado = vi.fn().mockResolvedValue(undefined)
    const { rerender } = render(<AccionesPedido pedido={{ id: '1', estado: 'EN_PREPARACION', tipoEntrega: 'ENVIO_PROVINCIA' }} onSeguimiento={onSeguimiento} onEstado={onEstado} />)
    expect(screen.getByRole('button')).toBeDisabled()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: ' GUIA-123 ' } })
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => expect(onSeguimiento).toHaveBeenCalledWith('1', 'GUIA-123'))
    rerender(<AccionesPedido pedido={{ id: '1', estado: 'ENVIADO', tipoEntrega: 'ENVIO_PROVINCIA' }} onEstado={onEstado} />)
    fireEvent.click(screen.getByRole('button', { name: 'Marcar entregado' }))
    await waitFor(() => expect(onEstado).toHaveBeenCalledWith('1', 'ENTREGADO'))
  })
})
