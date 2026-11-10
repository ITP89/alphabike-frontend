import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, expect, it, vi } from 'vitest'
import VentaPresencial from './VentaPresencial'
import api from '../../api/axios'
vi.mock('../../api/axios', () => ({ default: { get: vi.fn(), post: vi.fn() } }))
vi.mock('../../components/LayoutEncargado', () => ({ default: ({ children }) => <main>{children}</main> }))
vi.mock('../../context/AuthContext', () => ({ useAuth: () => ({ usuario: {id:'staff-test'} }) }))
const key = 'alphabike_venta_pendiente_staff-test'
beforeEach(() => {
 vi.clearAllMocks()
 sessionStorage.clear()
 api.get.mockResolvedValue({data:{data:[{id:'a',nombre:'Decimal A',precio:0.1,stock:10},{id:'b',nombre:'Decimal B',precio:0.2,stock:10}]}})
})
function mount() { return render(<QueryClientProvider client={new QueryClient()}><VentaPresencial /></QueryClientProvider>) }
async function prepare() {
 await screen.findByText('Decimal A')
 for(const button of screen.getAllByRole('button',{name:'Agregar',exact:true}))fireEvent.click(button)
}
it('registra 0.10 y 0.20 con una sola operacion y deja el importe del cobro al servidor', async () => {
 api.post.mockResolvedValue({data:{data:{id:'pedido-1',total:0.3,estado:'PAGADO'}}})
 mount(); await prepare()
 fireEvent.click(screen.getByRole('button',{name:'Registrar venta',exact:true}))
 await screen.findByText('Venta registrada correctamente')
 expect(api.post).toHaveBeenCalledTimes(1)
 const [url,body]=api.post.mock.calls[0]
 expect(url).toBe('/pedidos/venta-presencial')
 expect(body.detalles).toEqual([{productoId:'a',cantidad:1,precioAcordado:0.1},{productoId:'b',cantidad:1,precioAcordado:0.2}])
 expect(body).not.toHaveProperty('monto')
 expect(body.operacionId).toMatch(/^[0-9a-f-]{36}$/i)
 expect(sessionStorage.getItem(key)).toBeNull()
})
it('conserva la misma operacion tras perder respuesta y recargar la pantalla', async () => {
 api.post.mockRejectedValueOnce(new Error('Respuesta perdida')).mockResolvedValueOnce({data:{data:{id:'pedido-1',estado:'PAGADO'}}})
 const first=mount(); await prepare()
 fireEvent.click(screen.getByRole('button',{name:'Registrar venta',exact:true}))
 await screen.findByText(/No se pudo confirmar el resultado/)
 expect(sessionStorage.getItem(key)).not.toBeNull()
 for(const button of screen.getAllByRole('button',{name:'Agregar',exact:true}))expect(button).toBeDisabled()
 first.unmount(); mount()
 fireEvent.click(await screen.findByRole('button',{name:'Reintentar confirmacion',exact:true}))
 await screen.findByText('Venta registrada correctamente')
 expect(api.post).toHaveBeenCalledTimes(2)
 expect(api.post.mock.calls[1][1]).toEqual(api.post.mock.calls[0][1])
 expect(sessionStorage.getItem(key)).toBeNull()
})
it('permite corregir un rechazo de validacion sin conservar una reserva pendiente', async () => {
 api.post.mockRejectedValue({response:{status:400,data:{message:'Precio invalido'}}})
 mount(); await prepare()
 fireEvent.click(screen.getByRole('button',{name:'Registrar venta',exact:true}))
 await screen.findByText('Precio invalido')
 await waitFor(()=>expect(screen.getByRole('button',{name:'Registrar venta',exact:true})).toBeEnabled())
 expect(sessionStorage.getItem(key)).toBeNull()
 for(const field of screen.getAllByRole('spinbutton'))expect(field).toBeEnabled()
})

it('no envia la venta si el navegador no puede guardar su identificador de recuperacion', async () => {
 mount(); await prepare()
 const storage=vi.spyOn(Storage.prototype,'setItem').mockImplementationOnce(()=>{throw new DOMException('Quota','QuotaExceededError')})
 fireEvent.click(screen.getByRole('button',{name:'Registrar venta',exact:true}))
 await screen.findByText(/No se pudo guardar la operacion/)
 expect(api.post).not.toHaveBeenCalled()
 expect(screen.getByRole('button',{name:'Registrar venta',exact:true})).toBeEnabled()
 storage.mockRestore()
})
