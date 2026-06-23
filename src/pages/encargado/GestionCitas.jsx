import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import LayoutEncargado from '../../components/LayoutEncargado'

const LABELS_ESTADO = {
  PENDIENTE: { texto: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  EN_PROCESO: { texto: 'En proceso', color: 'bg-blue-100 text-blue-700' },
  COMPLETADO: { texto: 'Completado', color: 'bg-green-100 text-green-700' },
  CANCELADO: { texto: 'Cancelado', color: 'bg-gray-100 text-gray-700' },
}

function GestionCitas() {
  const [citas, setCitas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    async function cargarCitas() {
      try {
        const response = await api.get('/citas')
        setCitas(response.data.data)
      } catch (err) {
        console.error('Error cargando citas', err)
      } finally {
        setCargando(false)
      }
    }
    cargarCitas()
  }, [])

  const citasFiltradas = citas.filter((c) => {
    const coincideEstado = filtroEstado ? c.estado === filtroEstado : true
    const coincideBusqueda = busqueda
      ? c.clienteNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.servicioNombre.toLowerCase().includes(busqueda.toLowerCase())
      : true
    return coincideEstado && coincideBusqueda
  })

  async function cambiarEstado(id, estado) {
    try {
      const response = await api.patch(`/citas/${id}/estado?estado=${estado}`)
      setCitas((prev) =>
        prev.map((c) => (c.id === id ? response.data.data : c))
      )
    } catch (err) {
      console.error('Error cambiando estado', err)
    }
  }

  return (
    <LayoutEncargado>
      <div className="flex justify-between items-baseline mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Gestion de citas</h1>
      </div>

      <div className="flex gap-3 mb-4">
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
        >
          <option value="">Estado: todos</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PROCESO">En proceso</option>
          <option value="COMPLETADO">Completado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
        <input
          type="text"
          placeholder="Buscar cliente o servicio"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1"
        />
      </div>

      {cargando ? (
        <p className="text-gray-500 text-sm">Cargando citas...</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-6 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500">
            <span>Fecha/hora</span>
            <span>Cliente</span>
            <span>Servicio</span>
            <span>Bicicleta</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>

          {citasFiltradas.length === 0 && (
            <p className="text-gray-500 text-sm px-4 py-3">No hay citas que mostrar</p>
          )}

          {citasFiltradas.map((cita) => {
            const estado = LABELS_ESTADO[cita.estado] || { texto: cita.estado, color: 'bg-gray-100' }
            return (
              <div key={cita.id} className="grid grid-cols-6 px-4 py-3 border-t border-gray-200 text-sm items-center">
                <span>{cita.fecha} {cita.hora}</span>
                <span>{cita.clienteNombre}</span>
                <span>{cita.servicioNombre}</span>
                <span>{cita.biciDescripcion || '—'}</span>
                <span className={`text-xs px-2 py-1 rounded-md inline-block w-fit ${estado.color}`}>
                  {estado.texto}
                </span>
                <div className="flex gap-2 items-center">
                  {cita.estado === 'PENDIENTE' && (
                    <button
                      onClick={() => cambiarEstado(cita.id, 'EN_PROCESO')}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700"
                    >
                      Iniciar
                    </button>
                  )}
                  {cita.estado === 'EN_PROCESO' && (
                    <button
                      onClick={() => cambiarEstado(cita.id, 'COMPLETADO')}
                      className="text-xs bg-green-600 text-white px-2 py-1 rounded-md hover:bg-green-700"
                    >
                      Completar
                    </button>
                  )}
                  <Link
                    to={`/encargado/citas/${cita.id}`}
                    className="text-xs border border-gray-300 px-2 py-1 rounded-md hover:bg-gray-50"
                  >
                    Ver
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </LayoutEncargado>
  )
}

export default GestionCitas