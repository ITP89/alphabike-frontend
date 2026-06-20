import Navbar from '../components/Navbar'

function Galeria() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="bg-gray-50 px-6 py-10 text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Trabajos realizados</h1>
        <p className="text-gray-500 text-sm">Algunos de los trabajos que hemos hecho para nuestros clientes</p>
      </div>

      <div className="px-6 py-4 border-b border-gray-200 flex gap-2 flex-wrap max-w-6xl mx-auto">
        <button className="text-sm border border-gray-300 rounded-md px-3 py-1.5">Todos</button>
        <button className="text-sm border border-gray-300 rounded-md px-3 py-1.5">Mantenimiento general</button>
        <button className="text-sm border border-gray-300 rounded-md px-3 py-1.5">Frenos</button>
        <button className="text-sm border border-gray-300 rounded-md px-3 py-1.5">Pintura / personalizacion</button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-2">
              <div className="bg-gray-100 h-28 flex items-center justify-center text-gray-400 text-xs border-r border-gray-200">Antes</div>
              <div className="bg-gray-100 h-28 flex items-center justify-center text-gray-400 text-xs">Despues</div>
            </div>
            <div className="p-3">
              <p className="text-gray-900 text-sm font-medium">Titulo del trabajo</p>
              <p className="text-gray-500 text-xs">Descripcion breve | fecha</p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-2">
              <div className="bg-gray-100 h-28 flex items-center justify-center text-gray-400 text-xs border-r border-gray-200">Antes</div>
              <div className="bg-gray-100 h-28 flex items-center justify-center text-gray-400 text-xs">Despues</div>
            </div>
            <div className="p-3">
              <p className="text-gray-900 text-sm font-medium">Titulo del trabajo</p>
              <p className="text-gray-500 text-xs">Descripcion breve | fecha</p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-2">
              <div className="bg-gray-100 h-28 flex items-center justify-center text-gray-400 text-xs border-r border-gray-200">Antes</div>
              <div className="bg-gray-100 h-28 flex items-center justify-center text-gray-400 text-xs">Despues</div>
            </div>
            <div className="p-3">
              <p className="text-gray-900 text-sm font-medium">Titulo del trabajo</p>
              <p className="text-gray-500 text-xs">Descripcion breve | fecha</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Galeria