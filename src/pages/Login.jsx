import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError('Correo o contrasena incorrectos')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
        <div className="bg-gray-100 hidden md:flex items-center justify-center text-gray-400">
          📷 Imagen / ilustracion
        </div>

        <div className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm">
            <h1 className="text-xl font-semibold text-gray-900 mb-1">Iniciar sesion</h1>
            <p className="text-gray-500 text-sm mb-6">Ingresa tus datos para continuar</p>

            {error && (
              <p className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-md mb-3">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Correo electronico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              <p className="text-right text-sm text-blue-600 cursor-pointer hover:underline">
                Olvidaste tu contrasena?
              </p>
              <button
                type="submit"
                disabled={cargando}
                className="bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {cargando ? 'Ingresando...' : 'Iniciar sesion'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
              No tienes cuenta?{' '}
              <Link to="/registro" className="text-blue-600 hover:underline">
                Registrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login