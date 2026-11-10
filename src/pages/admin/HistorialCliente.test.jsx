import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { expect, it, vi } from 'vitest'
import HistorialCliente from './HistorialCliente'
import api from '../../api/axios'
vi.mock('../../api/axios',()=>({default:{get:vi.fn()}}))
vi.mock('../../components/LayoutAdmin',()=>({default:({children})=><main>{children}</main>}))
it('muestra como total pagado solo pedidos confirmados, con centimos',async()=>{
 const order=(id,total,estadoPago,estado)=>({id,total,estadoPago,estado,fecha:'2026-11-10T10:00:00',tipoEntrega:'RECOJO_TIENDA'})
 api.get.mockResolvedValue({data:{data:{usuario:{nombre:'Cliente',email:'cliente@example.invalid',telefono:'999999999',estado:'ACTIVO'},citas:[],pedidos:[order('pagado',100.25,'PAGADO','PAGADO'),order('pendiente',500,'PENDIENTE','PENDIENTE'),order('cancelado',800,'PENDIENTE','CANCELADO')]}}})
 render(<MemoryRouter initialEntries={['/history/cliente-1']}><Routes><Route path="/history/:id" element={<HistorialCliente/>}/></Routes></MemoryRouter>)
 const label=await screen.findByText('Total pagado en pedidos')
 expect(within(label.parentElement).getByText('S/ 100.25')).toBeInTheDocument()
})
