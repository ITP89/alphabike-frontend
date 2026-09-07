import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import ErrorBoundary from './components/ui/ErrorBoundary'
import { PageLoader } from './components/ui/Skeleton'
import RutaProtegida from './components/RutaProtegida'

// Paginas publicas principales (eager load para primera carga ultrarrápida)
import Home from './pages/Home'
import Login from './pages/Login'
import Registro from './pages/Registro'

// Paginas con Lazy Loading (Code Splitting)
const Tienda = lazy(() => import('./pages/Tienda'))
const DetalleProducto = lazy(() => import('./pages/DetalleProducto'))
const Servicios = lazy(() => import('./pages/Servicios'))
const Galeria = lazy(() => import('./pages/Galeria'))
const Contacto = lazy(() => import('./pages/Contacto'))
const Carrito = lazy(() => import('./pages/Carrito'))
const Checkout = lazy(() => import('./pages/Checkout'))
const MisPedidos = lazy(() => import('./pages/MisPedidos'))
const DetallePedido = lazy(() => import('./pages/DetallePedido'))
const AgendarCita = lazy(() => import('./pages/AgendarCita'))
const MisCitas = lazy(() => import('./pages/MisCitas'))
const DetalleCita = lazy(() => import('./pages/DetalleCita'))
const MiPerfil = lazy(() => import('./pages/MiPerfil'))

// Panel Encargado (Lazy Loaded)
const DashboardEncargado = lazy(() => import('./pages/encargado/Dashboard'))
const GestionCitas = lazy(() => import('./pages/encargado/GestionCitas'))
const DetalleCitaEncargado = lazy(() => import('./pages/encargado/DetalleCitaEncargado'))
const GestionProductos = lazy(() => import('./pages/encargado/GestionProductos'))
const VentaPresencial = lazy(() => import('./pages/encargado/VentaPresencial'))
const GestionPagos = lazy(() => import('./pages/encargado/GestionPagos'))
const GestionEntregas = lazy(() => import('./pages/encargado/GestionEntregas'))
const GaleriaEncargado = lazy(() => import('./pages/encargado/GaleriaEncargado'))

// Panel Administrador (Lazy Loaded)
const DashboardAdmin = lazy(() => import('./pages/admin/Dashboard'))
const GestionUsuarios = lazy(() => import('./pages/admin/GestionUsuarios'))
const HistorialCliente = lazy(() => import('./pages/admin/HistorialCliente'))
const GestionCategorias = lazy(() => import('./pages/admin/GestionCategorias'))
const GestionServicios = lazy(() => import('./pages/admin/GestionServicios'))
const Reportes = lazy(() => import('./pages/admin/Reportes'))
const AdminCitas = lazy(() => import('./pages/admin/AdminCitas'))
const AdminDetalleCita = lazy(() => import('./pages/admin/AdminDetalleCita'))
const AdminProductos = lazy(() => import('./pages/admin/AdminProductos'))
const AdminPedidos = lazy(() => import('./pages/admin/AdminPedidos'))
const AdminPagos = lazy(() => import('./pages/admin/AdminPagos'))
const NotFound = lazy(() => import('./pages/NotFound'))

