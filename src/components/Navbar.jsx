import { useState } from 'react'
import { Bike, LogIn, LogOut, Menu, ShieldCheck, ShoppingCart, UserCircle, Wrench, X } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'
import { classNames } from '../utils/formatters'

const publicLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/tienda', label: 'Tienda' },
  { to: '/mantenimiento', label: 'Mantenimiento' },
  { to: '/galeria', label: 'Galería' },
  { to: '/contacto', label: 'Contacto' },
]

function getPanelLink(usuario) {
  if (!usuario) return null
  if (usuario.rol === 'ADMIN') return { to: '/admin/dashboard', label: 'Panel Admin', icon: ShieldCheck }
  if (usuario.rol === 'ENCARGADO') return { to: '/encargado/dashboard', label: 'Tallerista', icon: Wrench }
  return { to: '/perfil', label: 'Mi Cuenta', icon: UserCircle }
}

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        classNames(
          'relative rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200',
          isActive
            ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        )
      }
    >
      {label}
    </NavLink>
  )
}

function Navbar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const { totalItems } = useCarrito()
  const [menuOpen, setMenuOpen] = useState(false)
  const panelLink = getPanelLink(usuario)
  const PanelIcon = panelLink?.icon

  function handleLogout() {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 transition-transform duration-200 active:scale-95"
          onClick={() => setMenuOpen(false)}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-amber-400 shadow-md shadow-slate-950/20 transition-all group-hover:scale-105 group-hover:bg-amber-500 group-hover:text-slate-950">
            <Bike className="h-6 w-6 transition-transform group-hover:-rotate-12" aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-slate-950">
              ALPHA<span className="text-amber-500">BIKE</span>
            </span>
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Pro Workshop</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-1 rounded-full border border-slate-200/60 bg-slate-100/50 p-1 md:flex">
          {publicLinks.map((link) => (
            <NavItem key={link.to} {...link} />
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {panelLink && PanelIcon && (
            <Link
              to={panelLink.to}
              className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
            >
              <PanelIcon className="h-4 w-4 text-amber-500" aria-hidden="true" />
              {panelLink.label}
            </Link>
          )}

          {usuario ? (
            <button
              type="button"
              onClick={handleLogout}
              className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:inline-flex"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Salir
            </button>
          ) : (
            <Link
              to="/login"
              className="hidden items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md sm:inline-flex active:scale-95"
            >
              <LogIn className="h-4 w-4 text-amber-400" aria-hidden="true" />
              Ingresar
            </Link>
          )}

          {/* Cart Icon with Counter */}
          <Link
            to="/carrito"
            className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:border-amber-400 hover:bg-amber-50/50 hover:text-amber-600 active:scale-95"
            aria-label="Ver carrito"
          >
            <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" aria-hidden="true" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 animate-pulse-subtle items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-black text-slate-950 shadow-sm shadow-amber-500/50">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition-all hover:bg-slate-100 md:hidden"
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5 text-amber-600" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="animate-fade-in border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-4 md:hidden shadow-lg">
          <div className="mx-auto flex max-w-6xl flex-col gap-1.5">
            {publicLinks.map((link) => (
              <NavItem key={link.to} {...link} onClick={() => setMenuOpen(false)} />
            ))}
            {panelLink && <NavItem to={panelLink.to} label={panelLink.label} onClick={() => setMenuOpen(false)} />}
            {usuario ? (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 rounded-xl border border-red-200 bg-red-50/60 px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-100"
              >
                Cerrar Sesión
              </button>
            ) : (
              <NavItem to="/login" label="Iniciar Sesión" onClick={() => setMenuOpen(false)} />
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
