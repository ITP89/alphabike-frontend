import { MailCheck, CheckCircle2, XCircle, ArrowRight, Loader2, Sparkles, Send, ShieldCheck } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../utils/apiError'
import alphaLogo from '../assets/alphabike-logo.png'
import heroImage from '../assets/hero-workshop.png'

function VerificarEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [estado, setEstado] = useState('procesando') // 'procesando' | 'exito' | 'error'
  const [mensaje, setMensaje] = useState('')
  const [emailReenvio, setEmailReenvio] = useState('')
  const [reenviando, setReenviando] = useState(false)
  const [reenvioExitoso, setReenvioExitoso] = useState(false)

  const { verificarEmail, reenviarVerificacion } = useAuth()

  useEffect(() => {
    let cancelado = false

    async function validar() {
      if (!token) {
        setEstado('error')
        setMensaje('No se proporcionó ningún token de activación en el enlace.')
        return
      }

      try {
        const respuesta = await verificarEmail(token)
        if (!cancelado) {
          setEstado('exito')
          setMensaje(respuesta.message || '¡Tu cuenta ha sido activada correctamente!')
          toast.success('Cuenta activada con éxito')
        }
      } catch (err) {
        if (!cancelado) {
          setEstado('error')
          setMensaje(getApiErrorMessage(err, 'El enlace de activación ha expirado o no es válido.'))
        }
      }
    }

    validar()

    return () => {
      cancelado = true
    }
  }, [token, verificarEmail])

  async function handleReenviar(e) {
    e.preventDefault()
    if (!emailReenvio.trim()) return

    setReenviando(true)
    try {
      await reenviarVerificacion(emailReenvio.trim())
      setReenvioExitoso(true)
      toast.success('Nuevo correo de activación enviado')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo reenviar el correo en este momento.'))
    } finally {
      setReenviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-950">
      <Navbar />

      <main className="grid min-h-[calc(100vh-68px)] grid-cols-1 lg:grid-cols-12">
        {/* Banner Lateral Izquierdo PRO */}
        <section className="brand-grid relative hidden overflow-hidden bg-zinc-950 p-12 lg:col-span-6 lg:flex lg:flex-col lg:justify-between">
          <img src={heroImage} alt="Taller AlphaBike" className="absolute inset-0 h-full w-full object-cover opacity-30 grayscale" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(220,38,38,0.25),transparent_28%),linear-gradient(0deg,#09090b,rgba(9,9,11,0.72))]" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-1.5 text-xs font-black text-red-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Verificación de Identidad Digital</span>
            </div>
          </div>

          <div className="relative z-10 max-w-lg">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Activación de Cuenta AlphaBike PRO
            </h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-zinc-300">
              Verificamos cada cuenta para garantizar la seguridad de tus pedidos, transacciones de repuestos y agendamientos en taller mecánico.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Plataforma oficial certificada AlphaBike</span>
          </div>
        </section>

        {/* Tarjeta Central Derecha */}
        <section className="flex items-center justify-center bg-zinc-50 px-6 py-12 lg:col-span-6">
          <div className="w-full max-w-md">
            <div className="brand-card border border-zinc-200/80 bg-white p-8 shadow-xl shadow-zinc-200/60 sm:p-10 rounded-2xl">
              <div className="mb-6 text-center">
                <img src={alphaLogo} alt="AlphaBike Workshop" className="mx-auto mb-4 h-16 w-16 rounded-lg border border-zinc-200 bg-white object-contain p-1" />
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-black text-red-800">
                  <MailCheck className="h-3.5 w-3.5" />
                  Confirmación de Correo
                </span>
                <h1 className="text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">Estado de Activación</h1>
              </div>

              {estado === 'procesando' && (
                <div className="py-8 text-center space-y-4">
                  <Loader2 className="mx-auto h-12 w-12 text-red-600 animate-spin" />
                  <p className="text-xs font-bold text-zinc-600">Verificando tu enlace de activación...</p>
                </div>
              )}

              {estado === 'exito' && (
                <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-6">
                    <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600 mb-3" />
                    <h2 className="text-base font-black text-emerald-950">¡Cuenta Activada con Éxito!</h2>
                    <p className="mt-2 text-xs font-medium text-emerald-800 leading-relaxed">
                      {mensaje || 'Tu dirección de correo ha sido validada. Ya tienes acceso completo a la tienda y taller de AlphaBike.'}
                    </p>
                  </div>

                  <Link
                    to="/login"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-5 py-3 text-xs font-black text-white shadow-md hover:bg-red-600 transition-colors"
                  >
                    Iniciar Sesión Ahora
                    <ArrowRight className="h-4 w-4 text-red-400" />
                  </Link>
                </div>
              )}

              {estado === 'error' && (
                <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="rounded-xl border border-red-200 bg-red-50/80 p-5 text-center">
                    <XCircle className="mx-auto h-12 w-12 text-red-600 mb-2" />
                    <h2 className="text-sm font-black text-red-950">Enlace No Válido o Expirado</h2>
                    <p className="mt-1.5 text-xs font-medium text-red-800 leading-relaxed">
                      {mensaje}
                    </p>
                  </div>

                  {/* Formulario para reenviar correo de activación */}
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <h3 className="text-xs font-black text-zinc-900 mb-1">¿Deseas recibir un nuevo enlace?</h3>
                    <p className="text-[11px] font-medium text-zinc-500 mb-3">
                      Ingresa tu correo y te enviaremos uno nuevo al instante.
                    </p>

                    {reenvioExitoso ? (
                      <p className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-2.5">
                        ✓ Enlace de activación reenviado. Revisa tu bandeja de entrada.
                      </p>
                    ) : (
                      <form onSubmit={handleReenviar} className="space-y-2">
                        <input
                          type="email"
                          placeholder="tu-correo@ejemplo.com"
                          value={emailReenvio}
                          onChange={(e) => setEmailReenvio(e.target.value)}
                          required
                          className="w-full rounded-lg border border-zinc-200 bg-white py-2 px-3 text-xs font-semibold text-zinc-900 placeholder-zinc-400 focus:border-red-500 focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={reenviando}
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-900 py-2.5 text-xs font-black text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          <Send className="h-3.5 w-3.5" />
                          {reenviando ? 'Reenviando...' : 'Reenviar Enlace de Activación'}
                        </button>
                      </form>
                    )}
                  </div>

                  <div className="pt-2 text-center">
                    <Link to="/login" className="text-xs font-bold text-red-600 hover:text-red-500">
                      ← Volver a Iniciar Sesión
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default VerificarEmail
