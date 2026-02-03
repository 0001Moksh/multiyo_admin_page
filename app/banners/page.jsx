'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import styles from './banners.module.css'

// SVG Icons
const Icons = {
  CheckCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Upload: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Eye: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Trash: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  ),
  Replace: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36" />
    </svg>
  ),
  Images: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const Icon = {
    success: Icons.CheckCircle,
    error: Icons.X,
    info: Icons.X,
  }[type]

  return (
    <div className={`${styles.toast} ${styles[`toast${type}`]}`} role="alert">
      <div className={styles.toastIcon}>
        <Icon />
      </div>
      <span>{message}</span>
    </div>
  )
}

function PreviewModal({ imageUrl, onClose }) {
  if (!imageUrl) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>
          <Icons.X />
        </button>
        <img src={imageUrl} alt="Banner preview" className={styles.modalImage} />
      </div>
    </div>
  )
}

function BannerManagerContent() {
  const router = useRouter()
  const { logout, getToken } = useAuth()
  const [banners, setBanners] = useState([])
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCollection, setSelectedCollection] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [replacingId, setReplacingId] = useState(null)
  const [replacingBanner, setReplacingBanner] = useState(null)
  const [toast, setToast] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [modalImageUrl, setModalImageUrl] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = getToken()
      const [bannersRes, collectionsRes] = await Promise.all([
        fetch('/api/banners', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/collections', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (!bannersRes.ok || !collectionsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const bannersData = await bannersRes.json()
      const collectionsData = await collectionsRes.json()

      setBanners(bannersData.banners)
      setCollections(collectionsData.collections)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewUrl(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedCollection) {
      setToast({ message: 'Please select a file and collection', type: 'error' })
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('banner', selectedFile)
      formData.append('collectionId', selectedCollection)

      const token = getToken()
      const response = await fetch(
        replacingId ? `/api/banners/${replacingId}` : '/api/banners',
        {
          method: replacingId ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setToast({ message: 'Banner uploaded successfully!', type: 'success' })

      // Reset form
      setSelectedFile(null)
      setSelectedCollection('')
      setReplacingId(null)
      setReplacingBanner(null)
      setPreviewUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ''

      // Refresh banners
      fetchData()
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (bannerId) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return

    try {
      const token = getToken()
      const response = await fetch(`/api/banners/${bannerId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error('Delete failed')

      setToast({ message: 'Banner deleted', type: 'success' })
      fetchData()
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    }
  }

  const handleReplace = (bannerId, collectionId) => {
    const banner = banners.find((b) => b._id === bannerId)
    setReplacingId(bannerId)
    setReplacingBanner(banner)
    setSelectedCollection(collectionId)
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.click()
  }

  const handleCancelReplace = () => {
    setReplacingId(null)
    setReplacingBanner(null)
    setSelectedCollection('')
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const getCollectionName = () => {
    if (replacingBanner) {
      return replacingBanner.collectionTitle
    }
    const collection = collections.find((c) => c.id === selectedCollection)
    return collection?.title
  }

  const getAvailableCollections = () => {
    // Get all collection IDs that already have banners assigned
    const assignedCollectionIds = new Set(banners.map((b) => b.collectionId))

    // Return only collections that don't have banners
    return collections.filter((col) => !assignedCollectionIds.has(col.id))
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Banner Management</h1>
        <div className={styles.headerActions}>
          <button onClick={() => router.push('/dashboard')} className={styles.secondaryBtn}>
            Collections
          </button>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.uploadSection}>
          <h2 className={styles.sectionTitle}>{replacingId ? 'Replace Banner' : 'Upload Banner'}</h2>

          {replacingId && replacingBanner && (
            <div className={styles.infoBox}>
              <div className={styles.infoBoxIcon}>
                <Icons.Images />
              </div>
              <div className={styles.infoBoxContent}>
                <span className={styles.infoBoxLabel}>Replacing banner for:</span>
                <span className={styles.infoBoxCollection}>{replacingBanner.collectionTitle}</span>
              </div>
              <button
                onClick={handleCancelReplace}
                className={styles.cancelBtn}
              >
                <Icons.X />
                Cancel
              </button>
            </div>
          )}


          <div className={styles.uploadArea}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={styles.uploadBtn}
              disabled={uploading}
            >
              <Icons.Upload />
              {selectedFile ? selectedFile.name : 'Select Banner Image (Recommended size: 1584 x 396)'}
            </button>
          </div>

          {previewUrl && (
            <div className={styles.previewSection}>
              <div className={styles.previewLabel}>Quick Preview</div>
              <img src={previewUrl} alt="Preview" className={styles.preview} />
            </div>
          )}



          {!replacingId && (
            <div className={styles.formGroup}>
              <label>Select Collection</label>
              <select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                disabled={uploading}
              >
                <option value="">Choose a collection...</option>
                {getAvailableCollections().map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || !selectedCollection || uploading}
            className={styles.confirmBtn}
          >
            {uploading ? 'Uploading...' : replacingId ? 'Replace Banner' : 'Upload Banner'}
          </button>
        </section>

        <section className={styles.gallerySection}>
          <h2 className={styles.sectionTitle}>
            <Icons.Images />
            Banner Gallery
          </h2>

          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : banners.length === 0 ? (
            <div className={styles.empty}>No banners yet. Upload your first banner!</div>
          ) : (
            <div className={styles.gallery}>
              {banners.map((banner) => (
                <div key={banner._id} className={styles.bannerCard}>
                  <div className={styles.imageWrapper}>
                    {banner.imageUrl && (
                      <img src={banner.imageUrl} alt={banner.collectionTitle} />
                    )}
                    <div className={styles.actions}>
                      <button
                        title="Preview"
                        className={styles.actionBtn}
                        onClick={() => setModalImageUrl(banner.imageUrl)}
                      >
                        <Icons.Eye />
                      </button>
                      <button
                        title="Replace"
                        className={styles.actionBtn}
                        onClick={() => handleReplace(banner._id, banner.collectionId)}
                      >
                        <Icons.Replace />
                      </button>
                      <button
                        title="Delete"
                        className={styles.actionBtn}
                        onClick={() => handleDelete(banner._id)}
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </div>
                  <div className={styles.info}>
                    <p className={styles.collectionTitle}>{banner.collectionTitle}</p>
                    <p className={styles.date}>
                      {new Date(banner.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <PreviewModal
        imageUrl={modalImageUrl}
        onClose={() => setModalImageUrl(null)}
      />
    </div>
  )
}

export default function BannersPage() {
  return (
    <ProtectedRoute>
      <BannerManagerContent />
    </ProtectedRoute>
  )
}
