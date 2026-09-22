import { describe, it, expect } from 'vitest'
import {
  detectarFranquicia,
  validarAlgoritmoLuhn,
  validarDatosTarjeta,
  TARJETAS_PRUEBA,
} from './paymentGateway'

describe('Payment Gateway Unit Tests', () => {
  it('detecta correctamente franquicias de tarjeta', () => {
    expect(detectarFranquicia('4000123456789010')).toBe('visa')
    expect(detectarFranquicia('5105105105105100')).toBe('mastercard')
    expect(detectarFranquicia('378282246310005')).toBe('amex')
    expect(detectarFranquicia('36000000000000')).toBe('diners')
    expect(detectarFranquicia('99999999999999')).toBe('desconocida')
  })

  it('valida con precisión el Algoritmo de Luhn (Módulo 10)', () => {
    // Tarjetas válidas
    expect(validarAlgoritmoLuhn('4242424242424242')).toBe(true)
    expect(validarAlgoritmoLuhn('5105105105105100')).toBe(true)
    expect(validarAlgoritmoLuhn('378282246310005')).toBe(true)

    // Tarjetas inválidas
    expect(validarAlgoritmoLuhn('4242424242424241')).toBe(false)
    expect(validarAlgoritmoLuhn('1234567890123456')).toBe(false)
  })

  it('valida datos completos de tarjeta correctamente', () => {
    const tarjetaValida = {
      numero: '4242 4242 4242 4242',
      titular: 'JUAN PEREZ',
      expiracion: '12/28',
      cvv: '123',
    }

    const res = validarDatosTarjeta(tarjetaValida)
    expect(res.valido).toBe(true)
    expect(Object.keys(res.errors)).toHaveLength(0)
  })

  it('detecta tarjeta vencida o formato inválido', () => {
    const tarjetaVencida = {
      numero: '4000 1234 5678 9010',
      titular: 'JUAN PEREZ',
      expiracion: '01/20', // Vencida
      cvv: '123',
    }

    const res = validarDatosTarjeta(tarjetaVencida)
    expect(res.valido).toBe(false)
    expect(res.errors.expiracion).toBe('La tarjeta está vencida')
  })

  it('todas las tarjetas de prueba oficiales de Sandbox son válidas', () => {
    const tarjetasAprobadas = TARJETAS_PRUEBA.filter((t) => t.resultado === 'Aprobado')
    tarjetasAprobadas.forEach((t) => {
      const limpio = t.numero.replace(/\s+/g, '')
      expect(validarAlgoritmoLuhn(limpio)).toBe(true)
    })
  })
})
