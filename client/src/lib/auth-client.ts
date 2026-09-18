import { createAuthClient } from 'better-auth/client'

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin + '/api/auth' : 'http://localhost:3000/api/auth',
})