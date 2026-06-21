import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Navbar from '../components/Navbar'

function AgendarCita() {
  const { usuario } = useAuth()
  const navigate = useNavigate()

  const [servicios, setServicios] = useState([])
  const [servicioId, setServicioId] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [biciDescripcion, setBiciDescripcion] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargarServicios() {
      try {
        const response = await api.get('/servicios')
        setServicios(response.data.data)
      } catch (err) {
        setError('No se pudieron cargar los servicios')
      }
    }
    cargarServicios()
  }, [])

  const servicioSeleccionado = servicios.find((s) => s.id === servicioId)

  if (!usuario) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">Debes iniciar sesion para agendar una cita</p>
          <Link to="/login" className="text-blue-600 hover:underline text-sm">
            Iniciar sesion
          </Link>
        </div>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!servicioId || !fecha || !hora) {
      setError('Completa el servicio, fecha y hora')
      return
    }

    setCargando(true)

    try {
      const response = await api.post('/citas', {
        servicioId,
        fecha,
        hora: hora + ':00',
        biciDescripcion,
        observaciones,
      })
      navigate(`/citas/${response.data.data.id}`)
    } catch (err) {
      setError('No se pudo agendar la cita. Intenta nuevamente.')
    } finally {
      setCargando(false)
    }
  }

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
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Agendar cita de mantenimiento</h1>
          <p className="text-gray-500 text-sm mb-6">Cuentanos sobre tu bici y elige el horario que mas te acomode</p>

          {error && (
            <p className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-md mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">

            <div className="flex flex-col gap-4">

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Servicio</h3>
                <select
                  value={servicioId}
                  onChange={(e) => setServicioId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Selecciona un servicio</option>
                  {servicios.map((s) => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
                {servicioSeleccionado && (
                  <p className="text-gray-500 text-xs mt-2">
                    Precio referencial: S/ {servicioSeleccionado.precioBase.toFixed(2)} (puede variar segun diagnostico)
                  </p>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Datos de la bicicleta</h3>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Marca y modelo"
                    value={biciDescripcion}
                    onChange={(e) => setBiciDescripcion(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <textarea
                    placeholder="Describe el problema o que necesitas (opcional)"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    rows="3"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  ></textarea>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Fecha y hora</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <input
                    type="time"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>

            </div>

            <div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Resumen de la cita</h3>
                <p className="text-sm text-gray-600 mb-1">
                  Servicio: {servicioSeleccionado?.nombre || '—'}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Bicicleta: {biciDescripcion || '—'}
                </p>
                <p className="text-sm text-gray-600 mb-1">Fecha: {fecha || '—'}</p>
                <p className="text-sm text-gray-600 mb-4">Hora: {hora || '—'}</p>

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {cargando ? 'Agendando...' : 'Confirmar cita'}
                </button>
                <p className="text-center text-xs text-gray-500 mt-2">
                  Recibiras la cotizacion final luego del diagnostico
                </p>
              </div>
            </div>

          </form>
        </div>

      </div>
    </div>
  )
}

export default AgendarCita