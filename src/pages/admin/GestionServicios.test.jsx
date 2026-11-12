import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { expect, it, vi } from 'vitest'
import GestionServicios from './GestionServicios'
import Servicios from '../Servicios'
import api from '../../api/axios'

vi.mock('../../api/axios', () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }))
vi.mock('../../components/LayoutAdmin', () => ({ default: ({ children }) => <main>{children}</main> }))
vi.mock('../../components/Navbar', () => ({ default: () => <nav>AlphaBike</nav> }))

it('actualiza el catalogo publico tras crear, editar y eliminar desde administracion', async () => {
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  let rows = [{ id: '1', nombre: 'Servicio original', descripcion: 'Revision', precioBase: 50, duracionMin: 30 }]
  api.get.mockImplementation(async () => ({ data: { data: [...rows] } }))
  api.post.mockImplementation(async (_, body) => {
    const row = { ...body, id: '2' }
    rows = [...rows, row]
    return { data: { data: row } }
  })
  api.put.mockImplementation(async (_, body) => {
    const row = { ...body, id: '2' }
    rows = rows.map(item => item.id === '2' ? row : item)
    return { data: { data: row } }
  })
  api.delete.mockImplementation(async () => { rows = rows.filter(item => item.id !== '2') })
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: 300000, retry: false } } })
  const view = page => <QueryClientProvider client={client}><MemoryRouter>{page}</MemoryRouter></QueryClientProvider>
  const { rerender } = render(view(<Servicios />))
  await screen.findByRole('heading', { name: 'Servicio original' })
  rerender(view(<GestionServicios />))
  await screen.findByText('Servicio original')
  fireEvent.click(screen.getByRole('button', { name: 'Nuevo Servicio' }))
  fireEvent.change(screen.getByLabelText('Nombre del servicio *'), { target: { value: 'Servicio nuevo' } })
  fireEvent.change(screen.getByLabelText('Precio Base (S/) *'), { target: { value: '60' } })
  fireEvent.change(screen.getByLabelText('Duración (min) *'), { target: { value: '40' } })
  fireEvent.click(screen.getByRole('button', { name: 'Guardar Servicio' }))
  await screen.findByText('Servicio creado correctamente')
  rerender(view(<Servicios />))
  await screen.findByRole('heading', { name: 'Servicio nuevo' })
  rerender(view(<GestionServicios />))
  await screen.findByText('Servicio nuevo')
  fireEvent.click(screen.getAllByRole('button', { name: 'Editar' })[1])
  fireEvent.change(screen.getByLabelText('Nombre del servicio *'), { target: { value: 'Servicio actualizado' } })
  fireEvent.click(screen.getByRole('button', { name: 'Actualizar', exact: true }))
  await screen.findByText('Servicio actualizado correctamente')
  rerender(view(<Servicios />))
  await screen.findByRole('heading', { name: 'Servicio actualizado' })
  expect(screen.queryByRole('heading', { name: 'Servicio nuevo' })).not.toBeInTheDocument()
  rerender(view(<GestionServicios />))
  await screen.findByText('Servicio actualizado')
  fireEvent.click(screen.getAllByRole('button', { name: 'Eliminar' })[1])
  await screen.findByText('Servicio eliminado correctamente')
  rerender(view(<Servicios />))
  await waitFor(() => expect(screen.queryByRole('heading', { name: 'Servicio actualizado' })).not.toBeInTheDocument())
  expect(screen.getByRole('heading', { name: 'Servicio original' })).toBeInTheDocument()
})
