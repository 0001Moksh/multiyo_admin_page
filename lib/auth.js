import nodemailer from 'nodemailer'
import { getDatabase } from './db'

let transporter = null

export async function getTransporter() {
  if (transporter) {
    return transporter
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  return transporter
}

export function generateOTP(length = 6) {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0')
}

export function maskEmail(email) {
  const [name, domain] = email.split('@')
  const visibleChars = Math.max(1, Math.ceil(name.length / 3))
  const masked = name.slice(0, visibleChars) + '*'.repeat(name.length - visibleChars)
  return `${masked}@${domain}`
}

export async function sendOTPEmail(email, otp) {
  const transporter = await getTransporter()

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 500px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
    .content { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .otp-box { background: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 5px; color: #667eea; }
    .footer { text-align: center; color: #666; font-size: 12px; }
    .expires { color: #e74c3c; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>MultiYO Admin Panel</h1>
      <p>Login OTP</p>
    </div>
    <div class="content">
      <p>Hello Admin,</p>
      <p>Your One-Time Password (OTP) for MultiYO Admin Panel is:</p>
      <div class="otp-box">
        <div class="otp-code">${otp}</div>
      </div>
      <p class="expires">⏱️ This OTP expires in 5 minutes</p>
      <p>If you didn't request this OTP, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>© 2025 MultiYO. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: '🔐 MultiYO Admin Panel - Login OTP',
    html: htmlContent,
  })
}

export async function storeOTP(email, otp) {
  const normalizedEmail = email.toLowerCase()
  const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes
  
  try {
    const db = await getDatabase()
    const otpCollection = db.collection('otps')
    
    await otpCollection.updateOne(
      { email: normalizedEmail },
      {
        $set: {
          email: normalizedEmail,
          otp: otp.toString().trim(),
          expiresAt,
          attempts: 0,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    )
    
    console.log(`OTP stored for ${normalizedEmail}: ${otp} (expires in 5 min)`)
  } catch (error) {
    console.error('Error storing OTP to MongoDB:', error)
    throw error
  }
}

export async function verifyOTP(email, otp) {
  const normalizedEmail = email.toLowerCase()
  const otpTrimmed = otp.toString().trim()
  
  try {
    const db = await getDatabase()
    const otpCollection = db.collection('otps')
    
    console.log(`Verifying OTP for ${normalizedEmail}. Provided: ${otpTrimmed}`)
    
    const stored = await otpCollection.findOne({ email: normalizedEmail })

    if (!stored) {
      console.log(`No OTP found for ${normalizedEmail}`)
      return { valid: false, error: 'OTP not found or expired' }
    }

    if (Date.now() > stored.expiresAt) {
      console.log(`OTP expired for ${normalizedEmail}`)
      await otpCollection.deleteOne({ email: normalizedEmail })
      return { valid: false, error: 'OTP expired' }
    }

    if (stored.attempts >= 3) {
      console.log(`Too many attempts for ${normalizedEmail}`)
      await otpCollection.deleteOne({ email: normalizedEmail })
      return { valid: false, error: 'Too many attempts' }
    }

    if (stored.otp !== otpTrimmed) {
      await otpCollection.updateOne(
        { email: normalizedEmail },
        { $inc: { attempts: 1 } }
      )
      console.log(`Invalid OTP. Expected: ${stored.otp}, Got: ${otpTrimmed}`)
      return { valid: false, error: 'Invalid OTP' }
    }

    console.log(`OTP verified successfully for ${normalizedEmail}`)
    await otpCollection.deleteOne({ email: normalizedEmail })
    return { valid: true }
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return { valid: false, error: 'Error verifying OTP' }
  }
}

export function getAdminEmails() {
  const admins = []
  let counter = 1
  while (process.env[`ADMIN_${counter}`]) {
    admins.push(process.env[`ADMIN_${counter}`].toLowerCase())
    counter++
  }
  return admins
}

export function isAdmin(email) {
  const adminEmails = getAdminEmails()
  return adminEmails.includes(email.toLowerCase())
}
