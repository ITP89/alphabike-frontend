import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

function Registro() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const { registrar } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password !== confirmarPassword) {
      setError('Las contrasenas no coinciden')
      return
    }

    setCargando(true)

    try {
      await registrar(nombre, email, password, telefono)
      navigate('/')
    } catch (err) {
      const mensaje = err.response?.data?.message || 'No se pudo crear la cuenta'
      setError(mensaje)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[600px]">
        <div className="bg-gray-100 hidden md:flex items-center justify-center text-gray-400">
          📷 Imagen / ilustracion
        </div>

        <div className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm">
            <h1 className="text-xl font-semibold text-gray-900 mb-1">Crear cuenta</h1>
            <p className="text-gray-500 text-sm mb-6">Registrate para comprar y agendar citas</p>

            {error && (
              <p className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-md mb-3">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Nombre completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <input
                type="email"
                placeholder="Correo electronico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Telefono / WhatsApp"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <input
                type="password"
                placeholder="Contrasena"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <input
                type="password"
                placeholder="Confirmar contrasena"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                required
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={cargando}
                className="bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
              Ya tienes cuenta?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Inicia sesion
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Registro