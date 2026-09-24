import { KeyRound, Mail, ArrowRight, ArrowLeft, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import Navbar from '../components/Navbar'
import Alert from '../components/ui/Alert'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../utils/apiError'
import alphaLogo from '../assets/alphabike-logo.png'
import heroImage from '../assets/hero-workshop.png'

function RecuperarPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [reintentos, setReintentos] = useState(0)

  const { solicitarRecuperacionPassword } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!emailValido) {
      setError('Por favor ingresa un correo electrónico válido')
      return
    }

    setCargando(true)

    try {
      await solicitarRecuperacionPassword(email.trim())
      setEnviado(true)
      setReintentos((prev) => prev + 1)
      toast.success('Instrucciones enviadas correctamente a tu correo')
    } catch (err) {
      const mensaje = getApiErrorMessage(err, 'No se pudo procesar la solicitud en este momento.')
      setError(mensaje)
      toast.error(mensaje)
    } finally {
      setCargando(false)
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
              <span>Seguridad de Cuentas AlphaBike</span>
            </div>
          </div>

          <div className="relative z-10 max-w-lg">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Recupera el acceso a tu cuenta fácilmente
            </h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-zinc-300">
              Protegemos tu historial de mantenimientos, órdenes de repuestos y cotizaciones con cifrado seguro y enlaces temporales de verificación.
            </p>

            <div className="mt-8 space-y-3 border-t border-zinc-800/80 pt-6">
              <div className="flex items-center gap-3 text-xs font-bold text-zinc-200">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-600/20 text-red-300">✓</div>
                <span>Enlaces de un solo uso con expiración en 30 minutos</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-zinc-200">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-600/20 text-red-300">✓</div>
                <span>Cifrado de credenciales bajo estándares criptográficos seguros</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Tus datos personales y compras permanecen 100% seguros</span>
          </div>
        </section>

        {/* Formulario Derecho PRO */}
        <section className="flex items-center justify-center bg-zinc-50 px-6 py-12 lg:col-span-6">
          <div className="w-full max-w-md">
            <div className="brand-card border border-zinc-200/80 bg-white p-8 shadow-xl shadow-zinc-200/60 sm:p-10 rounded-2xl">
              <div className="mb-6">
                <img src={alphaLogo} alt="AlphaBike Workshop" className="mb-4 h-16 w-16 rounded-lg border border-zinc-200 bg-white object-contain p-1" />
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-black text-red-800">
                  <KeyRound className="h-3.5 w-3.5" />
                  Recuperación de Contraseña
                </span>
                <h1 className="text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">¿Olvidaste tu contraseña?</h1>
                <p className="mt-1 text-xs font-semibold text-zinc-500">
                  Ingresa tu correo registrado y te enviaremos un enlace para que crees una nueva.
                </p>
              </div>

              {error && <Alert type="error" className="mb-5 font-bold shadow-sm">{error}</Alert>}

              {enviado ? (
                <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 text-center">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600 mb-2" />
                    <h3 className="text-sm font-extrabold text-emerald-950">¡Revisa tu bandeja de entrada!</h3>
                    <p className="mt-1.5 text-xs font-medium text-emerald-800 leading-relaxed">
                      Si el correo <strong className="font-black text-emerald-950">{email}</strong> se encuentra registrado, recibirás un enlace de un solo uso para restablecer tu contraseña.
                    </p>
                  </div>

                  <p className="text-center text-xs font-medium text-zinc-500">
                    ¿No recibiste el correo? Revisa tu carpeta de spam o promociones, o solicita un nuevo envío.
                  </p>

                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      disabled={cargando}
                      onClick={handleSubmit}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-xs font-bold text-zinc-800 shadow-sm transition-all hover:bg-zinc-100 disabled:opacity-50"
                    >
                      {cargando ? 'Reenviando...' : 'Reenviar enlace de recuperación'}
                    </button>

                    <Link
                      to="/login"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-5 py-2.5 text-xs font-black text-white shadow-md transition-all hover:bg-red-600"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Volver a Iniciar Sesión
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-zinc-700">Correo Electrónico Registrado *</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="email"
                        placeholder="tu-correo@ejemplo.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          setError('')
                        }}
                        required
                        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-xs font-semibold text-zinc-900 placeholder-zinc-400 transition-all focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={cargando}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-5 py-3 text-xs font-black text-white shadow-md transition-all hover:bg-red-600 hover:text-white hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {cargando ? 'Enviando enlace seguro...' : 'Enviar Enlace de Recuperación'}
                    {!cargando && <ArrowRight className="h-4 w-4 text-red-400" />}
                  </button>

                  <div className="mt-6 border-t border-zinc-100 pt-5 text-center">
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-red-600 transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Regresar al inicio de sesión
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default RecuperarPassword
