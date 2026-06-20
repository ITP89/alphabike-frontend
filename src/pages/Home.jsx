import Navbar from '../components/Navbar'

function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <div className="relative h-[400px] bg-gray-900 flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        <div className="relative text-center px-6">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Venta y mantenimiento de bicicletas
          </h1>
          <p className="text-white text-lg mb-6">
            Todo lo que tu bici necesita, en un solo lugar
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              Ver tienda
            </button>
            <button className="bg-white text-gray-900 px-6 py-2 rounded-md hover:bg-gray-100">
              Agendar mantenimiento
            </button>
          </div>
        </div>
      </div>
      {/* Que ofrecemos */}
      <div className="px-6 py-12 max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Que ofrecemos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">🚲</div>
            <h3 className="font-semibold text-gray-900">Tienda</h3>
            <p className="text-gray-500 text-sm">Accesorios y repuestos</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">🔧</div>
            <h3 className="font-semibold text-gray-900">Mantenimiento</h3>
            <p className="text-gray-500 text-sm">Agenda tu cita</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">📷</div>
            <h3 className="font-semibold text-gray-900">Trabajos realizados</h3>
            <p className="text-gray-500 text-sm">Ver galeria</p>
          </div>
        </div>
      </div>
      {/* Productos destacados */}
      <div className="px-6 py-12 max-w-6xl mx-auto">
        <div className="flex justify-between items-baseline mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Productos destacados</h2>
          <a href="/tienda" className="text-blue-600 text-sm hover:underline">Ver todo &gt;</a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-gray-200 rounded-lg p-3">
            <div className="bg-gray-100 h-24 rounded-md mb-2 flex items-center justify-center text-gray-400">
              📷
            </div>
            <p className="text-gray-900 text-sm font-medium">Producto</p>
            <p className="text-gray-500 text-sm">S/ 00.00</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <div className="bg-gray-100 h-24 rounded-md mb-2 flex items-center justify-center text-gray-400">
              📷
            </div>
            <p className="text-gray-900 text-sm font-medium">Producto</p>
            <p className="text-gray-500 text-sm">S/ 00.00</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <div className="bg-gray-100 h-24 rounded-md mb-2 flex items-center justify-center text-gray-400">
              📷
            </div>
            <p className="text-gray-900 text-sm font-medium">Producto</p>
            <p className="text-gray-500 text-sm">S/ 00.00</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <div className="bg-gray-100 h-24 rounded-md mb-2 flex items-center justify-center text-gray-400">
              📷
            </div>
            <p className="text-gray-900 text-sm font-medium">Producto</p>
            <p className="text-gray-500 text-sm">S/ 00.00</p>
          </div>
        </div>
      </div>
      {/* Trabajos realizados */}
      <div className="px-6 py-12 max-w-6xl mx-auto">
        <div className="flex justify-between items-baseline mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Trabajos realizados</h2>
          <a href="/galeria" className="text-blue-600 text-sm hover:underline">Ver galeria &gt;</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center text-gray-400">
            📷
          </div>
          <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center text-gray-400">
            📷
          </div>
          <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center text-gray-400">
            📷
          </div>
        </div>
      </div>
      {/* Ubicacion y contacto */}
      <div className="px-6 py-12 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Ubicacion y horarios</h3>
          <p className="text-gray-500 text-sm">Direccion de la tienda</p>
          <p className="text-gray-500 text-sm mb-3">Lunes a sabado, 9am - 7pm</p>
          <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center text-gray-400 text-sm">
            Mapa
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Contacto rapido</h3>
          <p className="text-gray-500 text-sm">Telefono / WhatsApp</p>
          <p className="text-gray-500 text-sm mb-3">Redes sociales</p>
          
          <a  href="/contacto"
            className="inline-block bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Ir a contacto
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        ALPHA BIKE — Tienda | Mantenimiento | Galeria | Contacto | Terminos
      </footer>
      
    </div>
  )
}

export default Home