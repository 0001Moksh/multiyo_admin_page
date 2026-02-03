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
            <span className={styles.brand}>MultiYO</span>
            <span className={styles.subtitle}>Admin Dashboard</span>
          </h1>
          
          <p className={styles.description}>
            Manage your Shopify collections and banners with ease. 
            Streamline your e-commerce operations from one powerful dashboard.
          </p>

          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.icon}>📦</span>
              <span>Collection Management</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.icon}>🖼️</span>
              <span>Banner Control</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.icon}>🔒</span>
              <span>Secure Access</span>
            </div>
          </div>

          <button 
            onClick={() => router.push('/login')}
            className={styles.loginButton}
          >
            Admin Login
          </button>

          <p className={styles.footer}>
            Authorized personnel only
          </p>
        </div>
      </div>
    </div>
  )
}
