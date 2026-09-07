import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Servicios from './Servicios'
import api from '../api/axios'

vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

vi.mock('../components/Navbar', () => ({
  default: () => <nav>AlphaBike</nav>,
}))

describe('Servicios', () => {
  let queryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
  })

  it('muestra servicios reales desde la API', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 'servicio-1',
            nombre: 'Mantenimiento general',
            descripcion: 'Revision completa',
            precioBase: 50,
            duracionMin: 60,
          },
        ],
      },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Servicios />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(await screen.findByText('Mantenimiento general')).toBeInTheDocument()
    expect(screen.getByText('Revision completa')).toBeInTheDocument()
    expect(screen.getByText('S/ 50.00')).toBeInTheDocument()
  })
})
