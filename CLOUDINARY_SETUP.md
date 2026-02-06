# Cloudinary Integration

This application now uses Cloudinary for image storage instead of storing images directly in MongoDB.

## What Changed

### Before (MongoDB Storage)
- Images were stored as base64 strings directly in MongoDB
- `imageData` and `imageType` fields in the database
- Images converted to data URLs on retrieval

### After (Cloudinary Storage)
- Images are uploaded to Cloudinary cloud storage
- Only the Cloudinary URL and public ID are stored in MongoDB
- Images are served directly from Cloudinary's CDN
- Automatic image optimization and format conversion

## Benefits

1. **Performance**: Images served from Cloudinary's global CDN
2. **Database Size**: MongoDB stores only URLs (a few bytes) instead of large base64 strings
3. **Optimization**: Automatic image compression and format conversion
4. **Scalability**: No size limits imposed by database
5. **Transformation**: Can apply transformations via URL parameters

## Setup Instructions

### 1. Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account
2. After signing in, go to your Dashboard
3. You'll find your credentials there:
   - Cloud Name
   - API Key
   - API Secret

### 2. Add Environment Variables

Add these variables to your `.env.local` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Database Schema Changes

The MongoDB banner documents now have this structure:

```javascript
{
  _id: ObjectId,
  imageUrl: "https://res.cloudinary.com/...",  // Cloudinary URL
  publicId: "banners/xyz123",                   // Cloudinary public ID
  collectionId: "gid://shopify/...",
  collectionTitle: "Collection Name",
  collectionHandle: "collection-handle",
  createdAt: Date,
  updatedAt: Date
}
```

**Old fields removed:**
- `imageData` (base64 string)
- `imageType` (file extension)

### 4. Migration of Existing Data

If you have existing banners stored with base64 in MongoDB, you'll need to migrate them. Here's a migration script example:

```javascript
// migration-script.js
import { getBannersCollection } from './lib/db.js'
import { uploadToCloudinary } from './lib/cloudinary.js'

async function migrateBanners() {
  const banners = await getBannersCollection()
  const oldBanners = await banners.find({ imageData: { $exists: true } }).toArray()
  
  for (const banner of oldBanners) {
    try {
      // Convert base64 to buffer
      const buffer = Buffer.from(banner.imageData, 'base64')
      
      // Upload to Cloudinary
      const { url, publicId } = await uploadToCloudinary(buffer, 'banners')
      
      // Update document
      await banners.updateOne(
        { _id: banner._id },
        { 
          $set: { imageUrl: url, publicId },
          $unset: { imageData: "", imageType: "" }
        }
      )
      
      console.log(`Migrated banner ${banner._id}`)
    } catch (error) {
      console.error(`Failed to migrate banner ${banner._id}:`, error)
    }
  }
}

migrateBanners()
```

## API Changes

### Upload Banner (POST /api/banners)
- **Input**: Same (multipart/form-data with file)
- **Output**: Returns `imageUrl` (Cloudinary URL) instead of data URL
- **Process**: Uploads to Cloudinary, stores URL in MongoDB

### Get Banners (GET /api/banners)
- **Output**: Returns `imageUrl` directly from database (no conversion needed)

### Replace Banner (PUT /api/banners/[id])
- **Process**: Deletes old image from Cloudinary, uploads new one
- **Output**: Returns new Cloudinary URL

### Delete Banner (DELETE /api/banners/[id])
- **Process**: Deletes image from both Cloudinary and MongoDB

## Frontend Compatibility

No changes needed! The frontend still receives an `imageUrl` field, it just contains a Cloudinary URL instead of a data URL. All existing functionality works the same way.

## Error Handling

- If Cloudinary upload fails, the API returns an error and doesn't save to MongoDB
- If Cloudinary delete fails during banner replacement/deletion, the operation continues (MongoDB update/delete still happens)

## Cloudinary Features Available

You can enhance images using Cloudinary URL parameters:

```javascript
// Original URL
https://res.cloudinary.com/demo/image/upload/v1234567/banners/sample.jpg

// Add transformations
https://res.cloudinary.com/demo/image/upload/w_500,h_300,c_fill/v1234567/banners/sample.jpg

// Responsive images
https://res.cloudinary.com/demo/image/upload/w_auto,dpr_auto/v1234567/banners/sample.jpg
```

## Troubleshooting

### Images not uploading
- Check your Cloudinary credentials in `.env.local`
- Verify your Cloudinary account is active
- Check the console for error messages

### Large file uploads failing
- Current limit is 5MB (configurable)
- Cloudinary free tier has upload limits

### Images not displaying
- Check if `imageUrl` field exists in MongoDB
- Verify Cloudinary URLs are accessible
- Check browser console for CORS issues

## Related Files

- `/lib/cloudinary.js` - Cloudinary utility functions
- `/app/api/banners/route.js` - Banner upload/list API
- `/app/api/banners/[id]/route.js` - Banner update/delete API
