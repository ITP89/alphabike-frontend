import { useState } from 'react'
import { getAccionPedido } from '../utils/pedidoWorkflow'

export default function AccionesPedido({ pedido, onEstado, onSeguimiento }) {
  const [guia, setGuia] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const accion = getAccionPedido(pedido)
  async function ejecutar() {
    if (ocupado) return
    setOcupado(true)
    try {
      if (accion.guia) await onSeguimiento(pedido.id, guia.trim())
      else await onEstado(pedido.id, accion.estado)
    } finally { setOcupado(false) }
  }
  if (!accion) return <span className="text-sm text-slate-500">{pedido.estado === 'PENDIENTE' ? 'Pendiente de pago' : 'Sin acciones pendientes'}</span>
  return <div className="flex flex-wrap items-center gap-2">
    {accion.guia && <input aria-label="Número de seguimiento" maxLength={100} value={guia} onChange={e => setGuia(e.target.value)} placeholder="Número de guía" className="w-36 rounded-lg border border-slate-300 px-3 py-2 text-sm" />}
    <button type="button" disabled={ocupado || (accion.guia && !guia.trim())} onClick={ejecutar} className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{ocupado ? 'Guardando…' : accion.label}</button>
  </div>
}
