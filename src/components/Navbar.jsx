import { useState } from 'react'
import { LogIn, LogOut, Menu, ShieldCheck, ShoppingCart, UserCircle, Wrench, X } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import alphaLogo from '../assets/alphabike-logo.png'
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
          'relative rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200',
          isActive
            ? 'bg-red-600 text-white shadow-sm shadow-red-600/25'
            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950',
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
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/95 backdrop-blur-xl transition-all">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          to="/"
          className="group flex min-w-0 items-center gap-3 transition-transform duration-200 active:scale-95"
          onClick={() => setMenuOpen(false)}
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white p-1 shadow-sm shadow-zinc-950/10 transition-all group-hover:border-red-500/50 group-hover:shadow-red-600/15">
            <img src={alphaLogo} alt="AlphaBike Workshop" className="h-full w-full object-contain" />
          </span>
          <div className="flex min-w-0 flex-col leading-none">
            <span className="font-black text-lg tracking-tight text-zinc-950">
              ALPHA<span className="text-red-500">BIKE</span>
            </span>
            <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Workshop</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-1 rounded-xl border border-zinc-200/80 bg-zinc-100/70 p-1 md:flex">
          {publicLinks.map((link) => (
            <NavItem key={link.to} {...link} />
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {panelLink && PanelIcon && (
            <Link
              to={panelLink.to}
              className="hidden items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-bold text-zinc-700 transition-all hover:bg-zinc-100 hover:text-zinc-950 sm:inline-flex"
            >
              <PanelIcon className="h-4 w-4 text-red-500" aria-hidden="true" />
              {panelLink.label}
            </Link>
          )}

          {usuario ? (
            <button
              type="button"
              onClick={handleLogout}
              className="hidden items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-bold text-zinc-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:inline-flex"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Salir
            </button>
          ) : (
            <Link
              to="/login"
              className="hidden items-center gap-2 rounded-lg bg-zinc-950 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md sm:inline-flex active:scale-95"
            >
              <LogIn className="h-4 w-4 text-red-300" aria-hidden="true" />
              Ingresar
            </Link>
          )}

          {/* Cart Icon with Counter */}
          <Link
            to="/carrito"
            className="group relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 shadow-sm transition-all hover:border-red-400 hover:bg-red-50/50 hover:text-red-600 active:scale-95"
            aria-label="Ver carrito"
          >
            <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" aria-hidden="true" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 animate-pulse-subtle items-center justify-center rounded-md bg-red-600 px-1.5 text-[11px] font-black text-white shadow-sm shadow-red-500/50">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 transition-all hover:bg-zinc-100 md:hidden"
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5 text-red-600" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="animate-fade-in border-t border-zinc-200 bg-white/95 backdrop-blur-md px-4 py-4 shadow-lg md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1.5">
            {publicLinks.map((link) => (
              <NavItem key={link.to} {...link} onClick={() => setMenuOpen(false)} />
            ))}
            {panelLink && <NavItem to={panelLink.to} label={panelLink.label} onClick={() => setMenuOpen(false)} />}
            {usuario ? (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 rounded-lg border border-red-200 bg-red-50/60 px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-100"
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

