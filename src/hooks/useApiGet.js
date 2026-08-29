import { useCallback, useEffect, useRef, useState } from 'react'
import api from '../api/axios'
import { getApiErrorMessage } from '../utils/apiError'

function unwrapApiData(response) {
  return response.data?.data ?? response.data
}

export function useApiGet(path, fallbackData = [], fallbackError = 'No se pudo cargar la informacion') {
  const fallbackRef = useRef(fallbackData)
  const [data, setData] = useState(fallbackData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refetch = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get(path)
      setData(unwrapApiData(response) ?? fallbackRef.current)
    } catch (err) {
      setError(getApiErrorMessage(err, fallbackError))
      setData(fallbackRef.current)
    } finally {
      setLoading(false)
    }
  }, [fallbackError, path])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, setData, loading, error, refetch }
}
