import { useEffect } from 'react'

export function useCitasRefresh(refresh, citaId) {
  useEffect(() => {
    function onChange({ detail }) {
      if (!citaId || detail.type === 'CITAS_SYNC' || detail.citaId === citaId) refresh()
    }
    window.addEventListener('alphabike:citas-changed', onChange)
    return () => window.removeEventListener('alphabike:citas-changed', onChange)
  }, [refresh, citaId])
}
