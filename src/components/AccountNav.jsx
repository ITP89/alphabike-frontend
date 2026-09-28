import { CalendarDays, ReceiptText, UserCircle } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import alphaLogo from '../assets/alphabike-logo.png'
import { classNames } from '../utils/formatters'

const links = [
  { to: '/pedidos', label: 'Mis pedidos', icon: ReceiptText },
  { to: '/citas', label: 'Mis citas', icon: CalendarDays },
  { to: '/perfil', label: 'Mi perfil', icon: UserCircle },
]

function AccountNav() {
  return (
    <aside className="alpha-panel-surface p-3 lg:sticky lg:top-24 lg:self-start">
      <div className="mb-3 flex items-center gap-3 rounded-lg bg-slate-950 p-3 text-white">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white p-1">
          <img src={alphaLogo} alt="AlphaBike" className="h-full w-full object-contain" />
        </span>
        <div>
          <h2 className="text-sm font-black">Mi cuenta</h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-300">Cliente AlphaBike</p>
        </div>
      </div>
      <nav className="flex gap-2 overflow-x-auto pb-1 text-sm lg:flex-col lg:overflow-visible lg:pb-0">
        {links.map((link) => {
          const Icon = link.icon

          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                classNames(
                  'flex min-w-max items-center gap-2 rounded-lg px-3 py-2.5 font-black transition',
                  isActive ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'text-slate-600 hover:bg-red-50 hover:text-red-700',
                )
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {link.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

export default AccountNav
