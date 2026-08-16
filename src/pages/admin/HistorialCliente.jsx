import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import LayoutAdmin from '../../components/LayoutAdmin'

function HistorialCliente() {
  const { id } = useParams()
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargarHistorial() {
      try {
        const response = await api.get(`/usuarios/${id}/historial`)
        setDatos(response.data.data)
      } catch (err) {
        setError('No se pudo cargar el historial')
      } finally {
        setCargando(false)
      }
    }
    cargarHistorial()
  }, [id])

  if (cargando) return <LayoutAdmin><p className="text-gray-500">Cargando...</p></LayoutAdmin>
  if (error) return <LayoutAdmin><p className="text-red-600">{error}</p></LayoutAdmin>

  const { usuario, pedidos, citas } = datos

  return (
    <LayoutAdmin>
      <Link to="/admin/usuarios" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        ← Volver a usuarios
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
              {usuario.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div>
              <p className="text-gray-900 font-medium">{usuario.nombre}</p>
              <p className="text-gray-500 text-xs">{usuario.email}</p>
            </div>
            <span className={`ml-auto text-xs px-2 py-1 rounded-md ${
              usuario.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {usuario.estado}
            </span>
          </div>
          <p className="text-sm text-gray-600">Tel: {usuario.telefono}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-semibold text-gray-900">{pedidos.length}</p>
            <p className="text-gray-500 text-xs">Pedidos</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-semibold text-gray-900">{citas.length}</p>
            <p className="text-gray-500 text-xs">Citas</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-semibold text-gray-900">
              S/ {pedidos.reduce((sum, p) => sum + Number(p.total), 0).toFixed(0)}
            </p>
            <p className="text-gray-500 text-xs">Total gastado</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 font-semibold text-gray-900 text-sm">Pedidos</div>
          <div className="grid grid-cols-5 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 border-t border-gray-200">
            <span>Pedido</span><span>Fecha</span><span>Total</span><span>Entrega</span><span>Estado</span>
          </div>
          {pedidos.length === 0 && <p className="text-gray-500 text-sm px-4 py-3">Sin pedidos</p>}
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="grid grid-cols-5 px-4 py-3 border-t border-gray-200 text-sm items-center">
              <span>#{pedido.id.slice(0, 8)}</span>
              <span>{new Date(pedido.fecha).toLocaleDateString('es-PE')}</span>
              <span>S/ {Number(pedido.total).toFixed(2)}</span>
              <span>{pedido.tipoEntrega}</span>
              <span className={`text-xs px-2 py-1 rounded-md inline-block w-fit ${
                pedido.estado === 'ENTREGADO' ? 'bg-green-100 text-green-700' :
                pedido.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {pedido.estado}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 font-semibold text-gray-900 text-sm">Citas</div>
          <div className="grid grid-cols-5 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 border-t border-gray-200">
            <span>Servicio</span><span>Fecha</span><span>Encargado</span><span>Estado</span><span>Cita</span>
          </div>
          {citas.length === 0 && <p className="text-gray-500 text-sm px-4 py-3">Sin citas</p>}
          {citas.map((cita) => (
            <div key={cita.id} className="grid grid-cols-5 px-4 py-3 border-t border-gray-200 text-sm items-center">
              <span>{cita.servicioNombre}</span>
              <span>{cita.fecha}</span>
              <span>{cita.encargadoNombre || '—'}</span>
              <span className={`text-xs px-2 py-1 rounded-md inline-block w-fit ${
                cita.estado === 'COMPLETADO' ? 'bg-green-100 text-green-700' :
                cita.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {cita.estado}
              </span>
              <Link to={`/encargado/citas/${cita.id}`} className="text-xs text-blue-600 hover:underline">
                Ver
              </Link>
            </div>
          ))}
        </div>

      </div>
    </LayoutAdmin>
  )
}

export default HistorialCliente