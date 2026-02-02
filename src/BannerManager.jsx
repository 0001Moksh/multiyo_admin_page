import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'
import './BannerManager.css'

// Banner dimensions
const BANNER_WIDTH = 1584
const BANNER_HEIGHT = 396
const BANNER_ASPECT_RATIO = BANNER_WIDTH / BANNER_HEIGHT

// Icon Components
const Icon = {
  CheckCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Info: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  Upload: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  Eye: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Replace: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36"/>
    </svg>
  ),
  Trash: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
  ),
  Settings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"/>
    </svg>
  ),
  Grid: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Images: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
    </svg>
  ),
}

// Toast notification component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const IconComponent = {
    success: Icon.CheckCircle,
    error: Icon.X,
    info: Icon.Info,
  }[type] || Icon.Info

  return (
    <div className={`toast toast-${type}`} role="alert" aria-live="polite">
      <div className="toast-icon">
        <IconComponent />
      </div>
      <span className="toast-message">{message}</span>
    </div>
  )
}

// Skeleton loader component
function SkeletonLoader() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-image" />
      <div className="skeleton skeleton-text" />
      <div className="skeleton skeleton-text" />
    </div>
  )
}

function BannerManager() {
  const navigate = useNavigate()
  const { getToken, logout } = useAuth()
  const fileInputRef = useRef(null)
  const dropZoneRef = useRef(null)
  const canvasRef = useRef(null)

  // Helper function to get auth headers
  const getAuthHeaders = (includeJson = true) => {
    const headers = {
      'Authorization': `Bearer ${getToken()}`,
    }
    if (includeJson) {
      headers['Content-Type'] = 'application/json'
    }
    return headers
  }

  // State management
  const [banners, setBanners] = useState([])
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(false)
  const [collectionsLoading, setCollectionsLoading] = useState(true)
  const [uploadFile, setUploadFile] = useState(null)
  const [selectedCollection, setSelectedCollection] = useState('')
  const [collectionSearch, setCollectionSearch] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [toasts, setToasts] = useState([])
  
  // New features state
  const [previewMode, setPreviewMode] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [replacingBanner, setReplacingBanner] = useState(null)
  const [imageDimensions, setImageDimensions] = useState(null)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [imageFilters, setImageFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
  })

  // Toast management
  const addToast = (message, type = 'info') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Fetch collections on mount
  useEffect(() => {
    fetchCollections()
    fetchBanners()
  }, [])

  const fetchCollections = async () => {
    setCollectionsLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/collections', {
        headers: getAuthHeaders(false),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Unable to load collections')
      setCollections(data.collections || [])
    } catch (err) {
      console.error('Error fetching collections:', err)
      if (err.message.includes('401')) {
        logout()
        navigate('/login')
      }
      addToast(err.message || 'Unable to load collections', 'error')
    } finally {
      setCollectionsLoading(false)
    }
  }

  const fetchBanners = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/banners', {
        headers: getAuthHeaders(false),
      })
      const data = await response.json()
      setBanners(data.banners || [])
    } catch (err) {
      console.error('Error fetching banners:', err)
      if (err.message.includes('401')) {
        logout()
        navigate('/login')
      }
      addToast('Unable to load banners', 'error')
    }
  }

  // Filter collections without banners
  const availableCollections = collections.filter((collection) => {
    return !banners.some((banner) => banner.collectionId === collection.id)
  })

  // Filter collections based on search
  const filteredCollections = availableCollections.filter((collection) =>
    collection.title.toLowerCase().includes(collectionSearch.toLowerCase())
  )

  // File handling
  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file', 'error')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('Image must be smaller than 5MB', 'error')
      return
    }

    // Check image dimensions
    const img = new Image()
    img.onload = () => {
      const dimensions = {
        width: img.width,
        height: img.height,
        aspectRatio: (img.width / img.height).toFixed(2)
      }
      setImageDimensions(dimensions)
      
      // Check if dimensions match recommended
      if (img.width === BANNER_WIDTH && img.height === BANNER_HEIGHT) {
        addToast('Perfect! Image dimensions match recommended size', 'success')
      } else {
        const aspectMatch = Math.abs(img.width / img.height - BANNER_ASPECT_RATIO) < 0.01
        if (aspectMatch) {
          addToast(`Good aspect ratio! Image will be resized from ${img.width}x${img.height} to ${BANNER_WIDTH}x${BANNER_HEIGHT}`, 'info')
        } else {
          addToast(`Warning: Image dimensions ${img.width}x${img.height} don't match recommended ${BANNER_WIDTH}x${BANNER_HEIGHT}. Image may be cropped or stretched.`, 'warning')
        }
      }
    }
    img.src = URL.createObjectURL(file)

    setUploadFile(file)
    setImageFilters({ brightness: 100, contrast: 100, saturation: 100 })
  }

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        setUploadFile(file)
      } else {
        addToast('Please drop a valid image file', 'error')
      }
    }
  }

  // Upload handler
  const handleUpload = async (event) => {
    event.preventDefault()

    if (!uploadFile) {
      addToast('Please select a banner image', 'error')
      return
    }

    if (!selectedCollection) {
      addToast('Please select a collection', 'error')
      return
    }

    setLoading(true)
    setUploadProgress(0)

    try {
      // Apply filters if any are changed
      const hasFilters = imageFilters.brightness !== 100 || 
                        imageFilters.contrast !== 100 || 
                        imageFilters.saturation !== 100
      
      const fileToUpload = hasFilters ? await applyFiltersToImage() : uploadFile

      const formData = new FormData()
      formData.append('banner', fileToUpload)
      formData.append('collectionId', selectedCollection)

      const endpoint = replacingBanner 
        ? `http://localhost:5000/api/banners/${replacingBanner._id}/replace`
        : 'http://localhost:5000/api/banners/upload'
      
      const method = replacingBanner ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        body: formData,
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result?.error || 'Failed to upload banner')
      }

      // Reset form
      resetForm()

      // Refresh banners list
      await fetchBanners()

      addToast(
        replacingBanner 
          ? 'Banner replaced successfully!' 
          : 'Banner uploaded successfully!', 
        'success'
      )
    } catch (err) {
      if (err.message.includes('401')) {
        logout()
        navigate('/login')
      }
      addToast(err.message || 'Failed to upload banner', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Delete banner handler
  const deleteBanner = async (bannerId) => {
    if (!confirm('Are you sure you want to delete this banner?')) return

    try {
      const response = await fetch(
        `http://localhost:5000/api/banners/${bannerId}`,
        { 
          method: 'DELETE',
          headers: getAuthHeaders(false),
        }
      )

      if (!response.ok) throw new Error('Failed to delete banner')

      await fetchBanners()
      addToast('Banner deleted successfully', 'success')
    } catch (err) {
      if (err.message.includes('401')) {
        logout()
        navigate('/login')
      }
      addToast('Error deleting banner: ' + err.message, 'error')
    }
  }

  // Replace banner handler
  const handleReplaceBanner = (banner) => {
    setReplacingBanner(banner)
    setSelectedCollection(banner.collectionId)
    fileInputRef.current?.click()
  }

  // Edit banner handler
  const handleEditBanner = (banner) => {
    setEditingBanner(banner)
    setPreviewMode(true)
  }

  // Reset form
  const resetForm = () => {
    setUploadFile(null)
    setSelectedCollection('')
    setCollectionSearch('')
    setUploadProgress(0)
    setImageDimensions(null)
    setReplacingBanner(null)
    setImageFilters({ brightness: 100, contrast: 100, saturation: 100 })
  }

  // Apply filters to canvas
  const applyFiltersToImage = () => {
    if (!uploadFile) return null
    
    const canvas = canvasRef.current
    if (!canvas) return null
    
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = BANNER_WIDTH
        canvas.height = BANNER_HEIGHT
        
        // Apply filters
        ctx.filter = `brightness(${imageFilters.brightness}%) contrast(${imageFilters.contrast}%) saturate(${imageFilters.saturation}%)`
        ctx.drawImage(img, 0, 0, BANNER_WIDTH, BANNER_HEIGHT)
        
        canvas.toBlob((blob) => {
          resolve(new File([blob], uploadFile.name, { type: uploadFile.type }))
        }, uploadFile.type)
      }
      img.src = URL.createObjectURL(uploadFile)
    })
  }

  return (
    <div className="banner-manager">
      {/* Top Navigation Bar with Logout */}
      <nav className="banner-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <h1>MultiYO Admin</h1>
          </div>
          <div className="nav-actions">
            <button
              onClick={() => navigate('/')}
              className="nav-link"
              title="Go to Dashboard"
            >
              Dashboard
            </button>
            <div className="nav-user-info">
              <span className="user-email">{getToken() && 'Admin'}</span>
            </div>
            <button
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="logout-btn"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="banner-hero">
        <div className="hero-content">
          <h1>Collection Banner Manager</h1>
          <div className="dimension-badge">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 3h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1zm1 2v10h10V5H5z"/>
            </svg>
            <span>Recommended: {BANNER_WIDTH} × {BANNER_HEIGHT} px</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="banner-main">
        <div className="banner-grid">
          {/* Left Panel - Upload */}
          <section className="upload-panel">
            <div className="card upload-card">
              <div className="card-header">
                <h2>
                  {replacingBanner ? (
                    <>
                      <span className="header-icon"><Icon.Replace /></span>
                      Replace Banner
                    </>
                  ) : (
                    <>
                      <span className="header-icon"><Icon.Upload /></span>
                      Upload New Banner
                    </>
                  )}
                </h2>
                {replacingBanner && (
                  <button
                    className="btn-cancel-replace"
                    onClick={resetForm}
                    type="button"
                  >
                    <Icon.X /> Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleUpload} className="upload-form">
                {/* Drag & Drop Zone */}
                <div
                  ref={dropZoneRef}
                  className={`dropzone ${isDragging ? 'dragging' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex="0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      fileInputRef.current?.click()
                    }
                  }}
                  aria-label="Upload image area"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={loading}
                    hidden
                    aria-hidden="true"
                  />

                  {uploadFile ? (
                    <div className="dropzone-content">
                      <div className="checkmark-icon"><Icon.CheckCircle /></div>
                      <p className="dropzone-filename">{uploadFile.name}</p>
                      {imageDimensions && (
                        <p className="dropzone-dimensions">
                          {imageDimensions.width} × {imageDimensions.height} px
                          {imageDimensions.width === BANNER_WIDTH && imageDimensions.height === BANNER_HEIGHT && (
                            <span className="dimension-perfect"> • Perfect Match</span>
                          )}
                        </p>
                      )}
                      <p className="dropzone-hint">Click to change file</p>
                    </div>
                  ) : (
                    <div className="dropzone-content">
                      <div className="upload-icon"><Icon.Upload /></div>
                      <p className="dropzone-text">Drop your image here</p>
                      <p className="dropzone-hint">or click to browse</p>
                      <p className="dropzone-size">
                        Recommended: {BANNER_WIDTH} × {BANNER_HEIGHT} px
                      </p>
                      <p className="dropzone-size">Max 5MB • PNG, JPG, GIF, WebP</p>
                    </div>
                  )}
                </div>

                {/* Preview */}
                {uploadFile && (
                  <div className="preview-section">
                    <div className="preview-header">
                      <h3>Preview</h3>
                      <button
                        type="button"
                        className="btn-preview-toggle"
                        onClick={() => setPreviewMode(!previewMode)}
                      >
                        {previewMode ? '📐 Edit Mode' : <><Icon.Eye /> Full Preview</>}
                      </button>
                    </div>
                    
                    <div className={`preview-container ${previewMode ? 'preview-fullscreen' : ''}`}>
                      <img
                        src={URL.createObjectURL(uploadFile)}
                        alt="Preview"
                        className="preview-image"
                        style={{
                          filter: `brightness(${imageFilters.brightness}%) contrast(${imageFilters.contrast}%) saturate(${imageFilters.saturation}%)`
                        }}
                      />
                      {previewMode && (
                        <button
                          className="preview-close"
                          onClick={() => setPreviewMode(false)}
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Advanced Options */}
                    <div className="advanced-section">
                      <button
                        type="button"
                        className="btn-advanced-toggle"
                        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                      >
                        <span><Icon.Settings /> Advanced Options</span>
                        <span className={`arrow ${showAdvancedOptions ? 'open' : ''}`}>▼</span>
                      </button>
                      
                      {showAdvancedOptions && (
                        <div className="advanced-controls">
                          <div className="control-group">
                            <label>
                              <span>☀️ Brightness</span>
                              <span className="control-value">{imageFilters.brightness}%</span>
                            </label>
                            <input
                              type="range"
                              min="50"
                              max="150"
                              value={imageFilters.brightness}
                              onChange={(e) => setImageFilters(prev => ({
                                ...prev,
                                brightness: parseInt(e.target.value)
                              }))}
                              className="slider"
                            />
                          </div>
                          
                          <div className="control-group">
                            <label>
                              <span>🎭 Contrast</span>
                              <span className="control-value">{imageFilters.contrast}%</span>
                            </label>
                            <input
                              type="range"
                              min="50"
                              max="150"
                              value={imageFilters.contrast}
                              onChange={(e) => setImageFilters(prev => ({
                                ...prev,
                                contrast: parseInt(e.target.value)
                              }))}
                              className="slider"
                            />
                          </div>
                          
                          <div className="control-group">
                            <label>
                              <span>🌈 Saturation</span>
                              <span className="control-value">{imageFilters.saturation}%</span>
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="200"
                              value={imageFilters.saturation}
                              onChange={(e) => setImageFilters(prev => ({
                                ...prev,
                                saturation: parseInt(e.target.value)
                              }))}
                              className="slider"
                            />
                          </div>

                          <button
                            type="button"
                            className="btn-reset-filters"
                            onClick={() => setImageFilters({
                              brightness: 100,
                              contrast: 100,
                              saturation: 100
                            })}
                          >
                            Reset Filters
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Hidden canvas for filter processing */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {/* Collection Select with Search - Hidden during replace */}
                {!replacingBanner && (
                  <div className="form-group">
                    <label htmlFor="collection-search">Select Collection</label>
                    <div className="search-select-wrapper">
                      <select
                        value={selectedCollection}
                        onChange={(e) => setSelectedCollection(e.target.value)}
                        disabled={
                          loading ||
                          collectionsLoading ||
                          filteredCollections.length === 0
                        }
                        className="collection-select"
                        aria-label="Choose a collection"
                      >
                        <option value="">
                          {collectionsLoading
                            ? 'Loading collections...'
                            : filteredCollections.length === 0
                              ? availableCollections.length === 0
                                ? 'All collections have banners'
                                : 'No matches found'
                              : 'Select from results...'}
                        </option>
                        {filteredCollections.map((collection) => (
                          <option key={collection.id} value={collection.id}>
                            {collection.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Show collection info during replace */}
                {replacingBanner && (
                  <div className="collection-info-box">
                    <div className="collection-info-icon"><Icon.Grid /></div>
                    <div className="collection-info-content">
                      <p className="collection-info-label">Replacing banner for:</p>
                      <p className="collection-info-name">{replacingBanner.collectionTitle}</p>
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                {loading && uploadProgress > 0 && (
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
                    <span className="progress-text">{uploadProgress}%</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`btn btn-primary ${loading ? 'loading' : ''}`}
                  disabled={loading || !uploadFile || collectionsLoading}
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <span className="btn-spinner" />
                      {replacingBanner ? 'Replacing...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">{replacingBanner ? <Icon.Replace /> : <Icon.Upload />}</span>
                      {replacingBanner ? 'Replace Banner' : 'Upload Banner'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>

          {/* Right Panel - Gallery */}
          <section className="gallery-panel">
            <div className="gallery-header">
              <h2>
                <span className="header-icon"><Icon.Images /></span>
                Your Banners
                <span className="badge">{banners.length}</span>
              </h2>
              <p className="gallery-subtitle">
                Manage and preview your collection banners
              </p>
            </div>

            {collectionsLoading ? (
              <div className="banners-grid">
                {[...Array(3)].map((_, i) => (
                  <SkeletonLoader key={i} />
                ))}
              </div>
            ) : banners.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Icon.Images /></div>
                <h3>No banners yet</h3>
                <p>Upload your first banner to get started</p>
                <div className="empty-features">
                  <div className="feature-item">• Preview in real-time</div>
                  <div className="feature-item">• Edit with filters</div>
                  <div className="feature-item">• Replace anytime</div>
                </div>
              </div>
            ) : (
              <div className="banners-grid">
                {banners.map((banner) => (
                  <div
                    key={banner._id}
                    className="banner-card"
                    role="article"
                    aria-label={`Banner for ${banner.collectionTitle}`}
                  >
                    <div className="banner-image-wrapper">
                      <img
                        src={banner.imageUrl}
                        alt={`Banner for ${banner.collectionTitle}`}
                        className="banner-image"
                        loading="lazy"
                      />
                      <div className="banner-overlay">
                        <div className="banner-actions">
                          <button
                            className="action-btn preview-btn"
                            onClick={() => {
                              setEditingBanner(banner)
                              setPreviewMode(true)
                            }}
                            title="Preview banner"
                            aria-label={`Preview banner for ${banner.collectionTitle}`}
                          >
                            <Icon.Eye />
                          </button>
                          <button
                            className="action-btn replace-btn"
                            onClick={() => handleReplaceBanner(banner)}
                            title="Replace banner"
                            aria-label={`Replace banner for ${banner.collectionTitle}`}
                          >
                            <Icon.Replace />
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => deleteBanner(banner._id)}
                            title="Delete banner"
                            aria-label={`Delete banner for ${banner.collectionTitle}`}
                          >
                            <Icon.Trash />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="banner-meta">
                      <p className="banner-collection">
                        {banner.collectionTitle}
                      </p>
                      <p className="banner-date">
                        {new Date(banner.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Full Preview Modal */}
      {previewMode && editingBanner && (
        <div className="preview-modal" onClick={() => { setPreviewMode(false); setEditingBanner(null); }}>
          <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="preview-modal-close"
              onClick={() => { setPreviewMode(false); setEditingBanner(null); }}
            >
              ✕
            </button>
            <div className="preview-modal-header">
              <h3>{editingBanner.collectionTitle}</h3>
              <p className="preview-dimensions">{BANNER_WIDTH} × {BANNER_HEIGHT} px</p>
            </div>
            <div className="preview-modal-image">
              <img
                src={editingBanner.imageUrl}
                alt={`Full preview of ${editingBanner.collectionTitle}`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="toast-container" aria-live="region" aria-label="Notifications">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default BannerManager
