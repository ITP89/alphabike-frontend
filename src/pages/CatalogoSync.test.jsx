import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import Tienda from './Tienda'
import GestionCategorias from './admin/GestionCategorias'
import AdminProductos from './admin/AdminProductos'
import GestionProductos from './encargado/GestionProductos'
import api from '../api/axios'
vi.mock('../api/axios', () => ({ default: { get: vi.fn(), delete: vi.fn(), patch: vi.fn() } }))
vi.mock('../components/LayoutAdmin', () => ({ default: ({ children }) => <main>{children}</main> }))
vi.mock('../components/LayoutEncargado', () => ({ default: ({ children }) => <main>{children}</main> }))
vi.mock('../components/Navbar', () => ({ default: () => <nav>AlphaBike</nav> }))
vi.mock('../context/CarritoContext', () => ({ useCarrito: () => ({ agregarProducto: vi.fn() }) }))
let categorias, productos
beforeEach(() => {
 vi.clearAllMocks()
 categorias = [{ id: 'categoria-1', nombre: 'Categoria de prueba', descripcion: 'Prueba' }]
 productos = [{ id: 'producto-1', nombre: 'Bicicleta de prueba', marca: 'Test', precio: 50, stock: 10, estado: 'ACTIVO', categoriaId: 'categoria-1' }]
 api.get.mockImplementation(async path => ({ data: { data: path === '/categorias' ? [...categorias] : path.startsWith('/productos') ? [...productos] : [] } }))
 api.patch.mockImplementation(async () => { productos = productos.map(p => ({ ...p, stock: 7 })); return { data: { data: productos[0] } } })
 api.delete.mockImplementation(async path => { if (path.startsWith('/categorias')) categorias = []; else productos = [] })
})
function setup() {
 const client = new QueryClient({ defaultOptions: { queries: { staleTime: 300000, retry: false } } })
 const wrap = page => <QueryClientProvider client={client}><MemoryRouter>{page}</MemoryRouter></QueryClientProvider>
 const { rerender } = render(wrap(<Tienda />))
 return page => rerender(wrap(page))
}
it('retira la categoria eliminada del filtro al volver a tienda sin recargar', async () => {
  vi.spyOn(window, 'confirm').mockReturnValue(true)
 productos = []
 const go = setup()
 await screen.findByRole('option', { name: 'Categoria de prueba' })
 go(<GestionCategorias />)
 await screen.findByText('Categoria de prueba')
 fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
 await screen.findByText('Categoría eliminada correctamente')
 go(<Tienda />)
 await waitFor(() => expect(screen.queryByRole('option', { name: 'Categoria de prueba' })).not.toBeInTheDocument())
})
it.each([['administrador', AdminProductos], ['encargado', GestionProductos]])('sincroniza stock desde %s con tienda', async (_, Component) => {
 const go = setup()
 await screen.findByText('10 disponibles')
 go(<Component />)
 fireEvent.click(await screen.findByRole('button', { name: '10 uds' }))
 fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '7' } })
 fireEvent.click(screen.getByRole('button', { name: 'OK', exact: true }))
 await screen.findByText('Stock actualizado correctamente')
 go(<Tienda />)
 await screen.findByText('7 disponibles')
 expect(screen.queryByText('10 disponibles')).not.toBeInTheDocument()
})
it('retira de tienda el producto descontinuado por administrador', async () => {
 const go = setup()
 await screen.findByText('10 disponibles')
 go(<AdminProductos />)
 fireEvent.click(await screen.findByTitle('Descontinuar producto'))
 await screen.findByText('Producto descontinuado correctamente')
 go(<Tienda />)
 await waitFor(() => expect(screen.queryByText('Bicicleta de prueba')).not.toBeInTheDocument())
})
