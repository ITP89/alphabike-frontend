import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'

function Navbar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const { totalItems } = useCarrito()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <Link to="/" className="font-semibold text-lg text-gray-900">
        ALPHA BIKE
      </Link>

      <div className="hidden md:flex gap-6 text-gray-700">
        <Link to="/" className="hover:text-blue-600">Inicio</Link>
        <Link to="/tienda" className="hover:text-blue-600">Tienda</Link>
        <Link to="/mantenimiento" className="hover:text-blue-600">Mantenimiento</Link>
        <Link to="/galeria" className="hover:text-blue-600">Galeria</Link>
        <Link to="/contacto" className="hover:text-blue-600">Contacto</Link>
      </div>

      <div className="flex gap-3 items-center">
        {usuario ? (
          <>
            <span className="text-sm text-gray-700">Hola, {usuario.nombre}</span>
            <button
              onClick={handleLogout}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50"
            >
              Cerrar sesion
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50"
          >
            Iniciar sesion
          </Link>
        )}
        <Link
          to="/carrito"
          className="relative text-sm border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50"
        >
          🛒
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </nav>
  )
}

export default Navbar