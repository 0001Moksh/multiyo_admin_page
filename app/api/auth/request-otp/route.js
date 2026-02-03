import { isAdmin, generateOTP, maskEmail, sendOTPEmail, storeOTP } from '@/lib/auth'

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email?.trim()) {
      return Response.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    console.log(`OTP request for: ${normalizedEmail}`)

    if (!isAdmin(normalizedEmail)) {
      console.log(`Email ${normalizedEmail} is not an admin`)
      return Response.json(
        {
          success: false,
          message: 'This email is not registered as an admin',
        },
        { status: 403 }
      )
    }

    try {
      const otp = generateOTP()
      console.log(`Generated OTP: ${otp}`)
      await storeOTP(normalizedEmail, otp)
      
      try {
        await sendOTPEmail(normalizedEmail, otp)
        console.log(`Email sent successfully to ${normalizedEmail}`)
      } catch (emailError) {
        console.warn(`Email send failed: ${emailError.message}`)
        console.log(`⚠️ DEV MODE: Use this OTP for testing: ${otp}`)
      }

      return Response.json(
        {
          success: true,
          message: `OTP sent to ${maskEmail(normalizedEmail)}`,
          email: maskEmail(normalizedEmail),
          expiresIn: 300,
        },
        { status: 200 }
      )
    } catch (error) {
      console.error('Error generating OTP:', error)
      return Response.json(
        {
          error: 'Failed to process OTP request',
          details: error.message,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in request-otp:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
