import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center">
        <p className="mb-2 text-sm font-medium text-blue-700">404</p>
        <h1 className="text-2xl font-semibold text-gray-950">Pagina no encontrada</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          La ruta que intentas abrir no existe o fue movida.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al inicio
        </Link>
      </main>
    </div>
  )
}

export default NotFound
