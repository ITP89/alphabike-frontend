import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function RutaProtegida({ children, roles }) {
  const { usuario, cargando } = useAuth()

  if (cargando) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando...</div>
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default RutaProtegida
