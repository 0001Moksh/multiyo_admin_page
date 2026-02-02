# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

**Backend:**
```bash
pip install -r requirements.txt
```

**Frontend:**
```bash
npm install
```

### Step 2: Set Up Environment

1. Copy `.env.example` to `.env`
2. Add your Shopify credentials:
   - Get your Shopify domain: `your-store.myshopify.com`
   - Get your Storefront API token from Shopify Admin

3. Set up MongoDB:
   - **Option A (Local)**: Install MongoDB locally
   - **Option B (Cloud)**: Use MongoDB Atlas free tier

### Step 3: Start Services

**Terminal 1 - Start MongoDB** (if using local)
```bash
mongod
```

**Terminal 2 - Start Backend**
```bash
python app.py
```
Backend runs on `http://localhost:5000`

**Terminal 3 - Start Frontend**
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`

### Step 4: Use the App

1. Open `http://localhost:5173` in your browser
2. Click **"📸 Manage Banners"** button
3. Upload an image and select a collection
4. Done! ✨

## 📋 Checklist

- [ ] Python 3.8+
- [ ] Node.js 18+
- [ ] MongoDB installed/accessible
- [ ] Shopify credentials in `.env`
- [ ] All 3 services running
- [ ] No CORS errors in console

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| "Database not connected" | Start MongoDB, check MONGO_URI in `.env` |
| CORS errors | Ensure backend is running on 5000 |
| Images not showing | Check `/uploads` folder exists |
| Can't upload | Verify collection is selected |

## 📂 What Each Component Does

- **BannerManager.jsx** - Main upload UI and banner list
- **app.py** - Flask backend with API endpoints
- **MongoDB** - Stores banner metadata and collection links

## 🎨 Customize

Edit `/src/BannerManager.css` for colors and styling.

## 📚 More Info

See `BANNER_SETUP.md` for detailed documentation.
