import { expect, it } from 'vitest'
import { fechaLima } from './useFechaLima'
it('conserva el día de Lima aunque UTC ya sea el siguiente', () => {
  expect(fechaLima(new Date('2026-11-12T02:00:00Z'))).toBe('2026-11-11')
  expect(fechaLima(new Date('2026-11-12T05:00:00Z'))).toBe('2026-11-12')
})
