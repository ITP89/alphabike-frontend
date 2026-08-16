import { useState, useEffect } from 'react'
import api from '../../api/axios'
import LayoutAdmin from '../../components/LayoutAdmin'

function Reportes() {
  const [ventas, setVentas] = useState(null)
  const [descuentos, setDescuentos] = useState([])
  const [productosPopulares, setProductosPopulares] = useState([])
  const [serviciosPopulares, setServiciosPopulares] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarReportes() {
      try {
        const [ventasRes, descuentosRes, productosRes, serviciosRes] = await Promise.all([
          api.get('/reportes/ventas'),
          api.get('/reportes/descuentos'),
          api.get('/reportes/productos-populares'),
          api.get('/reportes/servicios-populares'),
        ])
        setVentas(ventasRes.data.data)
        setDescuentos(descuentosRes.data.data)
        setProductosPopulares(productosRes.data.data)
        setServiciosPopulares(serviciosRes.data.data)
      } catch (err) {
        console.error('Error cargando reportes', err)
      } finally {
        setCargando(false)
      }
    }
    cargarReportes()
  }, [])

  return (
    <LayoutAdmin>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Reportes</h1>

      {cargando ? (
        <p className="text-gray-500 text-sm">Cargando reportes...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-gray-500 text-sm">Ingresos totales</p>
              <p className="text-2xl font-semibold text-gray-900">
                S/ {Number(ventas?.ingresosTotales || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Pedidos + servicios</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-gray-500 text-sm">Total descuentos otorgados</p>
              <p className="text-2xl font-semibold text-gray-900">
                S/ {Number(ventas?.totalDescuentos || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Precio lista - precio acordado</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-gray-500 text-sm">Citas completadas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {ventas?.totalCitas || 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">Total acumulado</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Productos mas vendidos</h3>
              {productosPopulares.length === 0 && (
                <p className="text-gray-500 text-sm">Sin datos aun</p>
              )}
              {productosPopulares.map((p, i) => (
                <div key={p.productoId} className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <span className="text-gray-900">{i + 1}. {p.productoNombre}</span>
                  <span className="text-gray-500">{p.totalVendido} vendidos</span>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Servicios mas solicitados</h3>
              {serviciosPopulares.length === 0 && (
                <p className="text-gray-500 text-sm">Sin datos aun</p>
              )}
              {serviciosPopulares.map((s, i) => (
                <div key={s.servicioId} className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <span className="text-gray-900">{i + 1}. {s.servicioNombre}</span>
                  <span className="text-gray-500">{s.totalCitas} citas</span>
                </div>
              ))}
            </div>

          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Descuentos por encargado</h3>
            {descuentos.length === 0 && (
              <p className="text-gray-500 text-sm">Sin encargados registrados aun</p>
            )}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {descuentos.length > 0 && (
                <>
                  <div className="grid grid-cols-4 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500">
                    <span>Encargado</span>
                    <span>Ventas</span>
                    <span>Total descuentos</span>
                    <span>Promedio por venta</span>
                  </div>
                  {descuentos.map((d) => (
                    <div key={d.encargadoId} className="grid grid-cols-4 px-4 py-3 border-t border-gray-200 text-sm items-center">
                      <span className="text-gray-900">{d.encargadoNombre}</span>
                      <span>{d.totalVentas}</span>
                      <span>S/ {Number(d.totalDescuentos).toFixed(2)}</span>
                      <span>S/ {Number(d.promedioDescuento).toFixed(2)}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </LayoutAdmin>
  )
}

export default Reportes