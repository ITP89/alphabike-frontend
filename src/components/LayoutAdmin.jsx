import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function LayoutAdmin({ children }) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    logout()
    navigate('/')
  }

  const links = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/usuarios', label: 'Usuarios' },
    { to: '/admin/citas', label: 'Citas' },
    { to: '/admin/productos', label: 'Productos' },
    { to: '/admin/pedidos', label: 'Pedidos' },
    { to: '/admin/pagos', label: 'Pagos' },
    { to: '/admin/categorias', label: 'Categorias' },
    { to: '/admin/servicios', label: 'Servicios' },
    { to: '/admin/reportes', label: 'Reportes' },
  ]

  return (
    <div className="min-h-screen grid grid-cols-[200px_1fr]">

      <div className="border-r border-gray-200 px-4 py-6 flex flex-col gap-2">
        <div className="font-semibold text-gray-900 mb-1">ALPHA BIKE</div>
        <div className="text-xs text-gray-500 mb-4">Panel Admin</div>

        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`text-sm px-3 py-2 rounded-md ${
              location.pathname === link.to
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {link.label}
          </Link>
        ))}

        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-700 mb-2">{usuario?.nombre}</div>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Cerrar sesion
          </button>
        </div>
      </div>

      <div className="p-6 bg-gray-50 min-h-screen">
        {children}
      </div>

    </div>
  )
}

export default LayoutAdmin