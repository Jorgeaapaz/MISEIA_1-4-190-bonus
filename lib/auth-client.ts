// Client-safe JWT decode (no secret needed for reading payload from localStorage)
import { JwtPayload } from './types'

export function verifyToken(token: string): JwtPayload | null {
  try {
    const [, payloadB64] = token.split('.')
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))
    // Check expiry
    if (payload.exp && Date.now() / 1000 > payload.exp) return null
    return payload as JwtPayload
  } catch {
    return null
  }
}
