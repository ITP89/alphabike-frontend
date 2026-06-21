import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'

const LABELS_ESTADO = {
  PENDIENTE: { texto: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  EN_PROCESO: { texto: 'En proceso', color: 'bg-blue-100 text-blue-700' },
  COMPLETADO: { texto: 'Completado', color: 'bg-green-100 text-green-700' },
  CANCELADO: { texto: 'Cancelado', color: 'bg-gray-100 text-gray-700' },
}

function MisCitas() {
  const [citas, setCitas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargarCitas() {
      try {
        const response = await api.get('/citas/mias')
        setCitas(response.data.data)
      } catch (err) {
        setError('No se pudieron cargar tus citas')
      } finally {
        setCargando(false)
      }
    }
    cargarCitas()
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Mi cuenta</h3>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/pedidos" className="text-gray-600 hover:text-blue-600">Mis pedidos</Link>
            <Link to="/citas" className="text-gray-900 font-medium">Mis citas</Link>
            <Link to="/perfil" className="text-gray-600 hover:text-blue-600">Mi perfil</Link>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-baseline mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Mis citas</h1>
            <Link
              to="/agendar-cita"
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Agendar nueva cita
            </Link>
          </div>

          {cargando && <p className="text-gray-500 text-sm">Cargando citas...</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          {!cargando && !error && citas.length === 0 && (
            <p className="text-gray-500 text-sm">Aun no tienes citas agendadas.</p>
          )}

          {!cargando && !error && citas.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-4 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500">
                <span>Servicio</span>
                <span>Bicicleta</span>
                <span>Fecha / hora</span>
                <span>Estado</span>
              </div>
              {citas.map((cita) => {
                const estado = LABELS_ESTADO[cita.estado] || { texto: cita.estado, color: 'bg-gray-100 text-gray-700' }
                return (
                  <Link
                    to={`/citas/${cita.id}`}
                    key={cita.id}
                    className="grid grid-cols-4 px-4 py-3 border-t border-gray-200 text-sm items-center hover:bg-gray-50"
                  >
                    <span>{cita.servicioNombre}</span>
                    <span>{cita.biciDescripcion || '—'}</span>
                    <span>{cita.fecha} {cita.hora}</span>
                    <span className={`text-xs px-2 py-1 rounded-md inline-block w-fit ${estado.color}`}>
                      {estado.texto}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default MisCitas