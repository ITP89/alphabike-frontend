import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Navbar from '../components/Navbar'

function MiPerfil() {
  const { usuario } = useAuth()

  const [nombre, setNombre] = useState(usuario?.nombre || '')
  const [email] = useState(usuario?.email || '')
  const [telefono, setTelefono] = useState('')
  const [guardandoDatos, setGuardandoDatos] = useState(false)
  const [mensajeDatos, setMensajeDatos] = useState('')

  const [passwordActual, setPasswordActual] = useState('')
  const [passwordNueva, setPasswordNueva] = useState('')
  const [passwordConfirmar, setPasswordConfirmar] = useState('')
  const [guardandoPassword, setGuardandoPassword] = useState(false)
  const [mensajePassword, setMensajePassword] = useState('')

  const iniciales = usuario?.nombre
    ? usuario.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  async function handleGuardarDatos(e) {
    e.preventDefault()
    setMensajeDatos('')
    setGuardandoDatos(true)

    try {
      await api.put(`/usuarios/perfil`, {
        nombre,
        email,
        telefono,
        password: '',
        rol: usuario.rol,
      })
      setMensajeDatos('Datos actualizados correctamente')
    } catch (err) {
      setMensajeDatos('No se pudieron guardar los cambios')
    } finally {
      setGuardandoDatos(false)
    }
  }

  async function handleCambiarPassword(e) {
    e.preventDefault()
    setMensajePassword('')

    if (passwordNueva !== passwordConfirmar) {
      setMensajePassword('Las contrasenas no coinciden')
      return
    }

    setGuardandoPassword(true)

    try {
      await api.put(`/usuarios/perfil`, {
        nombre,
        email,
        telefono,
        password: passwordNueva,
        rol: usuario.rol,
      })
      setMensajePassword('Contrasena actualizada correctamente')
      setPasswordActual('')
      setPasswordNueva('')
      setPasswordConfirmar('')
    } catch (err) {
      setMensajePassword('No se pudo actualizar la contrasena')
    } finally {
      setGuardandoPassword(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Mi cuenta</h3>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/pedidos" className="text-gray-600 hover:text-blue-600">Mis pedidos</Link>
            <Link to="/citas" className="text-gray-600 hover:text-blue-600">Mis citas</Link>
            <Link to="/perfil" className="text-gray-900 font-medium">Mi perfil</Link>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Mi perfil</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <form onSubmit={handleGuardarDatos} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Datos personales</h3>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
                  {iniciales}
                </div>
                <div>
                  <p className="text-gray-900 font-medium text-sm">{usuario?.nombre}</p>
                  <p className="text-gray-500 text-xs">{usuario?.rol}</p>
                </div>
              </div>

              {mensajeDatos && (
                <p className="text-sm text-blue-600 mb-2">{mensajeDatos}</p>
              )}

              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Telefono / WhatsApp"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={guardandoDatos}
                  className="bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {guardandoDatos ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>

            <form onSubmit={handleCambiarPassword} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Cambiar contrasena</h3>

              {mensajePassword && (
                <p className="text-sm text-blue-600 mb-2">{mensajePassword}</p>
              )}

              <div className="flex flex-col gap-2">
                <input
                  type="password"
                  placeholder="Contrasena actual"
                  value={passwordActual}
                  onChange={(e) => setPasswordActual(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <input
                  type="password"
                  placeholder="Nueva contrasena"
                  value={passwordNueva}
                  onChange={(e) => setPasswordNueva(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <input
                  type="password"
                  placeholder="Confirmar nueva contrasena"
                  value={passwordConfirmar}
                  onChange={(e) => setPasswordConfirmar(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={guardandoPassword}
                  className="bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {guardandoPassword ? 'Actualizando...' : 'Actualizar contrasena'}
                </button>
              </div>
            </form>

          </div>
        </div>

      </div>
    </div>
  )
}

export default MiPerfil