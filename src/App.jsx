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
    </Routes>
  )
}

export default App