import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import Reportes from './Reportes'
import api from '../../api/axios'
vi.mock('../../api/axios', () => ({ default: { get: vi.fn() } }))
vi.mock('../../components/LayoutAdmin', () => ({ default: ({ children }) => <main>{children}</main> }))
it('distingue una consulta fallida de resultados vacíos o importes cero', async () => {
  api.get.mockImplementation(async path => {
    if (path === '/reportes/ventas') throw new Error('Network error')
    return { data: { data: [] } }
  })
  render(<Reportes />)
  expect(await screen.findByText(/No se pudieron consultar: Resumen de ventas/)).toBeInTheDocument()
  expect(screen.getAllByText('No disponible')).toHaveLength(3)
  expect(screen.queryByText('S/ 0.00')).not.toBeInTheDocument()
})
