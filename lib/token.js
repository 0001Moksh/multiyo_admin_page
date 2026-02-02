import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'your-secret-key-change-in-production'
const JWT_EXPIRATION = parseInt(process.env.JWT_EXPIRATION) || 86400

export function generateToken(email) {
  try {
    const payload = {
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + JWT_EXPIRATION,
    }
    return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' })
  } catch (error) {
    console.error('Error generating token:', error)
    throw error
  }
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] })
    return {
      valid: true,
      email: decoded.email,
      payload: decoded,
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return {
        valid: false,
        error: 'Token has expired',
      }
    }
    if (error.name === 'JsonWebTokenError') {
      return {
        valid: false,
        error: 'Invalid token',
      }
    }
    return {
      valid: false,
      error: error.message,
    }
  }
}

export function extractToken(authHeader) {
  if (!authHeader) {
    return null
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null
  }

  return parts[1]
}