function App() {
  return (
    <ErrorBoundary>
      <Toaster richColors position="top-right" closeButton />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Publicas */}
          <Route path="/" element={<Home />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/producto/:id" element={<DetalleProducto />} />
          <Route path="/mantenimiento" element={<Servicios />} />
          <Route path="/galeria" element={<Galeria />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Cliente */}
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={
            <RutaProtegida roles={['CLIENTE']}>
              <Checkout />
            </RutaProtegida>
          } />
          <Route path="/pedidos" element={
            <RutaProtegida roles={['CLIENTE']}>
              <MisPedidos />
            </RutaProtegida>
          } />
          <Route path="/pedidos/:id" element={
            <RutaProtegida roles={['CLIENTE']}>
              <DetallePedido />
            </RutaProtegida>
          } />
          <Route path="/citas" element={
            <RutaProtegida roles={['CLIENTE']}>
              <MisCitas />
            </RutaProtegida>
          } />
          <Route path="/citas/:id" element={
            <RutaProtegida roles={['CLIENTE']}>
              <DetalleCita />
            </RutaProtegida>
          } />
          <Route path="/agendar-cita" element={
            <RutaProtegida roles={['CLIENTE']}>
              <AgendarCita />
            </RutaProtegida>
          } />
          <Route path="/perfil" element={
            <RutaProtegida roles={['CLIENTE']}>
              <MiPerfil />
            </RutaProtegida>
          } />

          {/* Encargado */}
          <Route path="/encargado/dashboard" element={
            <RutaProtegida roles={['ENCARGADO', 'ADMIN']}>
              <DashboardEncargado />
            </RutaProtegida>
          } />
          <Route path="/encargado/citas" element={
            <RutaProtegida roles={['ENCARGADO', 'ADMIN']}>
              <GestionCitas />
            </RutaProtegida>
          } />
          <Route path="/encargado/citas/:id" element={
            <RutaProtegida roles={['ENCARGADO', 'ADMIN']}>
              <DetalleCitaEncargado />
            </RutaProtegida>
          } />
          <Route path="/encargado/productos" element={
            <RutaProtegida roles={['ENCARGADO', 'ADMIN']}>
              <GestionProductos />
            </RutaProtegida>
          } />
          <Route path="/encargado/venta" element={
            <RutaProtegida roles={['ENCARGADO', 'ADMIN']}>
              <VentaPresencial />
            </RutaProtegida>
          } />
          <Route path="/encargado/pagos" element={
            <RutaProtegida roles={['ENCARGADO', 'ADMIN']}>
              <GestionPagos />
            </RutaProtegida>
          } />
          <Route path="/encargado/entregas" element={
            <RutaProtegida roles={['ENCARGADO', 'ADMIN']}>
              <GestionEntregas />
            </RutaProtegida>
          } />
          <Route path="/encargado/galeria" element={
            <RutaProtegida roles={['ENCARGADO', 'ADMIN']}>
              <GaleriaEncargado />
            </RutaProtegida>
          } />

          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <RutaProtegida roles={['ADMIN']}>
              <DashboardAdmin />
            </RutaProtegida>
          } />

          <Route path="/admin/usuarios" element={
            <RutaProtegida roles={['ADMIN']}>
              <GestionUsuarios />
            </RutaProtegida>
          } />

          <Route path="/admin/usuarios/:id" element={
            <RutaProtegida roles={['ADMIN']}>
              <HistorialCliente />
            </RutaProtegida>
          } />

          <Route path="/admin/categorias" element={
            <RutaProtegida roles={['ADMIN']}>
              <GestionCategorias />
            </RutaProtegida>
          } />

          <Route path="/admin/servicios" element={
            <RutaProtegida roles={['ADMIN']}>
              <GestionServicios />
            </RutaProtegida>
          } />

          <Route path="/admin/reportes" element={
            <RutaProtegida roles={['ADMIN']}>
              <Reportes />
            </RutaProtegida>
          } />

          {/* Admin - rutas compartidas con Encargado */}
          <Route path="/admin/citas" element={
            <RutaProtegida roles={['ADMIN']}>
              <AdminCitas />
            </RutaProtegida>
          } />
          <Route path="/admin/citas/:id" element={
            <RutaProtegida roles={['ADMIN']}>
              <AdminDetalleCita />
            </RutaProtegida>
          } />
          <Route path="/admin/productos" element={
            <RutaProtegida roles={['ADMIN']}>
              <AdminProductos />
            </RutaProtegida>
          } />
          <Route path="/admin/pedidos" element={
            <RutaProtegida roles={['ADMIN']}>
              <AdminPedidos />
            </RutaProtegida>
          } />
          <Route path="/admin/pagos" element={
            <RutaProtegida roles={['ADMIN']}>
              <AdminPagos />
            </RutaProtegida>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App

