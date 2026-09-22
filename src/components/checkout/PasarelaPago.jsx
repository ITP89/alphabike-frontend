import { useState } from 'react'
import {
  CreditCard,
  QrCode,
  Building,
  Store,
  ShieldCheck,
  Lock,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import {
  GATEWAY_CONFIG,
  TARJETAS_PRUEBA,
  detectarFranquicia,
  validarDatosTarjeta,
} from '../../services/paymentGateway'
import { formatMoney } from '../../utils/formatters'

export default function PasarelaPago({
  total,
  tipoEntrega,
  metodoSeleccionado,
  onMetodoChange,
  datosPago,
  onDatosPagoChange,
  fieldErrors,
}) {
  const [copiado, setCopiado] = useState('')
  const [mostrarTarjetasPrueba, setMostrarTarjetasPrueba] = useState(false)

  const esRecojoTienda = tipoEntrega === 'RECOJO_TIENDA'

  function copiarTexto(texto, clave) {
    navigator.clipboard?.writeText(texto)
    setCopiado(clave)
    setTimeout(() => setCopiado(''), 2000)
  }

  // Formateador dinámico de número de tarjeta con espacios cada 4 dígitos
  function handleNumeroTarjeta(e) {
    let valor = e.target.value.replace(/\D/g, '').slice(0, 16)
    valor = valor.replace(/(\d{4})(?=\d)/g, '$1 ')
    onDatosPagoChange('tarjeta', { ...datosPago.tarjeta, numero: valor })
  }

  // Formateador dinámico de fecha MM/AA
  function handleExpiracion(e) {
    let valor = e.target.value.replace(/\D/g, '').slice(0, 4)
    if (valor.length >= 2) {
      valor = `${valor.slice(0, 2)}/${valor.slice(2)}`
    }
    onDatosPagoChange('tarjeta', { ...datosPago.tarjeta, expiracion: valor })
  }

  function aplicarTarjetaPrueba(tarjeta) {
    onDatosPagoChange('tarjeta', {
      numero: tarjeta.numero,
      titular: 'JUAN PÉREZ ALPHABIKE',
      expiracion: tarjeta.vence,
      cvv: tarjeta.cvv,
      documentoTipo: 'DNI',
      documentoNumero: '72819203',
    })
    setMostrarTarjetasPrueba(false)
  }

  const marcaTarjeta = detectarFranquicia((datosPago.tarjeta?.numero || '').replace(/\s+/g, ''))

  return (
    <div className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-1 border-b border-zinc-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600">
            <ShieldCheck className="h-4 w-4" />
            <span>Pasarela de Pago Segura AlphaBike</span>
          </div>
          <h2 className="text-lg font-black tracking-tight text-zinc-950 sm:text-xl">
            Método de Pago
          </h2>
          <p className="text-xs font-medium text-zinc-500">
            Selecciona tu forma de pago. Cifrado de extremo a extremo SSL 256-bit.
          </p>
        </div>

        <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 sm:mt-0">
          <Lock className="h-3 w-3 text-emerald-600" />
          <span>Sandbox Ready & API Plug-in</span>
        </div>
      </div>

      {/* Pestañas de Métodos de Pago */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => onMetodoChange('TARJETA')}
          className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-black transition-all ${
            metodoSeleccionado === 'TARJETA'
              ? 'border-red-600 bg-red-50/70 text-red-900 shadow-sm ring-1 ring-red-600'
              : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-100/60'
          }`}
        >
          <CreditCard className="h-5 w-5 text-red-600" />
          <span>Tarjeta Déb/Créd</span>
        </button>

        <button
          type="button"
          onClick={() => onMetodoChange('YAPE')}
          className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-black transition-all ${
            metodoSeleccionado === 'YAPE'
              ? 'border-purple-600 bg-purple-50/70 text-purple-900 shadow-sm ring-1 ring-purple-600'
              : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-100/60'
          }`}
        >
          <QrCode className="h-5 w-5 text-purple-600" />
          <span>Yape / Plin</span>
        </button>

        <button
          type="button"
          onClick={() => onMetodoChange('TRANSFERENCIA')}
          className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-black transition-all ${
            metodoSeleccionado === 'TRANSFERENCIA'
              ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm ring-1 ring-blue-600'
              : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-100/60'
          }`}
        >
          <Building className="h-5 w-5 text-blue-600" />
          <span>Transferencia BCP</span>
        </button>

        {esRecojoTienda ? (
          <button
            type="button"
            onClick={() => onMetodoChange('EFECTIVO')}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-black transition-all ${
              metodoSeleccionado === 'EFECTIVO'
                ? 'border-amber-600 bg-amber-50/70 text-amber-900 shadow-sm ring-1 ring-amber-600'
                : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-100/60'
            }`}
          >
            <Store className="h-5 w-5 text-amber-600" />
            <span>Pago en Tienda</span>
          </button>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-2 text-center text-[10px] text-zinc-400">
            <span>Solo para Recojo</span>
          </div>
        )}
      </div>

      {/* CONTENIDO DEL MÉTODO SELECCIONADO */}

      {/* 1. TARJETA DE CRÉDITO O DÉBITO */}
      {metodoSeleccionado === 'TARJETA' && (
        <div className="space-y-4 pt-2">
          {/* Tarjeta Visual Interactiva */}
          <div className="relative mx-auto max-w-sm overflow-hidden rounded-2xl bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-800 p-5 text-white shadow-xl">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-red-600/20 blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <span className="text-xs font-black tracking-widest text-red-400 uppercase">
                AlphaBike Secure Card
              </span>
              <div className="text-xs font-black uppercase text-zinc-300">
                {marcaTarjeta === 'visa' && <span className="text-blue-400 font-extrabold text-base">VISA</span>}
                {marcaTarjeta === 'mastercard' && <span className="text-amber-400 font-extrabold text-base">Mastercard</span>}
                {marcaTarjeta === 'amex' && <span className="text-teal-300 font-extrabold text-base">AMEX</span>}
                {marcaTarjeta === 'desconocida' && <span className="text-zinc-500">Crédito / Débito</span>}
              </div>
            </div>

            {/* Chip EMV Simulado */}
            <div className="my-3 flex h-8 w-11 items-center justify-center rounded-md bg-gradient-to-r from-amber-200 to-amber-400 p-1 shadow-inner">
              <div className="h-full w-full rounded border border-amber-600/40 opacity-70" />
            </div>

            <div className="my-2 font-mono text-lg font-black tracking-widest text-zinc-100 sm:text-xl">
              {datosPago.tarjeta?.numero || '•••• •••• •••• ••••'}
            </div>

            <div className="flex items-end justify-between pt-2 text-[11px] font-bold">
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-zinc-400">Titular</span>
                <span className="uppercase text-zinc-200 truncate max-w-[190px] block">
                  {datosPago.tarjeta?.titular || 'NOMBRE APELLIDO'}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-[9px] uppercase tracking-wider text-zinc-400">Vence</span>
                <span className="font-mono text-zinc-200">
                  {datosPago.tarjeta?.expiracion || 'MM/AA'}
                </span>
              </div>
            </div>
          </div>

          {/* Botón de acceso a tarjetas de prueba Sandbox */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setMostrarTarjetasPrueba(!mostrarTarjetasPrueba)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 underline"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {mostrarTarjetasPrueba ? 'Ocultar tarjetas demo' : 'Ver tarjetas de prueba de Sandbox'}
            </button>
          </div>

          {mostrarTarjetasPrueba && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs">
              <p className="font-black text-amber-900 mb-2">
                💳 Haz clic en cualquier tarjeta de prueba para rellenar los datos al instante:
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {TARJETAS_PRUEBA.map((t) => (
                  <button
                    key={t.numero}
                    type="button"
                    onClick={() => aplicarTarjetaPrueba(t)}
                    className="flex flex-col items-start rounded-lg border border-amber-200 bg-white p-2.5 text-left hover:border-amber-400 hover:bg-amber-100/40 transition-colors"
                  >
                    <span className="font-bold text-zinc-900">{t.tipo}</span>
                    <span className="font-mono text-xs text-zinc-600">{t.numero}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">Exp: {t.vence} | CVV: {t.cvv} - {t.resultado}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Formulario de Tarjeta */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-zinc-700">
                Número de Tarjeta *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="4000 1234 5678 9010"
                  value={datosPago.tarjeta?.numero || ''}
                  onChange={handleNumeroTarjeta}
                  maxLength={19}
                  className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm font-semibold tracking-wider text-zinc-900 focus:border-red-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600"
                />
                <CreditCard className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
              </div>
              {fieldErrors.numeroTarjeta && (
                <p className="mt-1 text-[11px] font-bold text-red-600">{fieldErrors.numeroTarjeta}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-zinc-700">
                Nombre y Apellido del Titular *
              </label>
              <input
                type="text"
                placeholder="JUAN PEREZ"
                value={datosPago.tarjeta?.titular || ''}
                onChange={(e) =>
                  onDatosPagoChange('tarjeta', {
                    ...datosPago.tarjeta,
                    titular: e.target.value.toUpperCase(),
                  })
                }
                className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm font-semibold uppercase text-zinc-900 focus:border-red-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600"
              />
              {fieldErrors.titularTarjeta && (
                <p className="mt-1 text-[11px] font-bold text-red-600">{fieldErrors.titularTarjeta}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-zinc-700">
                Fecha de Vencimiento *
              </label>
              <input
                type="text"
                placeholder="MM/AA"
                value={datosPago.tarjeta?.expiracion || ''}
                onChange={handleExpiracion}
                maxLength={5}
                className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-900 focus:border-red-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600 text-center"
              />
              {fieldErrors.expiracionTarjeta && (
                <p className="mt-1 text-[11px] font-bold text-red-600">{fieldErrors.expiracionTarjeta}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-zinc-700">
                Código de Seguridad (CVV) *
              </label>
              <input
                type="password"
                placeholder="123"
                value={datosPago.tarjeta?.cvv || ''}
                onChange={(e) =>
                  onDatosPagoChange('tarjeta', {
                    ...datosPago.tarjeta,
                    cvv: e.target.value.replace(/\D/g, '').slice(0, 4),
                  })
                }
                maxLength={4}
                className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-900 focus:border-red-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600 text-center"
              />
              {fieldErrors.cvvTarjeta && (
                <p className="mt-1 text-[11px] font-bold text-red-600">{fieldErrors.cvvTarjeta}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. BILLETERA DIGITAL (YAPE / PLIN) */}
      {metodoSeleccionado === 'YAPE' && (
        <div className="space-y-4 pt-1">
          <div className="flex flex-col items-center gap-4 rounded-xl border border-purple-200 bg-purple-50/50 p-5 text-center sm:flex-row sm:text-left">
            {/* Código QR Visual Dinámico */}
            <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-xl border-2 border-purple-300 bg-white p-2 shadow-sm">
              <svg viewBox="0 0 100 100" className="h-full w-full text-purple-950 fill-current">
                {/* Patrón estilizado de QR simulado para AlphaBike */}
                <rect width="100" height="100" fill="white" />
                <rect x="10" y="10" width="25" height="25" fill="#7e22ce" />
                <rect x="15" y="15" width="15" height="15" fill="white" />
                <rect x="19" y="19" width="7" height="7" fill="#7e22ce" />
                <rect x="65" y="10" width="25" height="25" fill="#7e22ce" />
                <rect x="70" y="15" width="15" height="15" fill="white" />
                <rect x="74" y="19" width="7" height="7" fill="#7e22ce" />
                <rect x="10" y="65" width="25" height="25" fill="#7e22ce" />
                <rect x="15" y="70" width="15" height="15" fill="white" />
                <rect x="19" y="74" width="7" height="7" fill="#7e22ce" />
                <rect x="42" y="15" width="6" height="6" fill="#7e22ce" />
                <rect x="42" y="30" width="6" height="6" fill="#7e22ce" />
                <rect x="52" y="22" width="6" height="6" fill="#7e22ce" />
                <rect x="45" y="45" width="10" height="10" fill="#dc2626" />
                <rect x="65" y="45" width="8" height="8" fill="#7e22ce" />
                <rect x="42" y="65" width="6" height="12" fill="#7e22ce" />
                <rect x="65" y="65" width="12" height="6" fill="#7e22ce" />
                <rect x="80" y="75" width="10" height="10" fill="#7e22ce" />
              </svg>
            </div>

            <div className="space-y-1.5">
              <span className="inline-block rounded-md bg-purple-600 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                Yape / Plin Oficial
              </span>
              <p className="text-sm font-black text-zinc-900">
                Escanea el código QR desde tu app móvil
              </p>
              <p className="text-xs text-zinc-600">
                O transfiere directamente al número registrado:
              </p>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-purple-900 tracking-wider">
                  {GATEWAY_CONFIG.comercio.telefono}
                </span>
                <button
                  type="button"
                  onClick={() => copiarTexto(GATEWAY_CONFIG.comercio.telefono, 'yape')}
                  className="rounded-md border border-purple-200 bg-white p-1 text-purple-700 hover:bg-purple-100"
                  title="Copiar número"
                >
                  {copiado === 'yape' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <p className="text-[11px] font-semibold text-zinc-500">
                Titular: <strong className="text-zinc-800">{GATEWAY_CONFIG.comercio.titularYape}</strong> | Monto: <strong className="text-purple-700">{formatMoney(total)}</strong>
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-zinc-700">
              Código / Número de Operación de Yape o Plin *
            </label>
            <input
              type="text"
              placeholder="Ej: 894512"
              value={datosPago.yape?.codigoOperacion || ''}
              onChange={(e) =>
                onDatosPagoChange('yape', {
                  ...datosPago.yape,
                  codigoOperacion: e.target.value.replace(/\D/g, '').slice(0, 10),
                })
              }
              className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-900 focus:border-purple-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-600"
            />
            <p className="mt-1 text-[11px] text-zinc-500">
              Ingresa los 6 u 8 dígitos que aparecen en el comprobante emitido por tu aplicación.
            </p>
            {fieldErrors.codigoOperacionYape && (
              <p className="mt-1 text-[11px] font-bold text-red-600">{fieldErrors.codigoOperacionYape}</p>
            )}
          </div>
        </div>
      )}

      {/* 3. TRANSFERENCIA BANCARIA */}
      {metodoSeleccionado === 'TRANSFERENCIA' && (
        <div className="space-y-4 pt-1">
          <p className="text-xs font-bold text-zinc-600">
            Realiza tu depósito a cualquiera de nuestras cuentas corrientes y registra el número de constancia:
          </p>

          <div className="space-y-2.5">
            {GATEWAY_CONFIG.comercio.bancos.map((b) => (
              <div
                key={b.banco}
                className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 text-xs"
              >
                <div className="flex items-center justify-between font-black text-zinc-900 mb-1">
                  <span>{b.banco}</span>
                  <span className="text-[10px] text-blue-700 uppercase">Cuenta Corriente Soles</span>
                </div>
                <div className="grid grid-cols-1 gap-1 text-zinc-700 sm:grid-cols-2">
                  <div className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-md border border-zinc-200">
                    <span className="text-[11px]">N°: <strong className="font-mono">{b.cuenta}</strong></span>
                    <button
                      type="button"
                      onClick={() => copiarTexto(b.cuenta, b.cuenta)}
                      className="text-zinc-500 hover:text-blue-600"
                      title="Copiar cuenta"
                    >
                      {copiado === b.cuenta ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-md border border-zinc-200">
                    <span className="text-[11px]">CCI: <strong className="font-mono">{b.cci}</strong></span>
                    <button
                      type="button"
                      onClick={() => copiarTexto(b.cci, b.cci)}
                      className="text-zinc-500 hover:text-blue-600"
                      title="Copiar CCI"
                    >
                      {copiado === b.cci ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-zinc-700">
              Número de Operación Bancaria *
            </label>
            <input
              type="text"
              placeholder="Ej: BCP-901842"
              value={datosPago.transferencia?.numeroOperacion || ''}
              onChange={(e) =>
                onDatosPagoChange('transferencia', {
                  ...datosPago.transferencia,
                  numeroOperacion: e.target.value.toUpperCase().slice(0, 16),
                })
              }
              className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 uppercase"
            />
            {fieldErrors.numeroOperacionTransferencia && (
              <p className="mt-1 text-[11px] font-bold text-red-600">
                {fieldErrors.numeroOperacionTransferencia}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 4. PAGO EN TIENDA */}
      {metodoSeleccionado === 'EFECTIVO' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs">
          <h3 className="font-black text-amber-950 flex items-center gap-2 mb-1">
            <Store className="h-4 w-4 text-amber-600" />
            Pago Presencial en el Taller
          </h3>
          <p className="text-amber-900 leading-relaxed">
            Podrás cancelar tu pedido en efectivo o con tarjeta física en nuestro taller al momento de retirar tus productos. Tu orden quedará reservada en almacén durante 48 horas.
          </p>
        </div>
      )}
    </div>
  )
}
