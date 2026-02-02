export async function fetchShopifyCollections() {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN
  const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN

  if (!domain || !token) {
    throw new Error('Missing Shopify credentials')
  }

  const url = `https://${domain}/api/2024-01/graphql.json`

  const query = `
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
            products(first: 1) {
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

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Shopify-Storefront-Access-Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.errors) {
      throw new Error(`Shopify GraphQL error: ${data.errors[0].message}`)
    }

    const collections = data.data.collections.edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.description,
      image: node.image,
      productCount: node.products?.edges?.length || 0,
    }))

    return collections
  } catch (error) {
    console.error('Error fetching Shopify collections:', error)
    throw error
  }
}
