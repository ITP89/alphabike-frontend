import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Tienda from './pages/Tienda'
import DetalleProducto from './pages/DetalleProducto'
import Login from './pages/Login'
import Servicios from './pages/Servicios'
import Galeria from './pages/Galeria'
import Contacto from './pages/Contacto'
import Registro from './pages/Registro'
import Carrito from './pages/Carrito'
import Checkout from './pages/Checkout'
import DetallePedido from './pages/DetallePedido'
import MisPedidos from './pages/MisPedidos'
import AgendarCita from './pages/AgendarCita'
import DetalleCita from './pages/DetalleCita'
import MisCitas from './pages/MisCitas'
import MiPerfil from './pages/MiPerfil'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tienda" element={<Tienda />} />
      <Route path="/producto/:id" element={<DetalleProducto />} />
      <Route path="/login" element={<Login />} />
      <Route path="/mantenimiento" element={<Servicios />} />
      <Route path="/galeria" element={<Galeria />} />
      <Route path="/contacto" element={<Contacto />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/carrito" element={<Carrito />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/pedidos/:id" element={<DetallePedido />} />
      <Route path="/pedidos" element={<MisPedidos />} />
      <Route path="/agendar-cita" element={<AgendarCita />} />
      <Route path="/citas/:id" element={<DetalleCita />} />
      <Route path="/citas" element={<MisCitas />} />
      <Route path="/perfil" element={<MiPerfil />} />
    </Routes>
  )
}

export default App