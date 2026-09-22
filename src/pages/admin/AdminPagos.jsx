import { useState, useEffect, useMemo } from 'react'
import {
  CreditCard,
  Sparkles,
  Receipt,
  CheckCircle2,
  Search,
  Filter,
  Download,
  Plus,
  X,
  Eye,
  Printer,
  ShieldCheck,
  QrCode,
  Building,
  Store,
} from 'lucide-react'
import api from '../../api/axios'
import LayoutAdmin from '../../components/LayoutAdmin'
import Alert from '../../components/ui/Alert'
import { ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { getApiErrorMessage } from '../../utils/apiError'
import { formatMoney } from '../../utils/formatters'

const LABELS_TIPO = {
  PEDIDO: 'Pedido de Tienda',
  COTIZACION: 'Servicio de Taller',
}

const LABELS_METODO = {
  TARJETA: 'Tarjeta Crédito/Débito',
  EFECTIVO: 'Efectivo en Tienda',
  YAPE: 'Yape Móvil',
  PLIN: 'Plin Móvil',
  TRANSFERENCIA: 'Transferencia Bancaria',
}

function AdminPagos() {
  const [pagos, setPagos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState(null)

  // Filtros y Búsqueda
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroMetodo, setFiltroMetodo] = useState('todos')

  // Modales
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false)
  const [pagoDetalle, setPagoDetalle] = useState(null)

  // Formulario de Cobro Manual
  const [formCobro, setFormCobro] = useState({
    referenciaTipo: 'PEDIDO',
    referenciaId: '',
    monto: '',
    metodoPago: 'EFECTIVO',
  })
  const [guardandoCobro, setGuardandoCobro] = useState(false)

  // Cargar pagos del backend combinados con almacenamiento de comprobantes
  async function cargarPagos() {
    setCargando(true)
    setError('')
    try {
      const response = await api.get('/pagos')
      const pagosBackend = response.data.data || []

      // Obtener comprobantes locales de la pasarela sandbox para enriquecer detalles de tarjeta
      let comprobantesLocales = {}
      try {
        comprobantesLocales = JSON.parse(localStorage.getItem('alphabike_comprobantes') || '{}')
      } catch {
        comprobantesLocales = {}
      }

      // Enriquecer pagos con metadatos de comprobantes si existen
      const pagosEnriquecidos = pagosBackend.map((pago) => {
        const comp = comprobantesLocales[pago.referenciaId]
        if (comp) {
          return {
            ...pago,
            metodoPagoReal: comp.metodoPago || pago.metodoPago,
            autorizacion: comp.autorizacion,
            transaccionId: comp.transaccionId,
            detallesPago: comp.detallesPago,
            clienteNombre: comp.cliente?.nombre,
            clienteEmail: comp.cliente?.email,
          }
        }
        return {
          ...pago,
          metodoPagoReal: pago.metodoPago,
        }
      })

      // Si hay comprobantes locales que aún no figuren en backend (por ejemplo si fueron creados por cliente),
      // los mostramos en la auditoría con estado LOCAL_VERIFICADO
      const idsBackend = new Set(pagosBackend.map((p) => p.referenciaId))
      Object.entries(comprobantesLocales).forEach(([refId, comp]) => {
        if (!idsBackend.has(refId)) {
          pagosEnriquecidos.unshift({
            id: comp.transaccionId || `local-${refId}`,
            referenciaId: refId,
            referenciaTipo: 'PEDIDO',
            monto: comp.monto,
            metodoPago: comp.metodoPago === 'TARJETA' ? 'TRANSFERENCIA' : comp.metodoPago,
            metodoPagoReal: comp.metodoPago,
            estado: 'PAGADO',
            fecha: comp.fecha,
            autorizacion: comp.autorizacion,
            transaccionId: comp.transaccionId,
            detallesPago: comp.detallesPago,
            clienteNombre: comp.cliente?.nombre,
            clienteEmail: comp.cliente?.email,
          })
        }
      })

      setPagos(pagosEnriquecidos)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron cargar los pagos'))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarPagos()
  }, [])

  // Filtrado reactivo
  const pagosFiltrados = useMemo(() => {
    return pagos.filter((p) => {
      const matchTipo = filtroTipo === 'todos' ? true : p.referenciaTipo === filtroTipo
      const metodoReal = p.metodoPagoReal || p.metodoPago
      const matchMetodo = filtroMetodo === 'todos' ? true : metodoReal === filtroMetodo

      const q = busqueda.toLowerCase().trim()
      const matchTexto =
        !q ||
        p.referenciaId?.toLowerCase().includes(q) ||
        p.autorizacion?.toLowerCase().includes(q) ||
        p.transaccionId?.toLowerCase().includes(q) ||
        p.clienteNombre?.toLowerCase().includes(q) ||
        p.metodoPagoReal?.toLowerCase().includes(q)

      return matchTipo && matchMetodo && matchTexto
    })
  }, [pagos, filtroTipo, filtroMetodo, busqueda])

  // Métricas financieras calculadas
  const metricas = useMemo(() => {
    let total = 0
    let tarjeta = 0
    let yapePlin = 0
    let transferencia = 0
    let efectivo = 0

    pagos.forEach((p) => {
      const m = Number(p.monto) || 0
      const metodo = p.metodoPagoReal || p.metodoPago
      total += m
      if (metodo === 'TARJETA') tarjeta += m
      else if (metodo === 'YAPE' || metodo === 'PLIN') yapePlin += m
      else if (metodo === 'TRANSFERENCIA') transferencia += m
      else efectivo += m
    })

    return { total, tarjeta, yapePlin, transferencia, efectivo, cantidad: pagos.length }
  }, [pagos])

  // Registro manual de cobro (para mostrador o transferencia validada)
  async function handleRegistrarCobroManual(e) {
    e.preventDefault()
    if (!formCobro.referenciaId.trim() || !formCobro.monto || Number(formCobro.monto) <= 0) {
      setMensaje({ type: 'error', text: 'Ingresa un ID de referencia y un monto válido.' })
      return
    }

    setGuardandoCobro(true)
    setMensaje(null)
    try {
      await api.post('/pagos', {
        referenciaTipo: formCobro.referenciaTipo,
        referenciaId: formCobro.referenciaId.trim(),
        monto: Number(formCobro.monto),
        metodoPago: formCobro.metodoPago,
      })

      setMensaje({ type: 'success', text: '¡Cobro registrado exitosamente en el sistema!' })
      setModalRegistroAbierto(false)
      setFormCobro({
        referenciaTipo: 'PEDIDO',
        referenciaId: '',
        monto: '',
        metodoPago: 'EFECTIVO',
      })
      cargarPagos()
    } catch (err) {
      setMensaje({ type: 'error', text: getApiErrorMessage(err, 'Error al registrar el cobro') })
    } finally {
      setGuardandoCobro(false)
    }
  }

  // Exportar reporte a formato CSV para contabilidad
  function exportarCSV() {
    if (pagosFiltrados.length === 0) return

    const encabezados = ['ID_Transaccion', 'Referencia_Tipo', 'Referencia_ID', 'Metodo_Pago', 'Monto_Soles', 'Autorizacion', 'Fecha', 'Cliente']
    const filas = pagosFiltrados.map((p) => [
      `"${p.transaccionId || p.id}"`,
      `"${p.referenciaTipo}"`,
      `"${p.referenciaId}"`,
      `"${p.metodoPagoReal || p.metodoPago}"`,
      Number(p.monto).toFixed(2),
      `"${p.autorizacion || '-'}"`,
      `"${new Date(p.fecha).toISOString()}"`,
      `"${p.clienteNombre || 'Cliente'}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [encabezados.join(','), ...filas.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `reporte_pagos_alphabike_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <LayoutAdmin>
      {/* Encabezado Principal */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-red-600 mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Tesorería & Pasarela de Pagos AlphaBike</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Gestión Financiera de Pagos</h1>
          <p className="mt-0.5 text-xs text-slate-500 font-medium">
            Control de cobros en tiempo real vía Tarjetas (Sandbox/Culqi/MP), Yape, Plin, Transferencias y Caja Presencial.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={exportarCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-black text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setModalRegistroAbierto(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white hover:bg-red-700 shadow-md shadow-red-600/20 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Registrar Cobro Manual</span>
          </button>
        </div>
      </div>

      {mensaje && (
        <Alert type={mensaje.type} className="mb-5 shadow-sm font-bold">
          {mensaje.text}
        </Alert>
      )}

      {/* Tarjetas de Métricas Financieras */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Recaudado</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-950">{formatMoney(metricas.total)}</p>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1">
            {metricas.cantidad} operaciones confirmadas
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Pasarela Tarjetas</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-950">{formatMoney(metricas.tarjeta)}</p>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-1">
            Visa / Mastercard / Amex
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Billeteras Móviles</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
              <QrCode className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-950">{formatMoney(metricas.yapePlin)}</p>
          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md inline-block mt-1">
            Yape QR / Plin
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Bancos & Efectivo</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <Building className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-950">{formatMoney(metricas.transferencia + metricas.efectivo)}</p>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block mt-1">
            BCP / BBVA / Presencial
          </span>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-2">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por ID, Nro. Transacción, Código o Cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
        </div>

        <div>
          <select
            value={filtroMetodo}
            onChange={(e) => setFiltroMetodo(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm focus:border-red-500"
          >
            <option value="todos">Todos los Métodos de Pago</option>
            <option value="TARJETA">Tarjeta (Crédito/Débito)</option>
            <option value="YAPE">Yape Móvil</option>
            <option value="PLIN">Plin Móvil</option>
            <option value="TRANSFERENCIA">Transferencia Bancaria</option>
            <option value="EFECTIVO">Efectivo en Tienda</option>
          </select>
        </div>

        <div>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm focus:border-red-500"
          >
            <option value="todos">Todos los Orígenes</option>
            <option value="PEDIDO">Pedidos de Tienda</option>
            <option value="COTIZACION">Servicios de Taller</option>
          </select>
        </div>
      </div>

      {/* Tabla de Pagos */}
      {cargando ? (
        <LoadingState text="Cargando transacciones financieras..." />
      ) : error ? (
        <ErrorState message={error} onRetry={cargarPagos} />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="hidden grid-cols-6 bg-slate-950 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-slate-300 lg:grid">
            <span>Referencia / TRX</span>
            <span>Tipo Origen</span>
            <span>Monto Cobrado</span>
            <span>Método Pasarela</span>
            <span>Fecha / Registro</span>
            <span className="text-right">Auditoría</span>
          </div>

          {pagosFiltrados.length === 0 && (
            <div className="p-8 text-center">
              <Receipt className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-500">No se encontraron pagos con los filtros seleccionados.</p>
            </div>
          )}

          {pagosFiltrados.map((pago) => {
            const metodoReal = pago.metodoPagoReal || pago.metodoPago

            let badgeMetodoClass = 'bg-slate-100 text-slate-700 border-slate-200'
            let IconoMetodo = CreditCard

            if (metodoReal === 'TARJETA') {
              badgeMetodoClass = 'bg-blue-50 text-blue-700 border-blue-200'
              IconoMetodo = CreditCard
            } else if (metodoReal === 'YAPE' || metodoReal === 'PLIN') {
              badgeMetodoClass = 'bg-purple-50 text-purple-700 border-purple-200'
              IconoMetodo = QrCode
            } else if (metodoReal === 'TRANSFERENCIA') {
              badgeMetodoClass = 'bg-emerald-50 text-emerald-700 border-emerald-200'
              IconoMetodo = Building
            } else {
              badgeMetodoClass = 'bg-amber-50 text-amber-700 border-amber-200'
              IconoMetodo = Store
            }

            return (
              <div
                key={pago.id || pago.transaccionId}
                className="grid grid-cols-1 gap-2.5 border-t border-slate-100 px-6 py-4 text-xs first:border-t-0 lg:grid-cols-6 lg:items-center lg:gap-0 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-950">#{pago.referenciaId.slice(0, 8)}</span>
                    {pago.autorizacion && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {pago.autorizacion}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    {pago.transaccionId || `OP-${pago.id.slice(0, 8)}`}
                  </span>
                </div>

                <div>
                  <span className="font-extrabold text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                    {LABELS_TIPO[pago.referenciaTipo] || pago.referenciaTipo}
                  </span>
                </div>

                <div>
                  <span className="font-black text-slate-950 text-sm tracking-tight">{formatMoney(pago.monto)}</span>
                  <span className="block text-[10px] text-emerald-600 font-bold">Estado: Pagado</span>
                </div>

                <div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-black ${badgeMetodoClass}`}
                  >
                    <IconoMetodo className="h-3 w-3" />
                    {LABELS_METODO[metodoReal] || metodoReal}
                  </span>
                  {pago.detallesPago?.ultimos4 && (
                    <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">
                      {pago.detallesPago.marca} •••• {pago.detallesPago.ultimos4}
                    </span>
                  )}
                </div>

                <div>
                  <span className="font-semibold text-slate-600 block">
                    {new Date(pago.fecha).toLocaleDateString('es-PE')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(pago.fecha).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setPagoDetalle(pago)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-700 hover:bg-slate-100 shadow-sm transition-all"
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-500" />
                    <span>Ver Voucher</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal: Registrar Cobro Manual */}
      {modalRegistroAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <CreditCard className="h-4 w-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">Registrar Cobro Manual</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalRegistroAbierto(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegistrarCobroManual} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Origen</label>
                <select
                  value={formCobro.referenciaTipo}
                  onChange={(e) => setFormCobro({ ...formCobro, referenciaTipo: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-800 focus:border-red-500"
                >
                  <option value="PEDIDO">Pedido de Tienda</option>
                  <option value="COTIZACION">Servicio de Taller / Cotización</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ID de Referencia (UUID del Pedido o Cotización)
                </label>
                <input
                  type="text"
                  placeholder="Ej. c2807f43-85b9-..."
                  value={formCobro.referenciaId}
                  onChange={(e) => setFormCobro({ ...formCobro, referenciaId: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-800 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Monto en Soles (S/)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.10"
                  placeholder="0.00"
                  value={formCobro.monto}
                  onChange={(e) => setFormCobro({ ...formCobro, monto: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-800 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Método de Cobro Empleado</label>
                <select
                  value={formCobro.metodoPago}
                  onChange={(e) => setFormCobro({ ...formCobro, metodoPago: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-800 focus:border-red-500"
                >
                  <option value="EFECTIVO">Efectivo en Caja Mostrador</option>
                  <option value="YAPE">Yape Móvil QR</option>
                  <option value="PLIN">Plin Móvil</option>
                  <option value="TRANSFERENCIA">Transferencia Bancaria (BCP/BBVA)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalRegistroAbierto(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoCobro}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white hover:bg-red-700 shadow-md shadow-red-600/20 disabled:opacity-50"
                >
                  {guardandoCobro ? 'Guardando...' : 'Confirmar Cobro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Auditoría de Voucher / Comprobante */}
      {pagoDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-red-600" />
                <h3 className="text-base font-black text-slate-900">Auditoría de Comprobante</h3>
              </div>
              <button
                type="button"
                onClick={() => setPagoDetalle(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 font-mono text-xs space-y-2 text-slate-800">
              <div className="flex justify-between border-b border-slate-200 pb-1.5 text-[11px] font-bold">
                <span>ALPHABIKE TALLER & STORE</span>
                <span>RUC: 20608945123</span>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <span className="text-slate-500">ID Operación:</span>
                <span className="font-bold text-right text-slate-950">
                  {pagoDetalle.transaccionId || `#${pagoDetalle.id.slice(0, 10)}`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <span className="text-slate-500">Código Autorización:</span>
                <span className="font-bold text-right text-emerald-700">
                  {pagoDetalle.autorizacion || `AUT-${pagoDetalle.id.slice(0, 6).toUpperCase()}`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <span className="text-slate-500">Referencia Origen:</span>
                <span className="font-bold text-right text-slate-900">
                  {pagoDetalle.referenciaTipo} #{pagoDetalle.referenciaId.slice(0, 8)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <span className="text-slate-500">Método de Pago:</span>
                <span className="font-bold text-right uppercase text-slate-900">
                  {pagoDetalle.metodoPagoReal || pagoDetalle.metodoPago}
                </span>
              </div>

              {pagoDetalle.detallesPago?.marca && (
                <div className="grid grid-cols-2 gap-1 text-[11px] border-t border-slate-200 pt-1">
                  <span className="text-slate-500">Tarjeta Emisora:</span>
                  <span className="font-bold text-right text-blue-700">
                    {pagoDetalle.detallesPago.marca} •••• {pagoDetalle.detallesPago.ultimos4}
                  </span>
                </div>
              )}

              {pagoDetalle.detallesPago?.codigoOperacion && (
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <span className="text-slate-500">Cód. Banco/Billetera:</span>
                  <span className="font-bold text-right text-purple-700">
                    {pagoDetalle.detallesPago.codigoOperacion}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <span className="text-slate-500">Fecha y Hora:</span>
                <span className="font-bold text-right text-slate-900">
                  {new Date(pagoDetalle.fecha).toLocaleString('es-PE')}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-2 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal Neto:</span>
                  <span>{formatMoney(Number(pagoDetalle.monto) / 1.18)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">I.G.V. (18%):</span>
                  <span>{formatMoney(Number(pagoDetalle.monto) - Number(pagoDetalle.monto) / 1.18)}</span>
                </div>
                <div className="flex justify-between text-xs font-black text-slate-950 border-t border-slate-300 pt-1">
                  <span>TOTAL COBRADO:</span>
                  <span className="text-emerald-700">{formatMoney(pagoDetalle.monto)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimir Ticket</span>
              </button>
              <button
                type="button"
                onClick={() => setPagoDetalle(null)}
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

export default AdminPagos
