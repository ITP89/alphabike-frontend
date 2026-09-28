import { useState } from 'react'
import { Bike, LogOut, Menu, X, Shield, Sparkles } from 'lucide-react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import alphaLogo from '../assets/alphabike-logo.png'
import { useAuth } from '../context/AuthContext'
import { classNames } from '../utils/formatters'

function PanelLayout({ children, title, subtitle, links = [] }) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
  }

  function renderLinks(compact = false) {
    return (links || []).map((link) => {
      const Icon = link.icon
      const isActive = location.pathname === link.to || location.pathname.startsWith(`${link.to}/`)

      return (
        <NavLink
          key={link.to}
          to={link.to}
          onClick={() => setMenuOpen(false)}
          className={classNames(
            'group flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-black transition-all duration-200',
            compact && 'min-w-max',
            isActive
              ? 'bg-white text-slate-950 shadow-lg shadow-red-950/15'
              : 'text-slate-300 hover:bg-white/[0.08] hover:text-white',
          )}
        >
          {Icon && (
            <span className={classNames(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors',
              isActive ? 'border-red-200 bg-red-50 text-red-600' : 'border-white/10 bg-white/5 text-red-300 group-hover:border-red-400/50',
            )}>
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
          )}
          <span>{link.label}</span>
        </NavLink>
      )
    })
  }

  return (
    <div className="alpha-shell font-sans selection:bg-red-600 selection:text-white">
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 text-slate-950 shadow-sm backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
              <img src={alphaLogo} alt="AlphaBike" className="h-full w-full object-contain" />
            </span>
            <span className="text-base font-black tracking-tight">AlphaBike <span className="text-red-600 text-xs font-bold">PRO</span></span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-red-50 hover:text-red-600"
            aria-label="Abrir menu del panel"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
        {menuOpen && (
          <div className="space-y-3 border-t border-slate-200 bg-slate-950 px-4 py-3">
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

      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[282px_1fr]">
        {/* Sidebar Desktop Pro */}
        <aside className="sticky top-0 hidden h-screen overflow-hidden border-r border-slate-900 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.28),transparent_32%),linear-gradient(180deg,#050816_0%,#0f172a_100%)] px-5 py-6 text-white lg:flex lg:flex-col shadow-2xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-600 via-white to-red-600" />
          <Link to="/" className="group mb-8 flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-3 backdrop-blur">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/15 bg-white p-1 shadow-lg shadow-red-950/30 transition-transform group-hover:scale-105">
              <img src={alphaLogo} alt="AlphaBike" className="h-full w-full object-contain" />
            </span>
            <div>
              <p className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                AlphaBike <Sparkles className="h-3 w-3 text-red-400" />
              </p>
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">{subtitle}</p>
            </div>
          </Link>

          <div className="mb-3 px-2">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Menú de Gestión</span>
          </div>

          <nav className="flex flex-col gap-2">{renderLinks()}</nav>

          {/* User Profile Card Footer */}
          <div className="mt-auto border-t border-white/10 px-2 pt-4">
            <div className="mb-3 flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.07] p-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-400/40 bg-red-500/15 text-red-200">
                <Shield className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-white">{usuario?.nombre || title}</p>
                <p className="truncate text-[10px] font-semibold text-red-400">{usuario?.rol || subtitle}</p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2.5 text-xs font-black text-red-200 transition-all hover:bg-red-600 hover:text-white active:scale-95"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="min-w-0 w-full overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="mb-6 hidden items-center justify-between rounded-lg border border-slate-200 bg-white/[0.86] px-5 py-4 shadow-sm backdrop-blur lg:flex">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-red-600">{subtitle}</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-600">Gestión operativa AlphaBike Workshop</p>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <Bike className="h-4 w-4 text-red-600" aria-hidden="true" />
              <span className="text-xs font-black text-slate-800">{usuario?.nombre || title}</span>
            </div>
          </div>
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default PanelLayout


