import { useRef, useState } from 'react'
import api from '../api/axios'
import PasarelaPago from './checkout/PasarelaPago'
import { procesarPago, validarDatosTarjeta } from '../services/paymentGateway'
import { getApiErrorMessage } from '../utils/apiError'
import { useRefreshCatalogo } from '../hooks/useRefreshCatalogo'

export default function RecuperarPedido({ pedido, config, onActualizar }) {
  const [metodo, setMetodo] = useState('TARJETA')
  const [datos, setDatos] = useState({ tarjeta: {}, yape: {}, transferencia: {} })
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const enCurso = useRef(false)
  const refreshCatalogo = useRefreshCatalogo()

  async function ejecutar(accion) {
    if (enCurso.current) return
    setError(''); setErrores({})
    if (accion === 'pagar') {
      if (metodo === 'TARJETA') {
        const validacion = validarDatosTarjeta(datos.tarjeta)
        if (!validacion.valido) { setErrores({ numeroTarjeta: validacion.errors.numero, titularTarjeta: validacion.errors.titular, expiracionTarjeta: validacion.errors.expiracion, cvvTarjeta: validacion.errors.cvv }); setError('Revisa los datos de la tarjeta de prueba.'); return }
      } else if (['YAPE', 'PLIN'].includes(metodo) && !/^9\d{8}$/.test(datos.yape.telefono || '')) {
        setError('Ingresa un teléfono de nueve dígitos que empiece con 9.'); return
      } else if (metodo === 'TRANSFERENCIA' && !(datos.transferencia.numeroOperacion || '').trim()) {
        setError('Ingresa el número de operación de prueba.'); return
      }
    }
    if (accion === 'cancelar' && !window.confirm('¿Cancelar este pedido pendiente y liberar sus productos?')) return
    enCurso.current = true; setOcupado(true)
    try {
      if (accion === 'cancelar') await api.patch(`/pedidos/${pedido.id}/cancelar`)
      else await procesarPago({ metodo, monto: pedido.total, pedidoId: pedido.id,
        datosTarjeta: datos.tarjeta, datosYape: datos.yape, datosTransferencia: datos.transferencia })
      await refreshCatalogo()
      await onActualizar()
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo completar la operación. Comprueba el estado antes de reintentar.'))
      await onActualizar()
    } finally { enCurso.current = false; setOcupado(false) }
  }

  if (pedido.estado !== 'PENDIENTE') return null
  return <section className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-4">
    <h2 className="text-lg font-semibold text-slate-950">Pedido pendiente de pago</h2>
    {config && !config.enabled && <>
      <p className="text-sm text-slate-600">Puedes retomar el pago de prueba sin crear otro pedido. No se cobra dinero real.</p>
      <fieldset disabled={ocupado} className="min-w-0">
        <PasarelaPago total={pedido.total} tipoEntrega={pedido.tipoEntrega} metodoSeleccionado={metodo}
          onMetodoChange={setMetodo} datosPago={datos}
          onDatosPagoChange={(seccion, valor) => setDatos(prev => ({ ...prev, [seccion]: valor }))} fieldErrors={errores} />
      </fieldset>
      <button type="button" disabled={ocupado} onClick={() => ejecutar('pagar')} className="alpha-btn-primary">
        {ocupado ? 'Procesando…' : 'Completar pago de prueba'}
      </button>
    </>}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <button type="button" disabled={ocupado} onClick={() => ejecutar('cancelar')} className="alpha-btn-soft">
      Cancelar pedido pendiente
    </button>
    {config?.enabled && <p className="text-sm text-slate-600">Si Mercado Pago ya está procesando el pago, comprueba su estado antes de cancelar. El sistema impedirá liberar productos mientras la operación siga asociada al proveedor.</p>}
  </section>
}
