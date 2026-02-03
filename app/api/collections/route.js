import { fetchShopifyCollections } from '@/lib/shopify'
import { requireAuth } from '@/lib/middleware'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const auth = await requireAuth(request)
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }

    const collections = await fetchShopifyCollections()
    return Response.json({ collections }, { status: 200 })
  } catch (error) {
    console.error('Error fetching collections:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
