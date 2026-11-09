import { createContext, useContext, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from './AuthContext'
import { connectCitas } from '../services/citasSocket'

const RealtimeContext = createContext('desconectado')

export function RealtimeProvider({ children }) {
  const { usuario } = useAuth()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState('desconectado')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!usuario || !token) {
      setStatus('desconectado')
      return
    }
    return connectCitas({
      token,
      onStatus: setStatus,
      onEvent: (event) => {
        queryClient.invalidateQueries({ queryKey: ['api-get'] })
        window.dispatchEvent(new CustomEvent('alphabike:citas-changed', { detail: event }))
        if (event.type === 'CITA_UPDATED' && usuario.rol === 'CLIENTE') {
          toast.info('Tu cita se ha actualizado', { description: 'Ya puedes consultar el avance del taller.' })
        }
      },
    })
  }, [usuario, queryClient])

  return <RealtimeContext.Provider value={status}>{children}</RealtimeContext.Provider>
}

export function useRealtimeStatus() {
  return useContext(RealtimeContext)
}
