import { verifyToken, extractToken } from './token'

export async function requireAuth(request) {
  const authHeader = request.headers.get('Authorization')
  const token = extractToken(authHeader)

  if (!token) {
    return {
      authenticated: false,
      error: 'Missing authorization token',
      status: 401,
    }
  }

  const result = verifyToken(token)

  if (!result.valid) {
    return {
      authenticated: false,
      error: result.error,
      status: 401,
    }
  }

  return {
    authenticated: true,
    email: result.email,
  }
}
