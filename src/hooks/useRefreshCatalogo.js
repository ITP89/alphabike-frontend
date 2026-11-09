import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

const resources = ['/productos', '/categorias', '/servicios', '/trabajos']

export function useRefreshCatalogo() {
  const queryClient = useQueryClient()
  return useCallback(() => queryClient.invalidateQueries({
    predicate: ({ queryKey }) => queryKey[0] === 'api-get' && resources.some(
      path => typeof queryKey[1] === 'string' && (queryKey[1] === path || queryKey[1].startsWith(`${path}/`)),
    ),
  }), [queryClient])
}
