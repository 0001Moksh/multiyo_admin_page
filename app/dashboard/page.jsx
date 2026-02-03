'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import styles from '../page.module.css'

function DashboardContent() {
  const router = useRouter()
  const { logout, adminEmail } = useAuth()
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/collections', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch collections')
      }

      const data = await response.json()
      setCollections(data.collections)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>MultiYO Admin Dashboard</h1>
        <div className={styles.headerActions}>
          <span className={styles.email}>{adminEmail}</span>
          <button onClick={() => router.push('/banners')} className={styles.primaryBtn}>
            Manage Banners
          </button>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <h2>Shopify Collections</h2>

          {error && <div className={styles.error}>{error}</div>}

          {loading ? (
            <div className={styles.loading}>Loading collections...</div>
          ) : collections.length === 0 ? (
            <div className={styles.empty}>No collections found</div>
          ) : (
            <div className={styles.grid}>
              {collections.map((collection) => (
                <div key={collection.id} className={styles.card}>
                  {collection.image && (
                    <img src={collection.image.url} alt={collection.title} />
                  )}
                  <h3>{collection.title}</h3>
                  <p className={styles.description}>{collection.description}</p>
                  <p className={styles.products}>📦 {collection.productCount} products</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
