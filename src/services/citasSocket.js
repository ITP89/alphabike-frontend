export function getWebSocketUrl() {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL
  const apiUrl = new URL(import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1', window.location.origin)
  apiUrl.protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:'
  apiUrl.pathname = '/ws/citas'
  apiUrl.search = ''
  apiUrl.hash = ''
  return apiUrl.toString()
}

/** One connection per signed-in session, authenticated without tokens in URLs. */
export function connectCitas({ token, onStatus, onEvent, url = getWebSocketUrl() }) {
  let stopped = false
  let socket
  let retryTimer
  let heartbeat
  let attempts = 0
  let lastMessage = 0

  function connect() {
    if (stopped) return
    if (!navigator.onLine) {
      onStatus('sin_conexion')
      return
    }
    onStatus('conectando')
    socket = new WebSocket(url)
    socket.onopen = () => {
      lastMessage = Date.now()
      socket.send(JSON.stringify({ type: 'AUTH', token }))
      heartbeat = setInterval(() => {
        if (Date.now() - lastMessage > 45000) socket.close()
        else if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'PING' }))
      }, 15000)
    }
    socket.onmessage = ({ data }) => {
      let event
      try { event = JSON.parse(data) } catch { return }
      lastMessage = Date.now()
      if (event.type === 'READY') {
        attempts = 0
        onStatus('conectado')
        socket.send(JSON.stringify({ type: 'SYNC' }))
      }
      if (event.type === 'CITA_UPDATED' || event.type === 'CITAS_SYNC') onEvent(event)
    }
    socket.onerror = () => socket.close()
    socket.onclose = ({ code }) => {
      clearInterval(heartbeat)
      if (stopped) return
      if (code === 1008) {
        onStatus('sesion_expirada')
        return
      }
      onStatus(navigator.onLine ? 'reconectando' : 'sin_conexion')
      retryTimer = setTimeout(connect, Math.min(1000 * 2 ** attempts++, 15000))
    }
  }

  function resume() {
    clearTimeout(retryTimer)
    if (!socket || socket.readyState === WebSocket.CLOSED) connect()
  }
  window.addEventListener('online', resume)
  connect()
  return () => {
    stopped = true
    clearTimeout(retryTimer)
    clearInterval(heartbeat)
    window.removeEventListener('online', resume)
    if (socket) {
      socket.onclose = null
      socket.onerror = null
      socket.onmessage = null
      socket.onopen = null
      socket.close()
    }
  }
}
