import Navbar from '../components/Navbar'

function Contacto() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="bg-gray-50 px-6 py-10 text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Contacto</h1>
        <p className="text-gray-500 text-sm">Escribenos, te respondemos a la brevedad</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Formulario */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Envianos un mensaje</h3>
          <form className="flex flex-col gap-3">
            <input type="text" placeholder="Nombre" className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
            <input type="email" placeholder="Correo electronico" className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
            <input type="text" placeholder="Telefono / WhatsApp" className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option>Asunto: tienda / mantenimiento / otro</option>
            </select>
            <textarea placeholder="Mensaje" rows="4" className="border border-gray-300 rounded-md px-3 py-2 text-sm"></textarea>
            <button type="submit" className="bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700">
              Enviar mensaje
            </button>
          </form>
        </div>

        {/* Info de contacto */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Informacion de contacto</h3>
          <div className="text-sm text-gray-600 flex flex-col gap-2 mb-6">
            <p>📍 Direccion de la tienda</p>
            <p>📞 Telefono / WhatsApp</p>
            <p>✉️ Correo de contacto</p>
            <p>🕒 Lunes a sabado, 9am - 7pm</p>
          </div>

          <div className="bg-gray-100 h-40 rounded-lg flex items-center justify-center text-gray-400 text-sm mb-6">
            Mapa de ubicacion
          </div>

          <div>
            <p className="text-gray-900 text-sm font-medium mb-2">Siguenos</p>
            <div className="flex gap-3 text-xl">
              <span>📷</span>
              <span>📘</span>
              <span>🎵</span>
              <span>💬</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Contacto