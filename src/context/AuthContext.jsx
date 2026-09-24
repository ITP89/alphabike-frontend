import { createContext, useContext, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

function cargarUsuarioInicial() {
  const token = localStorage.getItem('token')
  const usuarioGuardado = localStorage.getItem('usuario')

  if (!token || !usuarioGuardado) {
    return null
  }

  try {
    return JSON.parse(usuarioGuardado)
  } catch {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    return null
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(cargarUsuarioInicial)
  const cargando = false

  function guardarSesion(datos, telefonoFallback = '') {
    const { id, token, nombre, email, telefono, rol, emailVerificado } = datos
    const datosUsuario = {
      id,
      nombre,
      email,
      telefono: telefono || telefonoFallback,
      rol,
      emailVerificado: emailVerificado !== undefined ? emailVerificado : true,
    }

    localStorage.setItem('token', token)
    localStorage.setItem('usuario', JSON.stringify(datosUsuario))
    setUsuario(datosUsuario)

    return datosUsuario
  }

  async function login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    return guardarSesion(response.data.data)
  }

  async function registrar(nombre, email, password, telefono) {
    const response = await api.post('/auth/register', {
      nombre,
      email,
      password,
      telefono,
    })
    return response.data
  }

  async function solicitarRecuperacionPassword(email) {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  }

  async function restablecerPassword(token, nuevaPassword) {
    const response = await api.post('/auth/reset-password', { token, nuevaPassword })
    return response.data
  }

  async function verificarEmail(token) {
    const response = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
    return response.data
  }

  async function reenviarVerificacion(email) {
    const response = await api.post('/auth/resend-verification', { email })
    return response.data
  }

  function actualizarUsuario(datos) {
    const datosUsuario = { ...usuario, ...datos }
    localStorage.setItem('usuario', JSON.stringify(datosUsuario))
    setUsuario(datosUsuario)
    return datosUsuario
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        login,
        registrar,
        solicitarRecuperacionPassword,
        restablecerPassword,
        verificarEmail,
        reenviarVerificacion,
        actualizarUsuario,
        logout,
        cargando,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
