import { KeyRound, Save, UserCircle } from 'lucide-react'
import { useState } from 'react'
import api from '../api/axios'
import AccountNav from '../components/AccountNav'
import Navbar from '../components/Navbar'
import Alert from '../components/ui/Alert'
import FormField from '../components/ui/FormField'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../utils/apiError'

function MiPerfil() {
  const { usuario, actualizarUsuario } = useAuth()

  const [nombre, setNombre] = useState(usuario?.nombre || '')
  const [email] = useState(usuario?.email || '')
  const [telefono, setTelefono] = useState(usuario?.telefono || '')
  const [guardandoDatos, setGuardandoDatos] = useState(false)
  const [mensajeDatos, setMensajeDatos] = useState(null)

  const [passwordActual, setPasswordActual] = useState('')
  const [passwordNueva, setPasswordNueva] = useState('')
  const [passwordConfirmar, setPasswordConfirmar] = useState('')
  const [guardandoPassword, setGuardandoPassword] = useState(false)
  const [mensajePassword, setMensajePassword] = useState(null)

  const iniciales = usuario?.nombre
    ? usuario.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  async function handleGuardarDatos(e) {
    e.preventDefault()
    setMensajeDatos(null)

    if (!nombre.trim() || !telefono.trim()) {
      setMensajeDatos({ type: 'error', text: 'Nombre y telefono son obligatorios' })
      return
    }

    setGuardandoDatos(true)

    try {
      const response = await api.put('/usuarios/perfil', {
        nombre: nombre.trim(),
        email,
        telefono: telefono.trim(),
      })
      actualizarUsuario(response.data.data)
      setMensajeDatos({ type: 'success', text: 'Datos actualizados correctamente' })
    } catch (err) {
      setMensajeDatos({ type: 'error', text: getApiErrorMessage(err, 'No se pudieron guardar los cambios') })
    } finally {
      setGuardandoDatos(false)
    }
  }

  async function handleCambiarPassword(e) {
    e.preventDefault()
    setMensajePassword(null)

    if (!passwordActual || !passwordNueva) {
      setMensajePassword({ type: 'error', text: 'Completa la contrasena actual y la nueva' })
      return
    }

    if (passwordNueva.length < 6) {
      setMensajePassword({ type: 'error', text: 'La nueva contrasena debe tener al menos 6 caracteres' })
      return
    }

    if (passwordNueva !== passwordConfirmar) {
      setMensajePassword({ type: 'error', text: 'Las contrasenas no coinciden' })
      return
    }

    if (!telefono.trim()) {
      setMensajePassword({ type: 'error', text: 'Completa tu telefono antes de cambiar la contrasena' })
      return
    }

    setGuardandoPassword(true)

    try {
      const response = await api.put('/usuarios/perfil', {
        nombre: nombre.trim(),
        email,
        telefono: telefono.trim(),
        passwordActual,
        passwordNueva,
      })
      actualizarUsuario(response.data.data)
      setMensajePassword({ type: 'success', text: 'Contrasena actualizada correctamente' })
      setPasswordActual('')
      setPasswordNueva('')
      setPasswordConfirmar('')
    } catch (err) {
      setMensajePassword({ type: 'error', text: getApiErrorMessage(err, 'No se pudo actualizar la contrasena') })
    } finally {
      setGuardandoPassword(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[220px_1fr]">
        <AccountNav />

        <section>
          <h1 className="mb-6 text-2xl font-semibold text-gray-950">Mi perfil</h1>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <form onSubmit={handleGuardarDatos} className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-950">
                <UserCircle className="h-5 w-5 text-blue-600" aria-hidden="true" />
                Datos personales
              </h2>

              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                  {iniciales}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-950">{usuario?.nombre}</p>
                  <p className="text-xs text-gray-500">{usuario?.rol}</p>
                </div>
              </div>

              {mensajeDatos && <Alert type={mensajeDatos.type} className="mb-4">{mensajeDatos.text}</Alert>}

              <div className="space-y-3">
                <FormField label="Nombre completo">
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </FormField>
                <FormField label="Correo electronico">
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-400"
                  />
                </FormField>
                <FormField label="Telefono / WhatsApp">
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </FormField>
                <button
                  type="submit"
                  disabled={guardandoDatos}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {guardandoDatos ? 'Guardando...' : 'Guardar cambios'}
                  {!guardandoDatos && <Save className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </form>

            <form onSubmit={handleCambiarPassword} className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-950">
                <KeyRound className="h-5 w-5 text-blue-600" aria-hidden="true" />
                Cambiar contrasena
              </h2>

              {mensajePassword && <Alert type={mensajePassword.type} className="mb-4">{mensajePassword.text}</Alert>}

              <div className="space-y-3">
                <FormField label="Contrasena actual">
                  <input
                    type="password"
                    value={passwordActual}
                    onChange={(e) => setPasswordActual(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </FormField>
                <FormField label="Nueva contrasena" hint="Minimo 6 caracteres">
                  <input
                    type="password"
                    value={passwordNueva}
                    onChange={(e) => setPasswordNueva(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </FormField>
                <FormField label="Confirmar nueva contrasena">
                  <input
                    type="password"
                    value={passwordConfirmar}
                    onChange={(e) => setPasswordConfirmar(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </FormField>
                <button
                  type="submit"
                  disabled={guardandoPassword}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {guardandoPassword ? 'Actualizando...' : 'Actualizar contrasena'}
                  {!guardandoPassword && <KeyRound className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  )
}

export default MiPerfil
