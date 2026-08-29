import { LogIn, Mail, Lock, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Alert from '../components/ui/Alert'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../utils/apiError'
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

      if (datosUsuario.rol === 'ADMIN') {
        navigate('/admin/dashboard')
      } else if (datosUsuario.rol === 'ENCARGADO') {
        navigate('/encargado/dashboard')
      } else {
        navigate('/')
      }
    } catch (err) {
      if (!err.response) {
        setError('No se pudo conectar con el backend. Verifica la conexión con el servidor.')
      } else {
        setError(getApiErrorMessage(err, 'Correo o contraseña incorrectos'))
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="grid min-h-[calc(100vh-68px)] grid-cols-1 lg:grid-cols-12">
        {/* Banner Lateral Izquierdo PRO */}
        <section className="relative hidden overflow-hidden bg-slate-950 lg:col-span-6 lg:flex lg:flex-col lg:justify-between p-12">
          <img src={heroImage} alt="Taller AlphaBike" className="absolute inset-0 h-full w-full object-cover opacity-35 filter brightness-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-black text-amber-400 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AlphaBike PRO Workshop & Store</span>
            </div>
          </div>

          <div className="relative z-10 max-w-lg">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Bienvenido de vuelta al taller especializado
            </h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-slate-300">
              Gestiona compras de repuestos de alta gama, agendamiento de mantenimiento y seguimiento de órdenes en tiempo real.
            </p>

            <div className="mt-8 space-y-3 pt-6 border-t border-slate-800/80">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-200">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">✓</div>
                <span>Atención prioritaria y diagnósticos avanzados de suspensión</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-200">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">✓</div>
                <span>Garantía oficial en repuestos Shimano, SRAM y componentes PRO</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-200">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">✓</div>
                <span>Historial digital completo del servicio mecánico de tu bicicleta</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs font-semibold text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Conexión cifrada y segura con tecnología Full Stack</span>
          </div>
        </section>

        {/* Formulario Derecho PRO */}
        <section className="flex items-center justify-center px-6 py-12 lg:col-span-6 bg-slate-50">
          <div className="w-full max-w-md">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/60">
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black text-amber-800 mb-3">
                  <LogIn className="h-3.5 w-3.5" />
                  Acceso de Usuario
                </span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Iniciar Sesión</h1>
                <p className="mt-1 text-xs font-semibold text-slate-500">Ingresa tus credenciales para acceder a tu panel.</p>
              </div>

              {error && <Alert type="error" className="mb-5 font-bold shadow-sm">{error}</Alert>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Correo Electrónico *</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setErrors((current) => ({ ...current, email: '' }))
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-[11px] font-bold text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Contraseña *</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setErrors((current) => ({ ...current, password: '' }))
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                  {errors.password && <p className="mt-1 text-[11px] font-bold text-red-600">{errors.password}</p>}
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-xs font-black text-white hover:bg-amber-500 hover:text-slate-950 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cargando ? 'Verificando datos...' : 'Ingresar a mi Cuenta'}
                  {!cargando && <ArrowRight className="h-4 w-4 text-amber-400" />}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs font-semibold text-slate-500">
                  ¿Aún no formas parte de AlphaBike?{' '}
                  <Link to="/registro" className="font-extrabold text-amber-600 hover:text-amber-500 transition-colors">
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
