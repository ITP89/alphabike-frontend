import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import { getApiErrorMessage } from '../utils/apiError'

function unwrapApiData(response) {
  return response.data?.data ?? response.data
}

export function useApiGet(path, fallbackData = [], fallbackError = 'No se pudo cargar la información') {
  const queryClient = useQueryClient()

  const {
    data: queryData,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['api-get', path],
    queryFn: async () => {
      const response = await api.get(path)
      return unwrapApiData(response)
    },
    enabled: Boolean(path),
  })

  const data = queryData ?? fallbackData
  const loading = isLoading
  const error = queryError ? getApiErrorMessage(queryError, fallbackError) : ''

  const setData = (newData) => {
    queryClient.setQueryData(['api-get', path], newData)
  }

  return {
    data,
    setData,
    loading,
    isFetching,
    error,
    refetch,
  }
}

