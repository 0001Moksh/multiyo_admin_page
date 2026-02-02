import { verifyToken, extractToken } from '@/lib/token'

export async function POST(request) {
  try {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader) {
      return Response.json(
        { valid: false, message: 'No token provided' },
        { status: 401 }
      )
    }

    const token = extractToken(authHeader)

    if (!token) {
      return Response.json(
        { valid: false, message: 'Invalid token format' },
        { status: 401 }
      )
    }

    const result = verifyToken(token)

    if (!result.valid) {
      return Response.json(
        { valid: false, message: result.error },
        { status: 401 }
      )
    }

    return Response.json(
      {
        valid: true,
        email: result.email,
        expiresAt: result.payload.exp,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in verify-token:', error)
    return Response.json(
      { valid: false, message: error.message },
      { status: 401 }
    )
  }
}
