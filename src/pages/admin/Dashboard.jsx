import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import LayoutAdmin from '../../components/LayoutAdmin'

function DashboardAdmin() {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [usuariosRes, pedidosRes, citasRes, pagosRes] = await Promise.all([
          api.get('/usuarios'),
          api.get('/pedidos'),
          api.get('/citas'),
          api.get('/pagos'),
        ])
        setDatos({
          usuarios: usuariosRes.data.data,
          pedidos: pedidosRes.data.data,
          citas: citasRes.data.data,
          pagos: pagosRes.data.data,
        })
      } catch (err) {
        console.error('Error cargando dashboard admin', err)
      } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [])

  const ingresos = datos?.pagos
    .filter((p) => p.estado === 'PAGADO')
    .reduce((sum, p) => sum + Number(p.monto), 0) || 0

  const productosStockBajo = datos?.pedidos
    .flatMap((p) => p.detalles || [])
    .filter((d) => d) || []

  return (
    <LayoutAdmin>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Resumen general</h1>

      {cargando ? (
        <p className="text-gray-500 text-sm">Cargando...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-gray-500 text-sm">Ingresos totales</p>
              <p className="text-2xl font-semibold text-gray-900">S/ {ingresos.toFixed(2)}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-gray-500 text-sm">Total pedidos</p>
              <p className="text-2xl font-semibold text-gray-900">{datos.pedidos.length}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-gray-500 text-sm">Total citas</p>
              <p className="text-2xl font-semibold text-gray-900">{datos.citas.length}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-gray-500 text-sm">Clientes registrados</p>
              <p className="text-2xl font-semibold text-gray-900">
                {datos.usuarios.filter((u) => u.rol === 'CLIENTE').length}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-baseline mb-3">
                <h3 className="font-semibold text-gray-900">Ultimas citas</h3>
                <Link to="/admin/citas" className="text-blue-600 text-xs hover:underline">Ver todas</Link>
              </div>
              {datos.citas.slice(0, 5).map((cita) => (
                <div key={cita.id} className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <div>
                    <p className="text-gray-900">{cita.clienteNombre}</p>
                    <p className="text-gray-500 text-xs">{cita.servicioNombre} | {cita.fecha}</p>
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
                <h3 className="font-semibold text-gray-900">Ultimos pedidos</h3>
                <Link to="/admin/pedidos" className="text-blue-600 text-xs hover:underline">Ver todos</Link>
              </div>
              {datos.pedidos.slice(0, 5).map((pedido) => (
                <div key={pedido.id} className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <div>
                    <p className="text-gray-900">#{pedido.id.slice(0, 8)}</p>
                    <p className="text-gray-500 text-xs">{pedido.clienteNombre} | S/ {Number(pedido.total).toFixed(2)}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-md ${
                    pedido.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' :
                    pedido.estado === 'ENTREGADO' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {pedido.estado}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </>
      )}
    </LayoutAdmin>
  )
}

export default DashboardAdmin