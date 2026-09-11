import { LogIn, Mail, Lock, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Navbar from '../components/Navbar'
import Alert from '../components/ui/Alert'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../utils/apiError'
import alphaLogo from '../assets/alphabike-logo.png'
import heroImage from '../assets/hero-workshop.png'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  function validate() {
    const nextErrors = {}
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    if (!emailValido) nextErrors.email = 'Ingresa un correo electrónico válido'
    if (password.length < 6) nextErrors.password = 'La contraseña debe tener al menos 6 caracteres'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!validate()) return

    setCargando(true)

    try {
      const datosUsuario = await login(email.trim(), password)
      toast.success(`¡Bienvenido de nuevo, ${datosUsuario.nombre || 'Usuario'}!`)

      if (datosUsuario.rol === 'ADMIN') {
        navigate('/admin/dashboard')
      } else if (datosUsuario.rol === 'ENCARGADO') {
        navigate('/encargado/dashboard')
      } else {
        navigate('/')
      }
    } catch (err) {
      const mensajeError = !err.response
        ? 'No se pudo conectar con el backend. Verifica la conexión con el servidor.'
        : getApiErrorMessage(err, 'Correo o contraseña incorrectos')

      setError(mensajeError)
      toast.error(mensajeError)
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
              <span>AlphaBike PRO Workshop & Store</span>
            </div>
          </div>

          <div className="relative z-10 max-w-lg">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Bienvenido de vuelta al taller especializado
            </h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-zinc-300">
              Gestiona compras de repuestos de alta gama, agendamiento de mantenimiento y seguimiento de órdenes en tiempo real.
            </p>

            <div className="mt-8 space-y-3 border-t border-zinc-800/80 pt-6">
              <div className="flex items-center gap-3 text-xs font-bold text-zinc-200">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-600/20 text-red-300">✓</div>
                <span>Atención prioritaria y diagnósticos avanzados de suspensión</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-zinc-200">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-600/20 text-red-300">✓</div>
                <span>Garantía oficial en repuestos Shimano, SRAM y componentes PRO</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-zinc-200">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-600/20 text-red-300">✓</div>
                <span>Historial digital completo del servicio mecánico de tu bicicleta</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Conexión cifrada y segura con tecnología Full Stack</span>
          </div>
        </section>

        {/* Formulario Derecho PRO */}
        <section className="flex items-center justify-center bg-zinc-50 px-6 py-12 lg:col-span-6">
          <div className="w-full max-w-md">
            <div className="brand-card border border-zinc-200/80 bg-white p-8 shadow-xl shadow-zinc-200/60 sm:p-10">
              <div className="mb-6">
                <img src={alphaLogo} alt="AlphaBike Workshop" className="mb-4 h-16 w-16 rounded-lg border border-zinc-200 bg-white object-contain p-1" />
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-black text-red-800">
                  <LogIn className="h-3.5 w-3.5" />
                  Acceso de Usuario
                </span>
                <h1 className="text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">Iniciar Sesión</h1>
                <p className="mt-1 text-xs font-semibold text-zinc-500">Ingresa tus credenciales para acceder a tu panel.</p>
              </div>

              {error && <Alert type="error" className="mb-5 font-bold shadow-sm">{error}</Alert>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-zinc-700">Correo Electrónico *</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setErrors((current) => ({ ...current, email: '' }))
                      }}
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-xs font-semibold text-zinc-900 placeholder-zinc-400 transition-all focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-[11px] font-bold text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-zinc-700">Contraseña *</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setErrors((current) => ({ ...current, password: '' }))
                      }}
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-xs font-semibold text-zinc-900 placeholder-zinc-400 transition-all focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>
                  {errors.password && <p className="mt-1 text-[11px] font-bold text-red-600">{errors.password}</p>}
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-5 py-3 text-xs font-black text-white shadow-md transition-all hover:bg-red-600 hover:text-white hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cargando ? 'Verificando datos...' : 'Ingresar a mi Cuenta'}
                  {!cargando && <ArrowRight className="h-4 w-4 text-red-400" />}
                </button>
              </form>

              <div className="mt-6 border-t border-zinc-100 pt-6 text-center">
                <p className="text-xs font-semibold text-zinc-500">
                  ¿Aún no formas parte de AlphaBike?{' '}
                  <Link to="/registro" className="font-extrabold text-red-600 hover:text-red-500 transition-colors">
                    Regístrate gratis aquí
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Login


