import { Routes, Route } from 'react-router-dom'
import RutaProtegida from './components/RutaProtegida'
import Home from './pages/Home'
import Tienda from './pages/Tienda'
import DetalleProducto from './pages/DetalleProducto'
import Servicios from './pages/Servicios'
import Galeria from './pages/Galeria'
import Contacto from './pages/Contacto'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Carrito from './pages/Carrito'
import Checkout from './pages/Checkout'
import MisPedidos from './pages/MisPedidos'
import DetallePedido from './pages/DetallePedido'
import AgendarCita from './pages/AgendarCita'
import MisCitas from './pages/MisCitas'
import DetalleCita from './pages/DetalleCita'
import MiPerfil from './pages/MiPerfil'
import DashboardEncargado from './pages/encargado/Dashboard'
import GestionCitas from './pages/encargado/GestionCitas'
import DetalleCitaEncargado from './pages/encargado/DetalleCitaEncargado'
import GestionProductos from './pages/encargado/GestionProductos'
import VentaPresencial from './pages/encargado/VentaPresencial'
import GestionPagos from './pages/encargado/GestionPagos'
import GestionEntregas from './pages/encargado/GestionEntregas'
import GaleriaEncargado from './pages/encargado/GaleriaEncargado'
import DashboardAdmin from './pages/admin/Dashboard'
import GestionUsuarios from './pages/admin/GestionUsuarios'
import HistorialCliente from './pages/admin/HistorialCliente'
import GestionCategorias from './pages/admin/GestionCategorias'
import GestionServicios from './pages/admin/GestionServicios'
import Reportes from './pages/admin/Reportes'
import AdminCitas from './pages/admin/AdminCitas'
import AdminDetalleCita from './pages/admin/AdminDetalleCita'
import AdminProductos from './pages/admin/AdminProductos'
import AdminPedidos from './pages/admin/AdminPedidos'
import AdminPagos from './pages/admin/AdminPagos'
import NotFound from './pages/NotFound'

function App() {
  return (
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
  )
}

export default App
