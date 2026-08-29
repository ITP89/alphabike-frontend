import { Clock3, Mail, MapPin, Phone, Send, MessageCircle, CheckCircle2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import Navbar from '../components/Navbar'
import Alert from '../components/ui/Alert'
import FormField from '../components/ui/FormField'

const initialForm = {
  nombre: '',
  email: '',
  telefono: '',
  asunto: 'MANTENIMIENTO',
  mensaje: '',
}

function Contacto() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setSuccess('')
  }

  function validate() {
    const nextErrors = {}
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)

    if (form.nombre.trim().length < 3) nextErrors.nombre = 'Ingresa tu nombre completo'
    if (!emailValido) nextErrors.email = 'Ingresa un correo electrónico válido'
    if (form.telefono.trim().length < 7) nextErrors.telefono = 'Ingresa un teléfono o WhatsApp válido'
    if (form.mensaje.trim().length < 10) nextErrors.mensaje = 'Describe tu consulta con más detalle (mín. 10 caracteres)'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSuccess('')

    if (!validate()) return

    setForm(initialForm)
    setSuccess('¡Gracias! Tu mensaje ha sido enviado al equipo técnico de AlphaBike. Te responderemos a la brevedad.')
  }

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(`Hola AlphaBike, quisiera consultar sobre un servicio de mantenimiento o producto. Mi nombre es: ${form.nombre || 'Cliente'}`)
    window.open(`https://wa.me/51902280036?text=${text}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Navbar />

      {/* Signature Hero Header (Dark Navy AlphaBike Theme) */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-slate-950 px-6 py-14 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-6xl relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-400 backdrop-blur-md mb-3">
            <Mail className="h-4 w-4 text-amber-400" />
            <span>ATENCIÓN DIRECTA & COTIZACIONES</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Conversemos sobre <span className="text-amber-500">Tu Bicicleta</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Escríbenos para consultar repuestos en stock, cotizar servicios de taller especializado o dar seguimiento a tus reparaciones.
          </p>
        </div>
      </section>

      {/* Main Grid Content */}
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[1fr_380px]">
        
        {/* Formulario de Contacto en Blanco Brillante */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Envíanos un mensaje</h2>
              <p className="text-xs text-slate-500 mt-0.5">Completa tus datos y te responderemos en menos de 2 horas.</p>
            </div>
            <button
              type="button"
              onClick={handleWhatsAppDirect}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-all shadow-sm"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              <span>WhatsApp Directo</span>
            </button>
          </div>

          {success && (
            <Alert type="success" className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span className="font-semibold text-xs">{success}</span>
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Nombre completo" error={errors.nombre}>
              <input
                type="text"
                placeholder="Ej. Carlos Mendoza"
                value={form.nombre}
                onChange={(event) => updateField('nombre', event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </FormField>

            <FormField label="Correo electrónico" error={errors.email}>
              <input
                type="email"
                placeholder="carlos@ejemplo.com"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </FormField>

            <FormField label="Teléfono / WhatsApp" error={errors.telefono}>
              <input
                type="tel"
                placeholder="+51 902 280 036"
                value={form.telefono}
                onChange={(event) => updateField('telefono', event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </FormField>

            <FormField label="Asunto o Motivo">
              <select
                value={form.asunto}
                onChange={(event) => updateField('asunto', event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
              >
                <option value="MANTENIMIENTO">Mantenimiento de Taller</option>
                <option value="TIENDA">Consulta de Productos y Repuestos</option>
                <option value="PEDIDO">Seguimiento de Pedido</option>
                <option value="OTRO">Otro Motivo</option>
              </select>
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="Detalle de tu Consulta" error={errors.mensaje}>
                <textarea
                  value={form.mensaje}
                  onChange={(event) => updateField('mensaje', event.target.value)}
                  rows="4"
                  placeholder="Detalla el modelo de tu bicicleta o el servicio específico que requieres..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </FormField>
            </div>

            <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20 active:scale-95"
              >
                <span>Enviar Mensaje</span>
                <Send className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleWhatsAppDirect}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white hover:bg-emerald-500 transition-all shadow-md active:scale-95"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Contactar por WhatsApp</span>
              </button>
            </div>
          </form>
        </section>

        {/* Sidebar Info & Mapa */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Información de Contacto</span>
            </h2>

            <div className="space-y-4 text-xs font-medium text-slate-600">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-2 text-amber-700 shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 mb-0.5">Dirección de Taller & Tienda</p>
                  <p className="text-slate-600 leading-relaxed">Av. Javier Prado Este 2450, San Borja, Lima - Perú</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2 text-emerald-700 shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 mb-0.5">Teléfono / WhatsApp</p>
                  <a href="https://wa.me/51902280036" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold hover:underline">
                    +51 902 280 036
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-2 text-blue-700 shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 mb-0.5">Correo Electrónico</p>
                  <a href="mailto:contacto@alphabike.pe" className="text-blue-600 font-semibold hover:underline">
                    contacto@alphabike.pe
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-slate-100 border border-slate-200 p-2 text-slate-700 shrink-0">
                  <Clock3 className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 mb-0.5">Horario de Atención</p>
                  <p className="text-slate-600">Lun - Sáb: 8:00 am - 8:00 pm</p>
                  <p className="text-slate-600">Domingos: 9:00 am - 2:00 pm</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mapa Interactivo */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-amber-600" />
                Ubicación en Tiempo Real
              </span>
              <span className="text-[10px] text-amber-700 font-extrabold uppercase">San Borja, Lima</span>
            </div>

            <iframe
              title="Mapa de Ubicación AlphaBike"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.667234509425!2d-77.0016482!3d-12.0886566!2m3!1f0!f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c87a55555555%3A0x1111111111111111!2sAv.%20Javier%20Prado%20Este%202450%2C%20San%20Borja%2015034!5e0!3m2!1ses!2spe!4v1700000000000!5m2!1ses!2spe"
              width="100%"
              height="230"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </aside>
      </main>
    </div>
  )
}

export default Contacto
