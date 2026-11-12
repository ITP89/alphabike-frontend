import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import api from '../../api/axios'
import AdminProductos from './AdminProductos'

vi.mock('../../api/axios', () => ({ default: { get: vi.fn(), delete: vi.fn() } }))
vi.mock('../../components/LayoutAdmin', () => ({ default: ({ children }) => <main>{children}</main> }))
vi.mock('../../hooks/useRefreshCatalogo', () => ({ useRefreshCatalogo: () => vi.fn() }))
afterEach(() => vi.restoreAllMocks())

it('retira el producto de la lista activa y conserva su consulta como descontinuado', async () => {
  api.get.mockImplementation(async (path) => ({ data: { data: path === '/productos/todos'
    ? [{ id: 'p1', nombre: 'Luz de prueba', marca: 'Alpha', estado: 'ACTIVO', precio: 20, stock: 1 }]
    : [] } }))
  api.delete.mockResolvedValue({})
  const confirmar = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)
  render(<AdminProductos />)
  const retiro = await screen.findByRole('button', { name: 'Descontinuar Luz de prueba' })
  fireEvent.click(retiro)
  expect(api.delete).not.toHaveBeenCalled()
  fireEvent.click(retiro)
  await screen.findByText(/Producto retirado del catálogo/)
  expect(api.delete).toHaveBeenCalledExactlyOnceWith('/productos/p1')
  expect(confirmar).toHaveBeenCalledTimes(2)
  expect(screen.queryByRole('article', { name: 'Luz de prueba' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Ver productos descontinuados' }))
  const producto = screen.getByRole('article', { name: 'Luz de prueba' })
  expect(within(producto).getByText('Descontinuado')).toBeInTheDocument()
  expect(within(producto).queryByRole('button')).not.toBeInTheDocument()
})
