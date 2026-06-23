import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import LayoutEncargado from '../../components/LayoutEncargado'

function DetalleCitaEncargado() {
  const { id } = useParams()
  const [cita, setCita] = useState(null)
  const [cotizacion, setCotizacion] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [descCotizacion, setDescCotizacion] = useState('')
  const [montoCotizacion, setMontoCotizacion] = useState('')
  const [guardandoCotizacion, setGuardandoCotizacion] = useState(false)

  const [metodoPago, setMetodoPago] = useState('EFECTIVO')
  const [registrandoPago, setRegistrandoPago] = useState(false)

  useEffect(() => {
    async function cargarDatos() {
      try {
        const citaRes = await api.get(`/citas/${id}`)
        setCita(citaRes.data.data)

        try {
          const cotRes = await api.get(`/cotizaciones/cita/${id}`)
          setCotizacion(cotRes.data.data)
          setDescCotizacion(cotRes.data.data.descripcion)
          setMontoCotizacion(cotRes.data.data.monto)
        } catch {
          setCotizacion(null)
        }
      } catch (err) {
        setError('No se pudo cargar la cita')
      } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [id])

  async function cambiarEstado(estado) {
    try {
      const response = await api.patch(`/citas/${id}/estado?estado=${estado}`)
      setCita(response.data.data)
    } catch (err) {
      console.error('Error cambiando estado', err)
    }
  }

  async function handleGuardarCotizacion(e) {
    e.preventDefault()
    setGuardandoCotizacion(true)
    try {
      const response = await api.post(`/cotizaciones/cita/${id}`, {
        descripcion: descCotizacion,
        monto: parseFloat(montoCotizacion),
      })
      setCotizacion(response.data.data)
    } catch (err) {
      console.error('Error guardando cotizacion', err)
    } finally {
      setGuardandoCotizacion(false)
    }
  }

  async function handleRegistrarPago() {
    if (!cotizacion) return
    setRegistrandoPago(true)
    try {
      await api.post('/pagos', {
        referenciaTipo: 'COTIZACION',
        referenciaId: cotizacion.id,
        monto: cotizacion.monto,
        metodoPago,
      })
      alert('Pago registrado correctamente')
    } catch (err) {
      console.error('Error registrando pago', err)
    } finally {
      setRegistrandoPago(false)
    }
  }

  if (cargando) return <LayoutEncargado><p className="text-gray-500">Cargando...</p></LayoutEncargado>
  if (error) return <LayoutEncargado><p className="text-red-600">{error}</p></LayoutEncargado>

  return (
    <LayoutEncargado>
      <Link to="/encargado/citas" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        ← Volver a citas
      </Link>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          {cita.servicioNombre} — {cita.clienteNombre}
        </h1>
        <select
          value={cita.estado}
          onChange={(e) => cambiarEstado(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
        >
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PROCESO">En proceso</option>
          <option value="COMPLETADO">Completado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="flex flex-col gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Informacion de la cita</h3>
            <p className="text-sm text-gray-600">Cliente: {cita.clienteNombre}</p>
            <p className="text-sm text-gray-600">Bicicleta: {cita.biciDescripcion || '—'}</p>
            <p className="text-sm text-gray-600">Fecha: {cita.fecha} {cita.hora}</p>
            <p className="text-sm text-gray-600">Descripcion: {cita.observaciones || '—'}</p>
            <p className="text-sm text-gray-600">Encargado: {cita.encargadoNombre || 'Sin asignar'}</p>
          </div>

          <form onSubmit={handleGuardarCotizacion} className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Cotizacion</h3>
            <textarea
              placeholder="Descripcion del trabajo a realizar"
              value={descCotizacion}
              onChange={(e) => setDescCotizacion(e.target.value)}
              rows="3"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-2"
            />
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Monto S/"
                value={montoCotizacion}
                onChange={(e) => setMontoCotizacion(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-36"
              />
              <button
                type="submit"
                disabled={guardandoCotizacion}
                className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {guardandoCotizacion ? 'Guardando...' : 'Enviar cotizacion'}
              </button>
            </div>
            {cotizacion && (
              <p className="text-xs text-gray-500 mt-2">
                Estado: {cotizacion.estado}
              </p>
            )}
          </form>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Registrar pago</h3>
            {cotizacion ? (
              <>
                <p className="text-sm text-gray-600 mb-2">Monto: S/ {Number(cotizacion.monto).toFixed(2)}</p>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-3 bg-white"
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="YAPE">Yape / Plin</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select>
                <button
                  onClick={handleRegistrarPago}
                  disabled={registrandoPago}
                  className="w-full bg-green-600 text-white text-sm py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {registrandoPago ? 'Registrando...' : 'Registrar pago'}
                </button>
              </>
            ) : (
              <p className="text-gray-500 text-sm">Genera una cotizacion primero</p>
            )}
          </div>
        </div>

      </div>
    </LayoutEncargado>
  )
}

export default DetalleCitaEncargado