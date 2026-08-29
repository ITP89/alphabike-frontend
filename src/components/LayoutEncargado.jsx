import {
  Bike,
  CalendarDays,
  Camera,
  CreditCard,
  LayoutDashboard,
  Package,
  ReceiptText,
} from 'lucide-react'
import PanelLayout from './PanelLayout'

function LayoutEncargado({ children }) {
  const links = [
    { to: '/encargado/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/encargado/citas', label: 'Citas', icon: CalendarDays },
    { to: '/encargado/productos', label: 'Productos', icon: Package },
    { to: '/encargado/venta', label: 'Venta presencial', icon: Bike },
    { to: '/encargado/entregas', label: 'Pedidos / entregas', icon: ReceiptText },
    { to: '/encargado/pagos', label: 'Pagos', icon: CreditCard },
    { to: '/encargado/galeria', label: 'Galeria', icon: Camera },
  ]

  return (
    <PanelLayout title="Encargado" subtitle="Panel Encargado" links={links}>
      {children}
    </PanelLayout>
  )
}

export default LayoutEncargado
