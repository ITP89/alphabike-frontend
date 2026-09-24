import { CheckCircle2, Printer, ArrowRight, ShieldCheck } from 'lucide-react'
import { formatMoney } from '../../utils/formatters'

export default function ComprobanteModal({ comprobante, onContinuar }) {
  if (!comprobante) return null

  function handleImprimir() {
    window.print()
  }

  const subtotalNeto = (comprobante.monto / 1.18).toFixed(2)
  const igv = (comprobante.monto - subtotalNeto).toFixed(2)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl sm:p-8 my-8 text-zinc-900">
        {/* Cabecera Éxito */}
        <div className="flex flex-col items-center text-center border-b border-zinc-100 pb-5">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mb-1">
            Pago Procesado Exitosamente
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950">
            ¡Gracias por tu compra!
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Comprobante Electrónico generado en tiempo real.
          </p>
        </div>

        {/* Voucher / Ticket de Compra */}
        <div className="my-5 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-4 font-mono text-xs text-zinc-800 space-y-2.5">
          <div className="flex justify-between border-b border-zinc-200 pb-2 text-[11px] font-bold">
            <span>ALPHABIKE TALLER & STORE S.A.C.</span>
            <span>RUC: 20608945123</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-zinc-500 block">ID Transacción:</span>
              <strong className="text-zinc-900">{comprobante.transaccionId}</strong>
            </div>
            <div className="text-right">
              <span className="text-zinc-500 block">Código Autorización:</span>
              <strong className="text-emerald-700">{comprobante.autorizacion}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-zinc-500 block">Método de Pago:</span>
              <strong className="text-zinc-900 uppercase">{comprobante.metodoPago}</strong>
            </div>
            <div className="text-right">
              <span className="text-zinc-500 block">Fecha y Hora:</span>
              <strong className="text-zinc-900">
                {new Date(comprobante.fecha).toLocaleString('es-PE')}
              </strong>
            </div>
          </div>

          {comprobante.detallesPago?.marca && (
            <div className="text-[11px] border-t border-zinc-200 pt-1.5 flex justify-between">
              <span className="text-zinc-500">Tarjeta:</span>
              <span className="font-bold">
                {comprobante.detallesPago.marca} terminada en •••• {comprobante.detallesPago.ultimos4}
              </span>
            </div>
          )}

          {comprobante.detallesPago?.codigoOperacion && (
            <div className="text-[11px] border-t border-zinc-200 pt-1.5 flex justify-between">
              <span className="text-zinc-500">Cód. Operación:</span>
              <span className="font-bold text-purple-700">
                {comprobante.detallesPago.codigoOperacion}
              </span>
            </div>
          )}

          {/* Desglose Fiscal */}
          <div className="border-t border-zinc-200 pt-2 space-y-1 text-[11px]">
            <div className="flex justify-between text-zinc-500">
              <span>Op. Gravada:</span>
              <span>S/ {subtotalNeto}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>I.G.V. (18%):</span>
              <span>S/ {igv}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-zinc-950 border-t border-zinc-300 pt-1">
              <span>TOTAL PAGADO:</span>
              <span className="text-emerald-700">{formatMoney(comprobante.monto)}</span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleImprimir}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-xs font-black text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 transition-all sm:w-auto"
          >
            <Printer className="h-4 w-4 text-zinc-500" />
            <span>Imprimir Ticket</span>
          </button>

          <button
            type="button"
            onClick={onContinuar}
            className="inline-flex w-full flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-black text-white hover:bg-red-600 transition-all shadow-md active:scale-95"
          >
            <span>Ver Detalle y Seguimiento</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-zinc-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Transacción verificada por AlphaBike Gateway Security</span>
        </div>
      </div>
    </div>
  )
}
