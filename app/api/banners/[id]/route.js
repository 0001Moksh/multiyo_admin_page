import { ObjectId } from 'mongodb'
import { getBannersCollection } from '@/lib/db'
import { requireAuth } from '@/lib/middleware'
import { fetchShopifyCollections } from '@/lib/shopify'

export async function PUT(request, { params }) {
  try {
    const auth = await requireAuth(request)
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = params
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

    // Check if banner exists
    const banners = await getBannersCollection()
    const existingBanner = await banners.findOne({ _id: new ObjectId(id) })

    if (!existingBanner) {
      return Response.json({ error: 'Banner not found' }, { status: 404 })
    }

    // Read file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Size check
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
        { error: 'Invalid file type' },
        { status: 400 }
      )
    }

    // Get collection info
    const collections = await fetchShopifyCollections()
    const collection = collections.find((c) => c.id === collectionId)

    if (!collection) {
      return Response.json({ error: 'Collection not found' }, { status: 404 })
    }

    // Convert to base64
    const imageBase64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${imageBase64}`

    // Update banner
    const updateDoc = {
      imageData: imageBase64,
      imageType: fileType,
      collectionId,
      collectionTitle: collection.title,
      collectionHandle: collection.handle,
      updatedAt: new Date(),
    }

    await banners.updateOne({ _id: new ObjectId(id) }, { $set: updateDoc })

    return Response.json(
      {
        message: 'Banner replaced successfully',
        banner: {
          _id: id,
          imageUrl: dataUrl,
          collectionId,
          collectionTitle: collection.title,
          createdAt: existingBanner.createdAt.toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error replacing banner:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAuth(request)
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = params
    const banners = await getBannersCollection()

    const result = await banners.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return Response.json({ error: 'Banner not found' }, { status: 404 })
    }

    return Response.json(
      { message: 'Banner deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting banner:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
