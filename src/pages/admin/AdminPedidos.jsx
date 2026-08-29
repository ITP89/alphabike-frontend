import { useEffect, useMemo, useState } from 'react'
import { Sparkles, Truck, PackageCheck, Send } from 'lucide-react'
import api from '../../api/axios'
import LayoutAdmin from '../../components/LayoutAdmin'
import Alert from '../../components/ui/Alert'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { getApiErrorMessage } from '../../utils/apiError'
import { classNames } from '../../utils/formatters'

const LABELS_ENTREGA = {
  RECOJO_TIENDA: 'Recojo en tienda',
  DELIVERY_LIMA: 'Delivery Lima',
  ENVIO_PROVINCIA: 'Envío a provincia',
}

const LABELS_ESTADO = {
  PENDIENTE: { texto: 'Pendiente', color: 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold' },
  PAGADO: { texto: 'Pagado', color: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black' },
  EN_PREPARACION: { texto: 'En Preparación', color: 'bg-slate-100 text-slate-700 border-slate-300 font-bold' },
  LISTO_PARA_RECOJO: { texto: 'Listo p/ Recojo', color: 'bg-blue-100 text-blue-900 border-blue-300 font-black' },
  EN_CAMINO: { texto: 'En Camino', color: 'bg-blue-100 text-blue-900 border-blue-300 font-black' },
  ENVIADO: { texto: 'Enviado (Agencia)', color: 'bg-purple-100 text-purple-900 border-purple-300 font-black' },
  ENTREGADO: { texto: 'Entregado', color: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black' },
  CANCELADO: { texto: 'Cancelado', color: 'bg-red-100 text-red-700 border-red-200' },
}

function AdminPedidos() {
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
      setMensaje({ type: 'success', text: 'Estado del pedido actualizado correctamente' })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo cambiar el estado') })
    }
  }

  async function registrarSeguimiento(id) {
    const numero = seguimientos[id]?.trim()
    if (!numero) {
      setMensaje({ type: 'error', text: 'Ingresa el número de seguimiento de la agencia' })
      return
    }

    setMensaje(null)

    try {
      const response = await api.patch(`/pedidos/${id}/seguimiento?numeroSeguimiento=${encodeURIComponent(numero)}`)
      setPedidos((prev) => prev.map((pedido) => (pedido.id === id ? response.data.data : pedido)))
      setSeguimientos((prev) => ({ ...prev, [id]: '' }))
      setMensaje({ type: 'success', text: 'Número de seguimiento registrado' })
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
            className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-black text-white hover:bg-blue-700 shadow-sm transition-all"
          >
            <PackageCheck className="h-3.5 w-3.5" /> Listo para Recojo
          </button>
        )
      }
      if (pedido.estado === 'LISTO_PARA_RECOJO') {
        return (
          <button
            type="button"
            onClick={() => cambiarEstado(pedido.id, 'ENTREGADO')}
            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-black text-white hover:bg-emerald-700 shadow-sm transition-all"
          >
            ✓ Entregado a Cliente
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
            className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-black text-white hover:bg-blue-700 shadow-sm transition-all"
          >
            <Truck className="h-3.5 w-3.5" /> En Camino (Motorizado)
          </button>
        )
      }
      if (pedido.estado === 'EN_CAMINO') {
        return (
          <button
            type="button"
            onClick={() => cambiarEstado(pedido.id, 'ENTREGADO')}
            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-black text-white hover:bg-emerald-700 shadow-sm transition-all"
          >
            ✓ Marcar Entregado
          </button>
        )
      }
    }

    if (pedido.tipoEntrega === 'ENVIO_PROVINCIA') {
      if (pedido.estado !== 'ENVIADO' && pedido.estado !== 'ENTREGADO') {
        return (
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Nro. Guía u Olva"
              value={seguimientos[pedido.id] || ''}
              onChange={(e) => setSeguimientos((prev) => ({ ...prev, [pedido.id]: e.target.value }))}
              className="w-32 rounded-xl border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold"
            />
            <button
              type="button"
              onClick={() => registrarSeguimiento(pedido.id)}
              className="inline-flex items-center gap-1 rounded-xl bg-purple-600 px-3 py-1 text-xs font-black text-white hover:bg-purple-700 shadow-sm transition-all"
            >
              <Send className="h-3 w-3" /> Guardar Guía
            </button>
          </div>
        )
      }
      if (pedido.estado === 'ENVIADO') {
        return <span className="text-xs font-extrabold text-purple-700">Guía: {pedido.numeroSeguimiento || '-'}</span>
      }
    }

    return <span className="text-xs font-semibold text-slate-400">Proceso completado</span>
  }

  return (
    <LayoutAdmin>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Despacho & Envíos Tienda</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Gestión de Pedidos</h1>
          <p className="mt-0.5 text-xs text-slate-500">Controla estados de preparación, recojos en local y códigos de seguimiento.</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm focus:border-amber-500"
        >
          <option value="">Todos los Tipos de Entrega</option>
          <option value="RECOJO_TIENDA">Recojo en Tienda</option>
          <option value="DELIVERY_LIMA">Delivery Express Lima</option>
          <option value="ENVIO_PROVINCIA">Envío a Provincia (Agencias)</option>
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm focus:border-amber-500"
        >
          <option value="">Todos los Estados</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="PAGADO">Pagados</option>
          <option value="LISTO_PARA_RECOJO">Listos para Recojo</option>
          <option value="EN_CAMINO">En Camino</option>
          <option value="ENVIADO">Enviados (Agencia)</option>
          <option value="ENTREGADO">Entregados</option>
        </select>
      </div>

      {mensaje && <Alert type={mensaje.type} className="mb-4 font-bold shadow-sm">{mensaje.text}</Alert>}
      {cargando && <LoadingState text="Cargando pedidos de la tienda..." />}
      {error && <ErrorState message={error} onRetry={cargarPedidos} />}

      {!cargando && !error && pedidosFiltrados.length === 0 && (
        <EmptyState title="No hay pedidos que mostrar" description="Prueba con otro tipo de entrega o estado." />
      )}

      {!cargando && !error && pedidosFiltrados.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="hidden grid-cols-5 bg-slate-900 px-6 py-3 text-xs font-bold text-slate-300 lg:grid">
            <span>Código Pedido</span>
            <span>Cliente</span>
            <span>Tipo Entrega</span>
            <span>Estado</span>
            <span className="text-right">Acción Rápida</span>
          </div>

          {pedidosFiltrados.map((pedido) => {
            const estado = LABELS_ESTADO[pedido.estado] || { texto: pedido.estado, color: 'bg-slate-100 text-slate-700' }

            return (
              <div key={pedido.id} className="grid grid-cols-1 gap-2 border-t border-slate-100 px-6 py-3.5 text-xs first:border-t-0 lg:grid-cols-5 lg:items-center lg:gap-0 hover:bg-slate-50 transition-colors">
                <span className="font-black text-slate-900">#{pedido.id.slice(0, 8)}</span>
                <span className="font-extrabold text-slate-800">{pedido.clienteNombre}</span>
                <span className="font-bold text-slate-600">{LABELS_ENTREGA[pedido.tipoEntrega] || pedido.tipoEntrega}</span>
                <div>
                  <span className={classNames('inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-wide', estado.color)}>
                    {estado.texto}
                  </span>
                </div>
                <div className="flex items-center justify-end">{accionesPorTipo(pedido)}</div>
              </div>
            )
          })}
        </div>
      )}
    </LayoutAdmin>
  )
}

export default AdminPedidos
