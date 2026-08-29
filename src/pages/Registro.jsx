import { UserPlus, Mail, Lock, User, Phone, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Alert from '../components/ui/Alert'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../utils/apiError'
import heroImage from '../assets/hero-workshop.png'

function Registro() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const { registrar } = useAuth()
  const navigate = useNavigate()

  function clearField(field) {
    setErrors((current) => ({ ...current, [field]: '' }))
    setError('')
  }

  function validate() {
    const nextErrors = {}
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    if (nombre.trim().length < 3) nextErrors.nombre = 'Ingresa tu nombre completo'
    if (!emailValido) nextErrors.email = 'Ingresa un correo electrónico válido'
    if (telefono.trim().length < 7) nextErrors.telefono = 'Ingresa un teléfono válido'
    if (password.length < 6) nextErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    if (password !== confirmarPassword) nextErrors.confirmarPassword = 'Las contraseñas no coinciden'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!validate()) return

    setCargando(true)

    try {
      await registrar(nombre.trim(), email.trim(), password, telefono.trim())
      navigate('/')
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo crear la cuenta'))
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
              <span>Comunidad AlphaBike PRO</span>
            </div>
          </div>

          <div className="relative z-10 max-w-lg">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Crea tu cuenta y vive la experiencia PRO
            </h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-slate-300">
              Disfruta de compras rápidas, agendamiento de mantenimientos preventivos y seguimiento de tus pedidos en línea.
            </p>

            <div className="mt-8 space-y-3 pt-6 border-t border-slate-800/80">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-200">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">✓</div>
                <span>Agendamiento directo de servicios con prioridad en taller</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-200">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">✓</div>
                <span>Acceso a promociones y repuestos exclusivos de alta gama</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-200">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">✓</div>
                <span>Notificaciones de envío y estado de tu bicicleta por WhatsApp</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs font-semibold text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Tus datos personales protegidos bajo cifrado SSL</span>
          </div>
        </section>

        {/* Formulario Derecho PRO */}
        <section className="flex items-center justify-center px-6 py-12 lg:col-span-6 bg-slate-50">
          <div className="w-full max-w-md">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/60">
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black text-amber-800 mb-3">
                  <UserPlus className="h-3.5 w-3.5" />
                  Registro de Cliente
                </span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Crear Cuenta</h1>
                <p className="mt-1 text-xs font-semibold text-slate-500">Regístrate para comprar componentes y agendar citas.</p>
              </div>

              {error && <Alert type="error" className="mb-5 font-bold shadow-sm">{error}</Alert>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Nombre Completo *</label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Juan Pérez"
                      value={nombre}
                      onChange={(e) => {
                        setNombre(e.target.value)
                        clearField('nombre')
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                  {errors.nombre && <p className="mt-1 text-[11px] font-bold text-red-600">{errors.nombre}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Correo Electrónico *</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      placeholder="juan@ejemplo.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        clearField('email')
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-[11px] font-bold text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Teléfono / WhatsApp *</label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="+51 902 280 036"
                      value={telefono}
                      onChange={(e) => {
                        setTelefono(e.target.value)
                        clearField('telefono')
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                  {errors.telefono && <p className="mt-1 text-[11px] font-bold text-red-600">{errors.telefono}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                          clearField('password')
                        }}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                      />
                    </div>
                    {errors.password && <p className="mt-1 text-[11px] font-bold text-red-600">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirmar *</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmarPassword}
                        onChange={(e) => {
                          setConfirmarPassword(e.target.value)
                          clearField('confirmarPassword')
                        }}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                      />
                    </div>
                    {errors.confirmarPassword && <p className="mt-1 text-[11px] font-bold text-red-600">{errors.confirmarPassword}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-xs font-black text-white hover:bg-amber-500 hover:text-slate-950 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cargando ? 'Creando cuenta...' : 'Completar Registro'}
                  {!cargando && <ArrowRight className="h-4 w-4 text-amber-400" />}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs font-semibold text-slate-500">
                  ¿Ya tienes una cuenta registrada?{' '}
                  <Link to="/login" className="font-extrabold text-amber-600 hover:text-amber-500 transition-colors">
                    Inicia sesión aquí
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

export default Registro
