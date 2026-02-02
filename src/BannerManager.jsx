import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './BannerManager.css'

function BannerManager() {
  const navigate = useNavigate()
  const [banners, setBanners] = useState([])
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadFile, setUploadFile] = useState(null)
  const [selectedCollection, setSelectedCollection] = useState('')
  const [collectionsError, setCollectionsError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  // Fetch collections on mount
  useEffect(() => {
    fetchCollections()
    fetchBanners()
  }, [])

  const fetchCollections = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/collections')
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to load collections')
      }
      setCollections(data.collections || [])
      setCollectionsError('')
    } catch (err) {
      console.error('Error fetching collections:', err)
      setCollections([])
      setCollectionsError(err.message || 'Unable to load collections')
    }
  }

  const fetchBanners = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/banners')
      const data = await response.json()
      setBanners(data.banners || [])
    } catch (err) {
      console.error('Error fetching banners:', err)
    }
  }

  // Get collections without banners
  const availableCollections = collections.filter((collection) => {
    return !banners.some((banner) => banner.collectionId === collection.id)
  })

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setUploadFile(file)
      setError('')
    } else {
      setError('Please select a valid image file')
      setUploadFile(null)
    }
  }

  const handleUpload = async (event) => {
    event.preventDefault()

    if (!uploadFile) {
      setError('Please select a banner image')
      return
    }

    if (!selectedCollection) {
      setError('Please select a collection')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('banner', uploadFile)
      formData.append('collectionId', selectedCollection)

      const response = await fetch('http://localhost:5000/api/banners/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        const message = result?.error || 'Failed to upload banner'
        throw new Error(message)
      }
      
      // Reset form
      setUploadFile(null)
      setSelectedCollection('')
      setUploadProgress(0)
      
      // Refresh banners list
      await fetchBanners()
      
      alert('Banner uploaded successfully!')
    } catch (err) {
      setError(err.message || 'Failed to upload banner')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="banner-manager">
      <header className="banner-header">
        <div>
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back to Collections
          </button>
          <p className="eyebrow">Banner Management</p>
          <h1>Manage Collection Banners</h1>
          <p className="subtitle">
            Upload banner images and assign them to collections
          </p>
        </div>
      </header>

      <section className="banner-content">
        <div className="upload-section">
          <div className="upload-card">
            <h2>Upload New Banner</h2>
            
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleUpload} className="upload-form">
              <div className="form-group">
                <label htmlFor="banner-file">Banner Image</label>
                <label className="file-input-wrapper" htmlFor="banner-file">
                  <input
                    id="banner-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={loading}
                  />
                  <span className="file-name">
                    {uploadFile ? uploadFile.name : 'Choose image...'}
                  </span>
                </label>
              </div>

              {uploadFile && (
                <div className="preview">
                  <img src={URL.createObjectURL(uploadFile)} alt="Preview" />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="collection-select">Collection</label>
                <select
                  id="collection-select"
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  disabled={loading || availableCollections.length === 0}
                >
                  <option value="">
                    {availableCollections.length === 0
                      ? 'All collections have banners'
                      : 'Select a collection...'}
                  </option>
                  {availableCollections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.title}
                    </option>
                  ))}
                </select>
                {collectionsError && (
                  <p className="helper-text error-text">{collectionsError}</p>
                )}
              </div>

              <button 
                type="submit" 
                className="upload-button" 
                disabled={loading || !uploadFile}
              >
                {loading ? 'Uploading...' : 'Upload Banner'}
              </button>
            </form>
          </div>
        </div>

        <div className="banners-list-section">
          <h2>Current Banners ({banners.length})</h2>
          
          {banners.length === 0 ? (
            <div className="empty-state">
              <p>No banners uploaded yet. Start by uploading your first banner!</p>
            </div>
          ) : (
            <div className="banners-grid">
              {banners.map((banner) => (
                <div key={banner._id} className="banner-item">
                  <img src={banner.imageUrl} alt={banner.collectionId} />
                  <div className="banner-info">
                    <p className="collection-label">
                      {banner.collectionTitle || banner.collectionId}
                    </p>
                    <p className="upload-date">
                      {new Date(banner.createdAt).toLocaleDateString()}
                    </p>
                    <button 
                      className="delete-button"
                      onClick={() => deleteBanner(banner._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )

  async function deleteBanner(bannerId) {
    if (!confirm('Are you sure you want to delete this banner?')) return

    try {
      const response = await fetch(
        `http://localhost:5000/api/banners/${bannerId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) throw new Error('Failed to delete banner')

      await fetchBanners()
      alert('Banner deleted successfully!')
    } catch (err) {
      alert('Error deleting banner: ' + err.message)
    }
  }
}

export default BannerManager
