import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Navbar from '../components/Navbar'
import Alert from '../components/ui/Alert'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../utils/apiError'
import alphaLogo from '../assets/alphabike-logo.png'
import heroImage from '../assets/hero-workshop.png'

function RestablecerPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()

  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [exito, setExito] = useState(false)

  const { restablecerPassword } = useAuth()

  // Validación de seguridad
  const longitudOk = nuevaPassword.length >= 6
  const tieneNumero = /\d/.test(nuevaPassword)
  const coinciden = nuevaPassword && nuevaPassword === confirmarPassword

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('El enlace no contiene un token válido de recuperación.')
      return
    }

    if (!longitudOk) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (!coinciden) {
      setError('Las contraseñas no coinciden')
      return
    }

    setCargando(true)

    try {
      await restablecerPassword(token, nuevaPassword)
      setExito(true)
      toast.success('¡Contraseña restablecida con éxito!')
    } catch (err) {
      const mensaje = getApiErrorMessage(err, 'El enlace ha expirado o no es válido. Solicita un nuevo enlace.')
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
              <span>AlphaBike Seguridad & Acceso</span>
            </div>
          </div>

          <div className="relative z-10 max-w-lg">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Crea tu nueva contraseña segura
            </h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-zinc-300">
              Una vez actualizada tu contraseña, tu cuenta quedará inmediatamente desbloqueada para agendamientos y compras en línea.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Encriptación con algoritmo criptográfico BCrypt</span>
          </div>
        </section>

        {/* Formulario Derecho PRO */}
        <section className="flex items-center justify-center bg-zinc-50 px-6 py-12 lg:col-span-6">
          <div className="w-full max-w-md">
            <div className="brand-card border border-zinc-200/80 bg-white p-8 shadow-xl shadow-zinc-200/60 sm:p-10 rounded-2xl">
              <div className="mb-6">
                <img src={alphaLogo} alt="AlphaBike Workshop" className="mb-4 h-16 w-16 rounded-lg border border-zinc-200 bg-white object-contain p-1" />
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-black text-red-800">
                  <Lock className="h-3.5 w-3.5" />
                  Nueva Contraseña
                </span>
                <h1 className="text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">Restablecer Contraseña</h1>
                <p className="mt-1 text-xs font-semibold text-zinc-500">
                  Ingresa tu nueva clave de acceso para tu cuenta de AlphaBike.
                </p>
              </div>

              {!token ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold text-amber-900 flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Enlace inválido o incompleto. Asegúrate de abrir el enlace exactamente como llegó a tu correo.</span>
                  </div>
                  <Link
                    to="/recuperar-password"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-5 py-3 text-xs font-black text-white hover:bg-red-600 transition-colors"
                  >
                    Solicitar un nuevo enlace
                  </Link>
                </div>
              ) : exito ? (
                <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 text-center">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 mb-2" />
                    <h3 className="text-sm font-extrabold text-emerald-950">¡Contraseña Actualizada!</h3>
                    <p className="mt-1 text-xs font-medium text-emerald-800">
                      Tu contraseña ha sido modificada con éxito. Ya puedes iniciar sesión con tus nuevas credenciales.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-5 py-3 text-xs font-black text-white shadow-md hover:bg-red-600 transition-colors"
                  >
                    Iniciar Sesión Ahora
                    <ArrowRight className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && <Alert type="error" className="mb-4 font-bold shadow-sm">{error}</Alert>}

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-zinc-700">Nueva Contraseña *</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <input
                        type={mostrarPassword ? 'text' : 'password'}
                        placeholder="Mínimo 6 caracteres"
                        value={nuevaPassword}
                        onChange={(e) => {
                          setNuevaPassword(e.target.value)
                          setError('')
                        }}
                        required
                        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-10 text-xs font-semibold text-zinc-900 placeholder-zinc-400 transition-all focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarPassword(!mostrarPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                      >
                        {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-zinc-700">Confirmar Nueva Contraseña *</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <input
                        type={mostrarPassword ? 'text' : 'password'}
                        placeholder="Repite la nueva contraseña"
                        value={confirmarPassword}
                        onChange={(e) => {
                          setConfirmarPassword(e.target.value)
                          setError('')
                        }}
                        required
                        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-xs font-semibold text-zinc-900 placeholder-zinc-400 transition-all focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      />
                    </div>
                  </div>

                  {/* Indicadores de fortaleza de contraseña */}
                  <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-[11px] space-y-1.5 font-semibold text-zinc-600">
                    <div className="flex items-center gap-2">
                      <span className={longitudOk ? 'text-emerald-600 font-bold' : 'text-zinc-400'}>
                        {longitudOk ? '✓' : '○'} Mínimo 6 caracteres
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={tieneNumero ? 'text-emerald-600 font-bold' : 'text-zinc-400'}>
                        {tieneNumero ? '✓' : '○'} Contiene al menos un número
                      </span>
                    </div>
                    {confirmarPassword && (
                      <div className="flex items-center gap-2">
                        <span className={coinciden ? 'text-emerald-600 font-bold' : 'text-red-500'}>
                          {coinciden ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={cargando || !longitudOk || !coinciden}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-5 py-3 text-xs font-black text-white shadow-md transition-all hover:bg-red-600 hover:text-white hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {cargando ? 'Guardando nueva contraseña...' : 'Actualizar y Guardar Contraseña'}
                    {!cargando && <ArrowRight className="h-4 w-4 text-red-400" />}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default RestablecerPassword
