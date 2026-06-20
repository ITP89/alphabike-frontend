import Navbar from '../components/Navbar'

function Servicios() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="bg-gray-50 px-6 py-10 text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Servicios de mantenimiento</h1>
        <p className="text-gray-500 text-sm">Contamos con tecnicos especializados para que tu bici siga rodando</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="border border-gray-200 rounded-lg p-5">
            <div className="text-2xl mb-2">⚙️</div>
            <h3 className="font-semibold text-gray-900 mb-1">Mantenimiento general</h3>
            <p className="text-gray-500 text-sm mb-2">Revision completa de la bicicleta</p>
            <p className="text-gray-500 text-xs mb-2">Duracion aprox: 60 min</p>
            <p className="font-semibold text-gray-900 mb-3">Desde S/ 50.00</p>
            <button className="w-full bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700">
              Agendar cita
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-5">
            <div className="text-2xl mb-2">🛑</div>
            <h3 className="font-semibold text-gray-900 mb-1">Cambio de frenos</h3>
            <p className="text-gray-500 text-sm mb-2">Revision y cambio de pastillas o discos</p>
            <p className="text-gray-500 text-xs mb-2">Duracion aprox: 45 min</p>
            <p className="font-semibold text-gray-900 mb-3">Desde S/ 40.00</p>
            <button className="w-full bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700">
              Agendar cita
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-5">
            <div className="text-2xl mb-2">🔧</div>
            <h3 className="font-semibold text-gray-900 mb-1">Ajuste de cambios</h3>
            <p className="text-gray-500 text-sm mb-2">Calibracion del sistema de cambios</p>
            <p className="text-gray-500 text-xs mb-2">Duracion aprox: 30 min</p>
            <p className="font-semibold text-gray-900 mb-3">Desde S/ 30.00</p>
            <button className="w-full bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700">
              Agendar cita
            </button>
          </div>

        </div>
      </div>

      <div className="bg-gray-50 px-6 py-10 text-center">
        <p className="text-gray-500 text-sm mb-3">
          El precio final puede variar segun diagnostico. Te enviaremos una cotizacion antes de proceder.
        </p>
        <button className="bg-blue-600 text-white text-sm px-5 py-2 rounded-md hover:bg-blue-700">
          Agendar una cita
        </button>
      </div>
    </div>
  )
}

export default Servicios