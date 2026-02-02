# Banner Management System Setup Guide

This guide explains how to set up and use the banner management system for your Shopify collections.

## Features

- ✅ Upload banner images and assign them to Shopify collections
- ✅ Beautiful drag-and-drop image uploader
- ✅ Collection dropdown with all available collections
- ✅ Persistent storage in MongoDB
- ✅ View, manage, and delete uploaded banners
- ✅ Clean, modern UI

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Python** (v3.8 or higher)
3. **MongoDB** (local or Atlas cloud)
4. **Shopify Storefront API credentials**

## Installation Steps

### 1. Backend Setup

#### Install Python Dependencies

```bash
pip install -r requirements.txt
```

#### Configure Environment Variables

Create or update `.env` file in the project root:

```env
NEXT_PUBLIC_SHOPIFY_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=your_storefront_token
MONGO_URI=mongodb://localhost:27017/
MONGO_DB=multiyo_admin
```

**For MongoDB Atlas (Cloud):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGO_DB=multiyo_admin
```

#### Start MongoDB

**Local MongoDB:**
```bash
# Windows
mongod

# macOS/Linux
brew services start mongodb-community
```

**MongoDB Atlas:**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a cluster and get your connection string
- Use it in the `MONGO_URI` environment variable

#### Run Flask Backend

```bash
python app.py
```

The backend will start on `http://localhost:5000`

### 2. Frontend Setup

#### Install Dependencies

```bash
npm install
```

#### Start Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Usage

### Navigation

1. Open the application in your browser
2. You'll see the **Collections Hub** page
3. Click the **"📸 Manage Banners"** button in the top right

### Uploading Banners

1. On the Banner Management page:
   - Click the **file input area** to select an image
   - Or drag & drop an image directly
   
2. **Select a Collection** from the dropdown menu

3. Click **"Upload Banner"**

4. Your banner will appear in the "Current Banners" section below

### Managing Banners

- **View**: All uploaded banners are displayed with their collection assignment
- **Delete**: Click the "Delete" button on any banner card to remove it

## API Endpoints

### Collections
- `GET /api/collections` - Fetch all Shopify collections

### Banners
- `GET /api/banners` - Get all uploaded banners
- `POST /api/banners/upload` - Upload a new banner (multipart form data)
  - `banner` (file) - Image file
  - `collectionId` (string) - Shopify collection ID
- `DELETE /api/banners/<banner_id>` - Delete a specific banner

### Files
- `GET /uploads/<filename>` - Download uploaded banner image

### Health
- `GET /health` - Check API and database status

## File Structure

```
admin dashboard/
├── src/
│   ├── App.jsx                 # Main collections page
│   ├── App.css                 # Collections styling
│   ├── BannerManager.jsx       # Banner management component
│   ├── BannerManager.css       # Banner manager styling
│   ├── main.jsx                # React Router setup
│   └── index.css               # Global styles
├── uploads/                    # Banner images (created automatically)
├── app.py                      # Flask backend
├── requirements.txt            # Python dependencies
├── package.json                # Node dependencies
├── vite.config.js              # Vite configuration
└── .env                        # Environment variables
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running locally or use MongoDB Atlas
- Check `MONGO_URI` in `.env` file
- Verify username/password for Atlas connection

### Banner Upload Fails
- Check file size (max 5MB)
- Verify file format (PNG, JPG, JPEG, GIF, WEBP)
- Ensure collection is selected
- Check browser console for errors

### CORS Errors
- Flask-CORS is already configured
- If issues persist, restart the backend server

### Images Not Loading
- Check that `/uploads` folder exists and contains the files
- Verify backend is running on `http://localhost:5000`
- Check the image URL in browser console

## Development Tips

- **Hot Reload**: Frontend has automatic hot reload with Vite
- **Backend Changes**: Restart Flask after code changes
- **MongoDB Data**: Use MongoDB Compass for visual database management
- **API Testing**: Use Postman or curl to test endpoints

## Performance Optimization

- Images are lazy-loaded in the collections list
- Banners are cached on the frontend
- MongoDB queries are indexed by collection ID

## Security Notes

- Always use environment variables for sensitive data
- Don't commit `.env` file to version control
- Validate file uploads on both client and server
- Consider adding authentication for production

## Support

For issues or questions, check:
1. Browser console for client-side errors
2. Terminal output for backend errors
3. MongoDB logs for database issues
4. Ensure all services are running (MongoDB, Flask, Vite)

