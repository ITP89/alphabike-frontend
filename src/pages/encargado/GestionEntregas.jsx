import { useEffect, useMemo, useState } from 'react'
import api from '../../api/axios'
import LayoutEncargado from '../../components/LayoutEncargado'
import Alert from '../../components/ui/Alert'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { getApiErrorMessage } from '../../utils/apiError'
import { classNames } from '../../utils/formatters'

const LABELS_ENTREGA = {
  RECOJO_TIENDA: 'Recojo en tienda',
  DELIVERY_LIMA: 'Delivery Lima',
  ENVIO_PROVINCIA: 'Envio a provincia',
}

const LABELS_ESTADO = {
  PENDIENTE: { texto: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  PAGADO: { texto: 'Pagado', color: 'bg-emerald-100 text-emerald-700' },
  EN_PREPARACION: { texto: 'En preparacion', color: 'bg-gray-100 text-gray-700' },
  LISTO_PARA_RECOJO: { texto: 'Listo para recojo', color: 'bg-blue-100 text-blue-700' },
  EN_CAMINO: { texto: 'En camino', color: 'bg-blue-100 text-blue-700' },
  ENVIADO: { texto: 'Enviado', color: 'bg-blue-100 text-blue-700' },
  ENTREGADO: { texto: 'Entregado', color: 'bg-emerald-100 text-emerald-700' },
  CANCELADO: { texto: 'Cancelado', color: 'bg-red-100 text-red-700' },
}

function GestionEntregas() {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [seguimientos, setSeguimientos] = useState({})
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState(null)

  async function cargarPedidos() {
    setCargando(true)
    setError('')

    try {
      const response = await api.get('/pedidos')
      setPedidos(response.data.data || [])
    } catch (err) {
      setPedidos([])
      setError(getApiErrorMessage(err, 'No se pudieron cargar los pedidos'))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarPedidos()
  }, [])

  const pedidosFiltrados = useMemo(() => (
    pedidos.filter((pedido) => {
      const coincideTipo = filtroTipo ? pedido.tipoEntrega === filtroTipo : true
      const coincideEstado = filtroEstado ? pedido.estado === filtroEstado : true
      return coincideTipo && coincideEstado
    })
  ), [filtroEstado, filtroTipo, pedidos])

  async function cambiarEstado(id, estado) {
    setMensaje(null)

    try {
      const response = await api.patch(`/pedidos/${id}/estado?estado=${estado}`)
      setPedidos((prev) => prev.map((pedido) => (pedido.id === id ? response.data.data : pedido)))
      setMensaje({ type: 'success', text: 'Estado actualizado correctamente' })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo cambiar el estado') })
    }
  }

  async function registrarSeguimiento(id) {
    const numero = seguimientos[id]?.trim()
    if (!numero) {
      setMensaje({ type: 'error', text: 'Ingresa el numero de seguimiento' })
      return
    }

    setMensaje(null)

    try {
      const response = await api.patch(`/pedidos/${id}/seguimiento?numeroSeguimiento=${encodeURIComponent(numero)}`)
      setPedidos((prev) => prev.map((pedido) => (pedido.id === id ? response.data.data : pedido)))
      setSeguimientos((prev) => ({ ...prev, [id]: '' }))
      setMensaje({ type: 'success', text: 'Numero de seguimiento registrado' })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo registrar el seguimiento') })
    }
  }

  function accionesPorTipo(pedido) {
    if (pedido.tipoEntrega === 'RECOJO_TIENDA') {
      if (pedido.estado === 'PAGADO' || pedido.estado === 'PENDIENTE') {
        return (
          <button
            type="button"
            onClick={() => cambiarEstado(pedido.id, 'LISTO_PARA_RECOJO')}
            className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
          >
            Listo para recojo
          </button>
        )
      }
      if (pedido.estado === 'LISTO_PARA_RECOJO') {
        return (
          <button
            type="button"
            onClick={() => cambiarEstado(pedido.id, 'ENTREGADO')}
            className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700"
          >
            Marcar entregado
          </button>
        )
      }
    }

    if (pedido.tipoEntrega === 'DELIVERY_LIMA') {
      if (pedido.estado === 'PAGADO' || pedido.estado === 'PENDIENTE') {
        return (
          <button
            type="button"
            onClick={() => cambiarEstado(pedido.id, 'EN_CAMINO')}
            className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
          >
            Marcar en camino
          </button>
        )
      }
      if (pedido.estado === 'EN_CAMINO') {
        return (
          <button
            type="button"
            onClick={() => cambiarEstado(pedido.id, 'ENTREGADO')}
            className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700"
          >
            Marcar entregado
          </button>
        )
      }
    }

    if (pedido.tipoEntrega === 'ENVIO_PROVINCIA') {
      if (pedido.estado !== 'ENVIADO' && pedido.estado !== 'ENTREGADO') {
        return (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Nro. seguimiento"
              value={seguimientos[pedido.id] || ''}
              onChange={(e) => setSeguimientos((prev) => ({ ...prev, [pedido.id]: e.target.value }))}
              className="w-36 rounded-md border border-gray-300 px-2 py-1 text-xs"
            />
            <button
              type="button"
              onClick={() => registrarSeguimiento(pedido.id)}
              className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
            >
              Enviado
            </button>
          </div>
        )
      }
      if (pedido.estado === 'ENVIADO') {
        return <span className="text-xs text-gray-500">Seguimiento: {pedido.numeroSeguimiento || '-'}</span>
      }
    }

    return <span className="text-xs text-gray-400">Sin accion</span>
  }

  return (
    <LayoutEncargado>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-950">Gestion de pedidos para entrega</h1>
        <p className="mt-1 text-sm text-gray-500">Controla recojos, delivery y envios a provincia.</p>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Tipo: todos</option>
          <option value="RECOJO_TIENDA">Recojo en tienda</option>
          <option value="DELIVERY_LIMA">Delivery Lima</option>
          <option value="ENVIO_PROVINCIA">Envio a provincia</option>
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Estado: todos</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="PAGADO">Pagado</option>
          <option value="EN_PREPARACION">En preparacion</option>
          <option value="LISTO_PARA_RECOJO">Listo para recojo</option>
          <option value="EN_CAMINO">En camino</option>
          <option value="ENVIADO">Enviado</option>
          <option value="ENTREGADO">Entregado</option>
        </select>
      </div>

      {mensaje && <Alert type={mensaje.type} className="mb-4">{mensaje.text}</Alert>}
      {cargando && <LoadingState text="Cargando pedidos..." />}
      {error && <ErrorState message={error} onRetry={cargarPedidos} />}

      {!cargando && !error && pedidosFiltrados.length === 0 && (
        <EmptyState title="No hay pedidos que mostrar" description="Prueba con otro tipo de entrega o estado." />
      )}

      {!cargando && !error && pedidosFiltrados.length > 0 && (
        <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
          <div className="hidden grid-cols-5 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500 lg:grid">
            <span>Pedido</span>
            <span>Cliente</span>
            <span>Tipo entrega</span>
            <span>Estado</span>
            <span>Accion</span>
          </div>

          {pedidosFiltrados.map((pedido) => {
            const estado = LABELS_ESTADO[pedido.estado] || { texto: pedido.estado, color: 'bg-gray-100 text-gray-700' }

            return (
              <div key={pedido.id} className="grid grid-cols-1 gap-2 border-t border-gray-200 px-4 py-4 text-sm first:border-t-0 lg:grid-cols-5 lg:items-center lg:gap-0">
                <span className="font-medium text-gray-950">#{pedido.id.slice(0, 8)}</span>
                <span className="text-gray-700">{pedido.clienteNombre}</span>
                <span className="text-gray-600">{LABELS_ENTREGA[pedido.tipoEntrega] || pedido.tipoEntrega}</span>
                <span className={classNames('inline-flex w-fit rounded-md px-2 py-1 text-xs font-medium', estado.color)}>
                  {estado.texto}
                </span>
                <div>{accionesPorTipo(pedido)}</div>
              </div>
            )
          })}
        </div>
      )}
    </LayoutEncargado>
  )
}

export default GestionEntregas
