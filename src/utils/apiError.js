export function getApiErrorMessage(error, fallback = 'Ocurrio un problema. Intenta nuevamente.') {
  if (!error?.response) {
    return 'No se pudo conectar con el backend. Verifica que este encendido.'
  }

  if (error.response.status >= 500) {
    return fallback
  }

  return error.response.data?.message || error.response.data?.error || fallback
}
