import { ObjectId } from 'mongodb'
import { getBannersCollection } from '@/lib/db'
import { requireAuth } from '@/lib/middleware'
import { fetchShopifyCollections } from '@/lib/shopify'

export async function GET(request) {
  try {
    const auth = await requireAuth(request)
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }

    const banners = await getBannersCollection()
    const bannerList = await banners
      .find()
      .sort({ createdAt: -1 })
      .toArray()

    // Convert ObjectId to string and base64 to data URL
    const formattedBanners = bannerList.map((banner) => ({
      ...banner,
      _id: banner._id.toString(),
      imageUrl: banner.imageData ? `data:image/${banner.imageType};base64,${banner.imageData}` : null,
    }))

    return Response.json({ banners: formattedBanners }, { status: 200 })
  } catch (error) {
    console.error('Error fetching banners:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(request)
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }

    const formData = await request.formData()
    const file = formData.get('banner')
    const collectionId = formData.get('collectionId')

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!collectionId) {
      return Response.json(
        { error: 'Collection ID is required' },
        { status: 400 }
      )
    }

    // Read file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Size check (5MB)
    if (buffer.length > 5 * 1024 * 1024) {
      return Response.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      )
    }

    // File type check
    const fileType = file.type.split('/')[1]
    const allowedTypes = ['png', 'jpeg', 'jpg', 'gif', 'webp']
    if (!allowedTypes.includes(fileType)) {
      return Response.json(
        { error: 'Invalid file type. Allowed: png, jpg, jpeg, gif, webp' },
        { status: 400 }
      )
    }

    // Convert to base64
    const imageBase64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${imageBase64}`

    // Get collection info
    const collections = await fetchShopifyCollections()
    const collection = collections.find((c) => c.id === collectionId)

    if (!collection) {
      return Response.json({ error: 'Collection not found' }, { status: 404 })
    }

    // Save to MongoDB
    const bannerDoc = {
      imageData: imageBase64,
      imageType: fileType,
      collectionId,
      collectionTitle: collection.title,
      collectionHandle: collection.handle,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const banners = await getBannersCollection()
    const result = await banners.insertOne(bannerDoc)

    return Response.json(
      {
        message: 'Banner uploaded successfully',
        banner: {
          _id: result.insertedId.toString(),
          imageUrl: dataUrl,
          collectionId: bannerDoc.collectionId,
          collectionTitle: bannerDoc.collectionTitle,
          createdAt: bannerDoc.createdAt.toISOString(),
          updatedAt: bannerDoc.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error uploading banner:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
