import { useState, useEffect } from 'react'
import api from '../../api/axios'
import LayoutAdmin from '../../components/LayoutAdmin'

const LABELS_ENTREGA = {
  RECOJO_TIENDA: 'Recojo en tienda',
  DELIVERY_LIMA: 'Delivery Lima',
  ENVIO_PROVINCIA: 'Envio a provincia',
}

const LABELS_ESTADO = {
  PENDIENTE: { texto: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  PAGADO: { texto: 'Pagado', color: 'bg-green-100 text-green-700' },
  EN_PREPARACION: { texto: 'En preparacion', color: 'bg-gray-100 text-gray-700' },
  LISTO_PARA_RECOJO: { texto: 'Listo para recojo', color: 'bg-blue-100 text-blue-700' },
  EN_CAMINO: { texto: 'En camino', color: 'bg-blue-100 text-blue-700' },
  ENVIADO: { texto: 'Enviado', color: 'bg-blue-100 text-blue-700' },
  ENTREGADO: { texto: 'Entregado', color: 'bg-green-100 text-green-700' },
  CANCELADO: { texto: 'Cancelado', color: 'bg-red-100 text-red-700' },
}

function AdminPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [seguimientos, setSeguimientos] = useState({})

  useEffect(() => {
    async function cargarPedidos() {
      try {
        const response = await api.get('/pedidos')
        setPedidos(response.data.data)
      } catch (err) {
        console.error('Error cargando pedidos', err)
      } finally {
        setCargando(false)
      }
    }
    cargarPedidos()
  }, [])

  const pedidosFiltrados = pedidos.filter((p) => {
    const coincideTipo = filtroTipo ? p.tipoEntrega === filtroTipo : true
    const coincideEstado = filtroEstado ? p.estado === filtroEstado : true
    return coincideTipo && coincideEstado
  })

  async function cambiarEstado(id, estado) {
    try {
      const response = await api.patch(`/pedidos/${id}/estado?estado=${estado}`)
      setPedidos((prev) => prev.map((p) => p.id === id ? response.data.data : p))
    } catch (err) {
      console.error('Error cambiando estado', err)
    }
  }

  async function registrarSeguimiento(id) {
    const numero = seguimientos[id]
    if (!numero) return
    try {
      const response = await api.patch(`/pedidos/${id}/seguimiento?numeroSeguimiento=${numero}`)
      setPedidos((prev) => prev.map((p) => p.id === id ? response.data.data : p))
      setSeguimientos((prev) => ({ ...prev, [id]: '' }))
    } catch (err) {
      console.error('Error registrando seguimiento', err)
    }
  }

  function accionesPorTipo(pedido) {
    if (pedido.tipoEntrega === 'RECOJO_TIENDA') {
      if (pedido.estado === 'PAGADO' || pedido.estado === 'PENDIENTE')
        return <button onClick={() => cambiarEstado(pedido.id, 'LISTO_PARA_RECOJO')}
          className="text-xs bg-blue-600 text-white px-2 py-1 rounded-md">Listo para recojo</button>
      if (pedido.estado === 'LISTO_PARA_RECOJO')
        return <button onClick={() => cambiarEstado(pedido.id, 'ENTREGADO')}
          className="text-xs bg-green-600 text-white px-2 py-1 rounded-md">Marcar entregado</button>
    }
    if (pedido.tipoEntrega === 'DELIVERY_LIMA') {
      if (pedido.estado === 'PAGADO' || pedido.estado === 'PENDIENTE')
        return <button onClick={() => cambiarEstado(pedido.id, 'EN_CAMINO')}
          className="text-xs bg-blue-600 text-white px-2 py-1 rounded-md">En camino</button>
      if (pedido.estado === 'EN_CAMINO')
        return <button onClick={() => cambiarEstado(pedido.id, 'ENTREGADO')}
          className="text-xs bg-green-600 text-white px-2 py-1 rounded-md">Marcar entregado</button>
    }
    if (pedido.tipoEntrega === 'ENVIO_PROVINCIA' && pedido.estado !== 'ENVIADO' && pedido.estado !== 'ENTREGADO')
      return (
        <div className="flex gap-1 items-center">
          <input type="text" placeholder="N° seguimiento" value={seguimientos[pedido.id] || ''}
            onChange={(e) => setSeguimientos((prev) => ({ ...prev, [pedido.id]: e.target.value }))}
            className="border border-gray-300 rounded px-2 py-1 text-xs w-24" />
          <button onClick={() => registrarSeguimiento(pedido.id)}
            className="text-xs bg-blue-600 text-white px-2 py-1 rounded-md">Enviado</button>
        </div>
      )
    return null
  }

  return (
    <LayoutAdmin>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Gestion de pedidos</h1>

      <div className="flex gap-3 mb-4">
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
          <option value="">Tipo: todos</option>
          <option value="RECOJO_TIENDA">Recojo en tienda</option>
          <option value="DELIVERY_LIMA">Delivery Lima</option>
          <option value="ENVIO_PROVINCIA">Envio a provincia</option>
        </select>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
          <option value="">Estado: todos</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PREPARACION">En preparacion</option>
          <option value="LISTO_PARA_RECOJO">Listo para recojo</option>
          <option value="EN_CAMINO">En camino</option>
          <option value="ENVIADO">Enviado</option>
          <option value="ENTREGADO">Entregado</option>
        </select>
      </div>

      {cargando ? (
        <p className="text-gray-500 text-sm">Cargando pedidos...</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-5 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500">
            <span>Pedido</span><span>Cliente</span><span>Tipo entrega</span><span>Estado</span><span>Accion</span>
          </div>
          {pedidosFiltrados.length === 0 && (
            <p className="text-gray-500 text-sm px-4 py-3">No hay pedidos que mostrar</p>
          )}
          {pedidosFiltrados.map((pedido) => {
            const estado = LABELS_ESTADO[pedido.estado] || { texto: pedido.estado, color: 'bg-gray-100' }
            return (
              <div key={pedido.id} className="grid grid-cols-5 px-4 py-3 border-t border-gray-200 text-sm items-center">
                <span>#{pedido.id.slice(0, 8)}</span>
                <span>{pedido.clienteNombre}</span>
                <span>{LABELS_ENTREGA[pedido.tipoEntrega]}</span>
                <span className={`text-xs px-2 py-1 rounded-md inline-block w-fit ${estado.color}`}>
                  {estado.texto}
                </span>
                <div>{accionesPorTipo(pedido)}</div>
              </div>
            )
          })}
        </div>
      )}
    </LayoutAdmin>
  )
}

export default AdminPedidos