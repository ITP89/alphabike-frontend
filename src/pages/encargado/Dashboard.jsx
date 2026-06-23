import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import LayoutEncargado from '../../components/LayoutEncargado'

function DashboardEncargado() {
  const [citas, setCitas] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [citasRes, pedidosRes] = await Promise.all([
          api.get('/citas'),
          api.get('/pedidos'),
        ])
        setCitas(citasRes.data.data)
        setPedidos(pedidosRes.data.data)
      } catch (err) {
        console.error('Error cargando dashboard', err)
      } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [])

  const citasPendientes = citas.filter((c) => c.estado === 'PENDIENTE')
  const citasEnProceso = citas.filter((c) => c.estado === 'EN_PROCESO')
  const pedidosPendientes = pedidos.filter((p) => p.estado === 'PENDIENTE')

  return (
    <LayoutEncargado>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        Hola, bienvenido al panel
      </h1>

      {cargando ? (
        <p className="text-gray-500 text-sm">Cargando...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-gray-500 text-sm">Citas pendientes</p>
              <p className="text-2xl font-semibold text-gray-900">{citasPendientes.length}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-gray-500 text-sm">Citas en proceso</p>
              <p className="text-2xl font-semibold text-gray-900">{citasEnProceso.length}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-gray-500 text-sm">Pedidos pendientes</p>
              <p className="text-2xl font-semibold text-gray-900">{pedidosPendientes.length}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-gray-500 text-sm">Total citas hoy</p>
              <p className="text-2xl font-semibold text-gray-900">{citas.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-baseline mb-3">
                <h3 className="font-semibold text-gray-900">Citas recientes</h3>
                <Link to="/encargado/citas" className="text-blue-600 text-xs hover:underline">Ver todas</Link>
              </div>
              {citas.slice(0, 4).map((cita) => (
                <div key={cita.id} className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <div>
                    <p className="text-gray-900">{cita.clienteNombre}</p>
                    <p className="text-gray-500 text-xs">{cita.servicioNombre}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-md ${
                    cita.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' :
                    cita.estado === 'EN_PROCESO' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {cita.estado}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-baseline mb-3">
                <h3 className="font-semibold text-gray-900">Pedidos por atender</h3>
                <Link to="/encargado/entregas" className="text-blue-600 text-xs hover:underline">Ver todos</Link>
              </div>
              {pedidosPendientes.slice(0, 4).map((pedido) => (
                <div key={pedido.id} className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <div>
                    <p className="text-gray-900">#{pedido.id.slice(0, 8)}</p>
                    <p className="text-gray-500 text-xs">{pedido.clienteNombre} — {pedido.tipoEntrega}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-md bg-yellow-100 text-yellow-700">
                    Pendiente
                  </span>
                </div>
              ))}
              {pedidosPendientes.length === 0 && (
                <p className="text-gray-500 text-sm">Sin pedidos pendientes</p>
              )}
            </div>

          </div>
        </>
      )}
    </LayoutEncargado>
  )
}

export default DashboardEncargado