import { useState } from 'react'
import { Bike, LogOut, Menu, X, Shield, Sparkles } from 'lucide-react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { classNames } from '../utils/formatters'

function PanelLayout({ children, title, subtitle, links }) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
  }

  function renderLinks(compact = false) {
    return links.map((link) => {
      const Icon = link.icon
      const isActive = location.pathname === link.to || location.pathname.startsWith(`${link.to}/`)

      return (
        <NavLink
          key={link.to}
          to={link.to}
          onClick={() => setMenuOpen(false)}
          className={classNames(
            'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-extrabold transition-all duration-200',
            compact && 'min-w-max',
            isActive
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:bg-slate-900 hover:text-white',
          )}
        >
          {Icon && <Icon className={classNames('h-4 w-4 shrink-0', isActive ? 'text-slate-950' : 'text-amber-400')} aria-hidden="true" />}
          <span>{link.label}</span>
        </NavLink>
      )
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-amber-400 selection:text-slate-950">
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950 text-white lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black shadow-md">
              <Bike className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-black text-white text-base tracking-tight">AlphaBike <span className="text-amber-400 text-xs font-bold">PRO</span></span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
            aria-label="Abrir menu del panel"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-slate-800 bg-slate-950 px-4 py-3 space-y-3">
            <nav className="flex flex-col gap-1.5">{renderLinks()}</nav>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Cerrar sesión
            </button>
          </div>
        )}
      </header>

      <div className="mx-auto grid min-h-screen max-w-[1536px] grid-cols-1 lg:grid-cols-[250px_1fr]">
        {/* Sidebar Desktop Pro */}
        <aside className="hidden border-r border-slate-800 bg-slate-950 px-4 py-6 text-white lg:flex lg:flex-col shadow-2xl">
          <Link to="/" className="mb-8 flex items-center gap-3 group px-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
              <Bike className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                AlphaBike <Sparkles className="h-3 w-3 text-amber-400" />
              </p>
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{subtitle}</p>
            </div>
          </Link>

          <div className="px-2 mb-2">
            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Menú de Gestión</span>
          </div>

          <nav className="flex flex-col gap-1.5">{renderLinks()}</nav>

          {/* User Profile Card Footer */}
          <div className="mt-auto border-t border-slate-800/80 pt-4 px-2">
            <div className="flex items-center gap-2.5 mb-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0 font-bold text-xs">
                <Shield className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-white">{usuario?.nombre || title}</p>
                <p className="truncate text-[10px] font-semibold text-amber-400">{usuario?.rol || subtitle}</p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all active:scale-95"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="min-w-0 bg-slate-50 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default PanelLayout
