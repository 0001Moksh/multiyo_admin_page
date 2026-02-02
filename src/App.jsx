import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './App.css'

const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN
const STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN

const COLLECTIONS_QUERY = `
  {
    collections(first: 50) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            url
            altText
          }
          products(first: 250) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }
  }
`

function App() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCollections = async () => {
      if (!SHOPIFY_DOMAIN || !STOREFRONT_TOKEN) {
        setError('Missing Shopify Storefront credentials. Add VITE_SHOPIFY_DOMAIN and VITE_SHOPIFY_STOREFRONT_TOKEN.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
          method: 'POST',
          headers: {
            'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: COLLECTIONS_QUERY }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch collections')
        }

        const payload = await response.json()
        if (payload.errors) {
          throw new Error(payload.errors.map((item) => item.message).join(', '))
        }

        const edges = payload?.data?.collections?.edges ?? []
        const normalized = edges.map(({ node }) => ({
          id: node.id,
          title: node.title,
          handle: node.handle,
          description: node.description,
          image: node.image,
          productCount: node.products?.edges?.length ?? 0,
        }))

        setCollections(normalized)
      } catch (err) {
        setError(err?.message || 'Unable to load collections.')
      } finally {
        setLoading(false)
      }
    }

    fetchCollections()
  }, [])

  const filteredCollections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return collections.filter((collection) => {
      const matchesQuery =
        !normalizedQuery ||
        collection.title.toLowerCase().includes(normalizedQuery) ||
        collection.handle.toLowerCase().includes(normalizedQuery) ||
        (collection.description || '').toLowerCase().includes(normalizedQuery)

      return matchesQuery
    })
  }, [query, collections])

  const totalCollections = collections.length

  return (
    <div className="app">
      <header className="hero">
        <div>
          <img className="brand-logo" src="/logo-no-bg-rectangular.png" alt="MultiYO" />
          <p className="eyebrow">Collections Hub</p>
          <h1>Browse Shopify collections</h1>
          <p className="subtitle">
            View collections from your Shopify store using the Storefront API. Search by title, handle, or description.
          </p>
        </div>
        <div className="hero-card">
          <div>
            <p className="hero-label">Total collections</p>
            <h2>{totalCollections}</h2>
          </div>
          <div>
            <p className="hero-label">Loaded</p>
            <h2>{loading ? '...' : totalCollections}</h2>
          </div>
        </div>
      </header>

      <section className="controls">
        <div className="search">
          <input
            type="text"
            placeholder="Search collections, tags, or descriptions"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <button 
          className="banner-button"
          onClick={() => navigate('/banners')}
        >
          📸 Manage Banners
        </button>
      </section>

      <section className="grid">
        {loading ? (
          <div className="empty-state">
            <h3>Loading collections...</h3>
            <p>Fetching the latest data from Shopify.</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h3>Unable to load collections</h3>
            <p>{error}</p>
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="empty-state">
            <h3>No collections found</h3>
            <p>Try adjusting your search or filters to see more results.</p>
          </div>
        ) : (
          filteredCollections.map((collection) => (
            <article key={collection.id} className="card">
              <div className="card-header">
                <div>
                  <p className="category">{collection.handle}</p>
                  <h3>{collection.title}</h3>
                </div>
              </div>
              {collection.image?.url ? (
                <img
                  className="collection-image"
                  src={collection.image.url}
                  alt={collection.image.altText || collection.title}
                  loading="lazy"
                />
              ) : null}
              <p className="description">
                {collection.description || 'No description available for this collection.'}
              </p>
              <div className="meta">
                <span>{collection.productCount} products</span>
                <span>Handle: {collection.handle}</span>
              </div>
              <button type="button" className="primary">
                View collection
              </button>
            </article>
          ))
        )}
      </section>
    </div>
  )
}

export default App
