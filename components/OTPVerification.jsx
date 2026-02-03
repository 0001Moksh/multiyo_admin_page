'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthContext'
import styles from './OTPVerification.module.css'

export default function OTPVerification() {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const router = useRouter()
  const { login } = useAuth()

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('adminEmail')
    if (!storedEmail) {
      router.push('/login')
    } else {
      setEmail(storedEmail)
    }
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!otp.trim()) {
        setError('Please enter the OTP')
        setLoading(false)
        return
      }

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Invalid OTP')
        setLoading(false)
        return
      }

      login(data.token, data.email)
      sessionStorage.removeItem('adminEmail')
      router.push('/dashboard')
    } catch (err) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Verify OTP</h1>
        <p className={styles.subtitle}>Enter the code sent to your email</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength="6"
            disabled={loading}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <p className={styles.info}>OTP expires in 5 minutes</p>
      </div>
    </div>
  )
}
