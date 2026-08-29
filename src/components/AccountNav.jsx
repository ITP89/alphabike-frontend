import { CalendarDays, ReceiptText, UserCircle } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { classNames } from '../utils/formatters'

const links = [
  { to: '/pedidos', label: 'Mis pedidos', icon: ReceiptText },
  { to: '/citas', label: 'Mis citas', icon: CalendarDays },
  { to: '/perfil', label: 'Mi perfil', icon: UserCircle },
]

function AccountNav() {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <h2 className="mb-3 text-sm font-semibold text-gray-950">Mi cuenta</h2>
      <nav className="flex gap-2 overflow-x-auto pb-1 text-sm lg:flex-col lg:overflow-visible lg:pb-0">
        {links.map((link) => {
          const Icon = link.icon

          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                classNames(
                  'flex min-w-max items-center gap-2 rounded-md px-3 py-2 font-medium transition',
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-700',
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
