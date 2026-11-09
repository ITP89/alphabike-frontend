import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, it, vi } from 'vitest'
import Contacto from './Contacto'
vi.mock('../components/Navbar', () => ({ default: () => <nav>AlphaBike</nav> }))
it('prepara la consulta completa sin afirmar envio ni borrar los datos', () => {
 const open = vi.spyOn(window, 'open').mockImplementation(() => null)
 render(<MemoryRouter><Contacto /></MemoryRouter>)
 fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Cliente de prueba' } })
 fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'cliente@example.invalid' } })
 fireEvent.change(screen.getByLabelText('Teléfono / WhatsApp'), { target: { value: '999999999' } })
 fireEvent.change(screen.getByLabelText('Detalle de tu Consulta'), { target: { value: 'Necesito mantenimiento para mi bicicleta' } })
 fireEvent.click(screen.getByRole('button', { name: 'Preparar consulta por WhatsApp' }))
 expect(open).toHaveBeenCalledOnce()
 const url = new URL(open.mock.calls[0][0])
 expect(url.hostname).toBe('wa.me')
 expect(url.searchParams.get('text')).toContain('Necesito mantenimiento para mi bicicleta')
 expect(url.searchParams.get('text')).toContain('cliente@example.invalid')
 expect(screen.getByDisplayValue('Cliente de prueba')).toBeInTheDocument()
 expect(screen.getByText(/Pulsa Enviar en WhatsApp/)).toBeInTheDocument()
 expect(screen.queryByText(/Tu mensaje ha sido enviado/)).not.toBeInTheDocument()
 open.mockRestore()
})

