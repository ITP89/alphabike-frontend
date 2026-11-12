import { useRef, useState } from 'react'
export function useSubmission() {
  const lock = useRef(false)
  const [busy, setBusy] = useState(false)
  return { busy, start() { if (lock.current) return false; lock.current = true; setBusy(true); return true }, end() { lock.current = false; setBusy(false) } }
}
