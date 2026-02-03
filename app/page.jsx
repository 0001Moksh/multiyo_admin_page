'use client'

import { useRouter } from 'next/navigation'
import styles from './landing.module.css'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.hero}>
          <h1 className={styles.title}>
            <span className={styles.brand}>
              <img
                src="/logo-no-bg-square.png"
                alt="MultiYO Logo"
                width="150"
                height="150"
                className="logo"
              />
            </span>
            <span className={styles.subtitle}>Admin Dashboard</span>
          </h1>

          <p className={styles.description}>
            Manage your Shopify collections and banners with ease.
            Streamline your e-commerce operations from one powerful dashboard.
          </p>

          <button
            onClick={() => router.push('/login')}
            className={styles.loginButton}
          >
            Admin Login
          </button>
          <p className={styles.footer}>
            @Powered By{' '}
            <a href="https://nexyugtech.com" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
              NexYug Tech
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
