import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../utils/apiError'

export default function AsignacionCita({ cita, onChange }) {
  const { usuario } = useAuth()
  const [encargados, setEncargados] = useState([])
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [seleccion, setSeleccion] = useState(cita.encargadoId || '')
  const cerrada = ['COMPLETADO', 'CANCELADO'].includes(cita.estado)
  useEffect(() => {
    if (usuario.rol !== 'ADMIN' || cerrada) return
    let mounted = true
    api.get('/usuarios').then(res => { if (mounted) setEncargados(res.data.data.filter(u => u.rol === 'ENCARGADO' && u.estado === 'ACTIVO')) })
      .catch(err => { if (mounted) setError(getApiErrorMessage(err, 'No se pudieron consultar los encargados')) })
    return () => { mounted = false }
  }, [usuario.rol, cerrada])
  useEffect(() => { setSeleccion(cita.encargadoId || '') }, [cita.encargadoId])
  async function asignar() {
    setOcupado(true); setError('')
    try {
      const response = await api.patch(usuario.rol === 'ADMIN' ? `/citas/${cita.id}/asignar?encargadoId=${encodeURIComponent(seleccion)}` : `/citas/${cita.id}/tomar`)
      onChange(response.data.data)
    } catch (err) { setError(getApiErrorMessage(err, 'No se pudo asignar la cita')) }
    finally { setOcupado(false) }
  }
  return <section className="my-4 rounded-xl border border-slate-200 bg-white p-4">
    <p className="mb-3 text-sm font-semibold">Responsable: {cita.encargadoNombre || 'Sin asignar'}</p>
    {!cerrada && <div className="flex flex-wrap items-center gap-2">
      {usuario.rol === 'ADMIN' && <select aria-label="Encargado de la cita" value={seleccion} onChange={e => setSeleccion(e.target.value)} className="max-w-full rounded-lg border p-2 text-sm"><option value="">Selecciona un encargado</option>{encargados.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}</select>}
      {(usuario.rol === 'ADMIN' || !cita.encargadoId) && <button type="button" disabled={ocupado || (usuario.rol === 'ADMIN' && !seleccion)} onClick={asignar} className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{ocupado ? 'Guardando…' : usuario.rol === 'ADMIN' ? 'Asignar responsable' : 'Tomar cita'}</button>}
    </div>}
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
  </section>
}
