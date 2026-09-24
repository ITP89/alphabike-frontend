import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RecuperarPassword from './RecuperarPassword'
import api from '../api/axios'
import { AuthProvider } from '../context/AuthContext'

vi.mock('../api/axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
    },
  },
}))

vi.mock('../components/Navbar', () => ({
  default: () => <nav>AlphaBike Navbar</nav>,
}))

describe('RecuperarPassword Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('permite ingresar correo y enviar solicitud de recuperación exitosa', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Si el correo está registrado, recibirás un enlace.',
      },
    })

    render(
      <MemoryRouter>
        <AuthProvider>
          <RecuperarPassword />
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /¿Olvidaste tu contraseña\?/i })).toBeInTheDocument()

    const inputEmail = screen.getByPlaceholderText(/tu-correo@ejemplo.com/i)
    fireEvent.change(inputEmail, { target: { value: 'cliente@ejemplo.com' } })

    const botonEnviar = screen.getByRole('button', { name: /Enviar Enlace de Recuperación/i })
    fireEvent.click(botonEnviar)

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'cliente@ejemplo.com',
      })
    })

    expect(await screen.findByText(/¡Revisa tu bandeja de entrada!/i)).toBeInTheDocument()
  })
})
