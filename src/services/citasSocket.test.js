import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { connectCitas } from './citasSocket'

class FakeSocket {
  static OPEN = 1
  static CLOSED = 3
  static instances = []
  readyState = 0
  send = vi.fn()
  close = vi.fn(() => { this.readyState = 3 })
  constructor(url) { this.url = url; FakeSocket.instances.push(this) }
  open() { this.readyState = 1; this.onopen?.() }
  receive(frame) { this.onmessage?.({ data: JSON.stringify(frame) }) }
  disconnect(code = 1006) { this.readyState = 3; this.onclose?.({ code }) }
}

describe('citas WebSocket lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    FakeSocket.instances = []
    vi.stubGlobal('WebSocket', FakeSocket)
  })
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

  it('authenticates in a frame, requests reconciliation and forwards updates', () => {
    const onStatus = vi.fn()
    const onEvent = vi.fn()
    const stop = connectCitas({ token: 'jwt-secret', url: 'ws://localhost/ws/citas', onStatus, onEvent })
    const socket = FakeSocket.instances[0]
    expect(socket.url).not.toContain('jwt-secret')
    socket.open()
    expect(JSON.parse(socket.send.mock.calls[0][0])).toEqual({ type: 'AUTH', token: 'jwt-secret' })
    socket.receive({ type: 'READY' })
    expect(onStatus).toHaveBeenLastCalledWith('conectado')
    expect(socket.send).toHaveBeenLastCalledWith(JSON.stringify({ type: 'SYNC' }))
    socket.receive({ type: 'CITA_UPDATED', citaId: 'cita-1', estado: 'EN_PROCESO' })
    expect(onEvent).toHaveBeenCalledWith({ type: 'CITA_UPDATED', citaId: 'cita-1', estado: 'EN_PROCESO' })
    stop()
    vi.advanceTimersByTime(60000)
    expect(FakeSocket.instances).toHaveLength(1)
  })

  it('reconnects after a network failure and stops retrying invalid credentials', () => {
    const onStatus = vi.fn()
    const stop = connectCitas({ token: 'jwt', url: 'ws://localhost/ws/citas', onStatus, onEvent: vi.fn() })
    FakeSocket.instances[0].disconnect()
    vi.advanceTimersByTime(1000)
    expect(FakeSocket.instances).toHaveLength(2)
    FakeSocket.instances[1].disconnect(1008)
    expect(onStatus).toHaveBeenLastCalledWith('sesion_expirada')
    vi.advanceTimersByTime(60000)
    expect(FakeSocket.instances).toHaveLength(2)
    stop()
  })
})
