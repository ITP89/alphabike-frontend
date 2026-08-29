import {
  BarChart3,
  CalendarDays,
  CreditCard,
  FolderTree,
  LayoutDashboard,
  Package,
  ReceiptText,
  Settings,
  Users,
} from 'lucide-react'
import PanelLayout from './PanelLayout'

function LayoutAdmin({ children }) {
  const links = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
    { to: '/admin/citas', label: 'Citas', icon: CalendarDays },
    { to: '/admin/productos', label: 'Productos', icon: Package },
    { to: '/admin/pedidos', label: 'Pedidos', icon: ReceiptText },
    { to: '/admin/pagos', label: 'Pagos', icon: CreditCard },
    { to: '/admin/categorias', label: 'Categorias', icon: FolderTree },
    { to: '/admin/servicios', label: 'Servicios', icon: Settings },
    { to: '/admin/reportes', label: 'Reportes', icon: BarChart3 },
  ]

  return (
    <PanelLayout title="Administrador" subtitle="Panel Admin" links={links}>
      {children}
    </PanelLayout>
  )
}

export default LayoutAdmin
