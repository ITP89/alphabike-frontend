import { useEffect, useMemo, useState } from 'react'
import {
  Sparkles,
  Truck,
  PackageCheck,
  Send,
  Search,
  Eye,
  Clock,
  CreditCard,
  X,
  MapPin,
  User,
  ShoppingBag,
} from 'lucide-react'
import api from '../../api/axios'
import LayoutAdmin from '../../components/LayoutAdmin'
import Alert from '../../components/ui/Alert'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { getApiErrorMessage } from '../../utils/apiError'
import { classNames, formatMoney } from '../../utils/formatters'

const LABELS_ENTREGA = {
  RECOJO_TIENDA: 'Recojo en tienda',
  DELIVERY_LIMA: 'Delivery Express Lima',
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
  const [pagosMap, setPagosMap] = useState({})
  const [cargando, setCargando] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [seguimientos, setSeguimientos] = useState({})
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState(null)

  // Modal de Detalle de Pedido
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)

  async function cargarPedidos() {
    setCargando(true)
    setError('')

    try {
      const [pedidosRes, pagosRes] = await Promise.all([
        api.get('/pedidos'),
        api.get('/pagos').catch(() => ({ data: { data: [] } })),
      ])

      const listPedidos = pedidosRes.data.data || []
      const listPagos = pagosRes.data?.data || []

      // Mapa de pagos por referenciaId
      const mapa = {}
      listPagos.forEach((pago) => {
        mapa[pago.referenciaId] = pago
      })

      // Complementar con comprobantes locales si existen
      try {
        const locales = JSON.parse(localStorage.getItem('alphabike_comprobantes') || '{}')
        Object.entries(locales).forEach(([refId, comp]) => {
          if (!mapa[refId]) {
            mapa[refId] = {
              metodoPago: comp.metodoPago,
              autorizacion: comp.autorizacion,
              transaccionId: comp.transaccionId,
              monto: comp.monto,
              estado: 'PAGADO',
            }
          } else {
            mapa[refId].metodoPagoReal = comp.metodoPago
            mapa[refId].autorizacion = comp.autorizacion
            mapa[refId].transaccionId = comp.transaccionId
          }
        })
      } catch {
        // Ignorar
      }

      setPedidos(listPedidos)
      setPagosMap(mapa)
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

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((pedido) => {
      const coincideTipo = filtroTipo ? pedido.tipoEntrega === filtroTipo : true
      const coincideEstado = filtroEstado ? pedido.estado === filtroEstado : true
      const q = busqueda.toLowerCase().trim()
      const coincideTexto =
        !q ||
        pedido.id.toLowerCase().includes(q) ||
        pedido.clienteNombre?.toLowerCase().includes(q) ||
        pedido.direccionEntrega?.toLowerCase().includes(q)

      return coincideTipo && coincideEstado && coincideTexto
    })
  }, [pedidos, filtroTipo, filtroEstado, busqueda])

  async function cambiarEstado(id, estado) {
    setMensaje(null)
    try {
      const response = await api.patch(`/pedidos/${id}/estado?estado=${estado}`)
      setPedidos((prev) => prev.map((p) => (p.id === id ? response.data.data : p)))
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
      setPedidos((prev) => prev.map((p) => (p.id === id ? response.data.data : p)))
      setSeguimientos((prev) => ({ ...prev, [id]: '' }))
      setMensaje({ type: 'success', text: 'Número de seguimiento registrado exitosamente' })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo registrar el seguimiento') })
    }
  }

  // Acción rápida para registrar cobro directo de un pedido pendiente
  async function confirmarCobroRapido(pedido) {
    try {
      await api.post('/pagos', {
        referenciaTipo: 'PEDIDO',
        referenciaId: pedido.id,
        monto: Number(pedido.total),
        metodoPago: 'EFECTIVO',
      })
      await cambiarEstado(pedido.id, 'PAGADO')
      cargarPedidos()
      setMensaje({ type: 'success', text: `¡Pago de ${formatMoney(pedido.total)} confirmado para el pedido!` })
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'No se pudo confirmar el cobro') })
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
            <PackageCheck className="h-3.5 w-3.5" /> Listo p/ Recojo
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
            ✓ Entregado
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
            <Truck className="h-3.5 w-3.5" /> Enviar Motorizado
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
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Nro. Guía Olva/Shalom"
              value={seguimientos[pedido.id] || ''}
              onChange={(e) => setSeguimientos((prev) => ({ ...prev, [pedido.id]: e.target.value }))}
              className="w-28 rounded-xl border border-slate-300 bg-white px-2 py-1 text-xs font-semibold"
            />
            <button
              type="button"
              onClick={() => registrarSeguimiento(pedido.id)}
              className="inline-flex items-center gap-1 rounded-xl bg-purple-600 px-2.5 py-1 text-xs font-black text-white hover:bg-purple-700 shadow-sm transition-all"
            >
              <Send className="h-3 w-3" /> Guía
            </button>
          </div>
        )
      }
      if (pedido.estado === 'ENVIADO') {
        return <span className="text-xs font-extrabold text-purple-700">Guía: {pedido.numeroSeguimiento || '-'}</span>
      }
    }

    return <span className="text-xs font-semibold text-slate-400">Finalizado</span>
  }

  return (
    <LayoutAdmin>
      {/* Encabezado */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-red-600 uppercase tracking-wider mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Despacho & Envíos Tienda AlphaBike</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Gestión de Pedidos</h1>
          <p className="mt-0.5 text-xs text-slate-500 font-medium">
            Control de preparación, pagos vinculados por pasarela, entregas locales y seguimiento a provincias.
          </p>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por ID, cliente o dirección..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 shadow-sm focus:border-red-500"
          />
        </div>

        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm focus:border-red-500"
        >
          <option value="">Todos los Tipos de Entrega</option>
          <option value="RECOJO_TIENDA">Recojo en Tienda</option>
          <option value="DELIVERY_LIMA">Delivery Express Lima</option>
          <option value="ENVIO_PROVINCIA">Envío a Provincia (Agencias)</option>
        </select>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm focus:border-red-500"
        >
          <option value="">Todos los Estados de Pedido</option>
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
        <EmptyState title="No hay pedidos que mostrar" description="Prueba ajustando los filtros de búsqueda." />
      )}

      {!cargando && !error && pedidosFiltrados.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="hidden grid-cols-6 bg-slate-950 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-slate-300 lg:grid">
            <span>Pedido</span>
            <span>Cliente</span>
            <span>Total / Pago</span>
            <span>Tipo Entrega</span>
            <span>Estado Despacho</span>
            <span className="text-right">Acciones</span>
          </div>

          {pedidosFiltrados.map((pedido) => {
            const estado = LABELS_ESTADO[pedido.estado] || { texto: pedido.estado, color: 'bg-slate-100 text-slate-700' }
            const pagoAsociado = pagosMap[pedido.id]

            return (
              <div
                key={pedido.id}
                className="grid grid-cols-1 gap-2.5 border-t border-slate-100 px-6 py-4 text-xs first:border-t-0 lg:grid-cols-6 lg:items-center lg:gap-0 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <span className="font-black text-slate-950 block">#{pedido.id.slice(0, 8)}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {pedido.fechaCreacion ? new Date(pedido.fechaCreacion).toLocaleDateString('es-PE') : 'Reciente'}
                  </span>
                </div>

                <div>
                  <span className="font-black text-slate-900 block">{pedido.clienteNombre}</span>
                  <span className="text-[11px] text-slate-400 block truncate max-w-[150px]">
                    {pedido.direccionEntrega || 'Recojo local'}
                  </span>
                </div>

                <div>
                  <span className="font-black text-slate-950 text-sm block">{formatMoney(pedido.total)}</span>
                  {pagoAsociado ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-0.5">
                      <CreditCard className="h-3 w-3" />
                      {pagoAsociado.metodoPagoReal || pagoAsociado.metodoPago || 'PAGADO'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-0.5">
                      <Clock className="h-3 w-3" />
                      Por Cobrar
                    </span>
                  )}
                </div>

                <div>
                  <span className="font-bold text-slate-700">{LABELS_ENTREGA[pedido.tipoEntrega] || pedido.tipoEntrega}</span>
                </div>

                <div>
                  <span className={classNames('inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-wide', estado.color)}>
                    {estado.texto}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPedidoSeleccionado(pedido)}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-sm transition-all"
                    title="Ver detalles completos del pedido"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  {accionesPorTipo(pedido)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal: Detalle Completo del Pedido */}
      {pedidoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-red-600" />
                <h3 className="text-base font-black text-slate-900">
                  Pedido #{pedidoSeleccionado.id.slice(0, 8)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPedidoSeleccionado(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Cliente */}
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/60">
                <div className="flex items-center gap-1.5 font-black text-slate-800 mb-1 text-[11px] uppercase tracking-wider">
                  <User className="h-3.5 w-3.5 text-red-600" />
                  <span>Datos del Cliente</span>
                </div>
                <p className="font-extrabold text-slate-900">{pedidoSeleccionado.clienteNombre}</p>
                <p className="text-slate-500 font-semibold">{pedidoSeleccionado.clienteEmail || 'Sin email registrado'}</p>
              </div>

              {/* Entrega */}
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/60">
                <div className="flex items-center gap-1.5 font-black text-slate-800 mb-1 text-[11px] uppercase tracking-wider">
                  <MapPin className="h-3.5 w-3.5 text-red-600" />
                  <span>Información de Despacho</span>
                </div>
                <p className="font-bold text-slate-900">
                  Tipo: {LABELS_ENTREGA[pedidoSeleccionado.tipoEntrega] || pedidoSeleccionado.tipoEntrega}
                </p>
                {pedidoSeleccionado.direccionEntrega && (
                  <p className="text-slate-600 font-medium mt-0.5">
                    Dirección: {pedidoSeleccionado.direccionEntrega}
                  </p>
                )}
                {pedidoSeleccionado.numeroSeguimiento && (
                  <p className="text-purple-700 font-extrabold mt-1">
                    Código de Envío: {pedidoSeleccionado.numeroSeguimiento}
                  </p>
                )}
              </div>

              {/* Items del pedido */}
              {pedidoSeleccionado.detalles && pedidoSeleccionado.detalles.length > 0 && (
                <div>
                  <h4 className="font-black text-slate-900 mb-2">Productos Solicitados</h4>
                  <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {pedidoSeleccionado.detalles.map((d) => (
                      <div key={d.id} className="p-3 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-extrabold text-slate-900">{d.productoNombre}</p>
                          <p className="text-slate-400 text-[11px]">
                            {d.cantidad} unid. × {formatMoney(d.precioUnitario)}
                          </p>
                        </div>
                        <span className="font-black text-slate-950">{formatMoney(d.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resumen Total */}
              <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                <span className="text-sm font-black text-slate-900">Total del Pedido:</span>
                <span className="text-lg font-black text-red-600">{formatMoney(pedidoSeleccionado.total)}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              {!pagosMap[pedidoSeleccionado.id] && pedidoSeleccionado.estado === 'PENDIENTE' ? (
                <button
                  type="button"
                  onClick={() => {
                    confirmarCobroRapido(pedidoSeleccionado)
                    setPedidoSeleccionado(null)
                  }}
                  className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-black text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                >
                  Confirmar Cobro Manual
                </button>
              ) : (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  ✓ Transacción Verificada
                </span>
              )}

              <button
                type="button"
                onClick={() => setPedidoSeleccionado(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutAdmin>
  )
}

export default AdminPedidos
