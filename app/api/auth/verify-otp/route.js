import { verifyOTP } from '@/lib/auth'
import { generateToken } from '@/lib/token'

export async function POST(request) {
  try {
    const { email, otp } = await request.json()

    if (!email?.trim() || !otp?.trim()) {
      return Response.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    const result = verifyOTP(normalizedEmail, otp.trim())

    if (!result.valid) {
      return Response.json(
        {
          success: false,
          message: result.error,
        },
        { status: 401 }
      )
    }

    const token = generateToken(normalizedEmail)

    return Response.json(
      {
        success: true,
        message: 'Login successful',
        token,
        email: normalizedEmail,
        expiresIn: 86400,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in verify-otp:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
