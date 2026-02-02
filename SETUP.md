# 🚀 Setup & Run Guide

## ✨ What Changed?

**Before:** Two separate commands
```bash
# Terminal 1: Backend
python app.py

# Terminal 2: Frontend  
npm run dev
```

**Now:** Single command for everything! ✅
```bash
npm run dev
```

---

## 🎯 Setup Steps (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Environment
```bash
cp .env.example .env
```

Then edit `.env` with your credentials:

**Shopify:**
- Get `NEXT_PUBLIC_SHOPIFY_DOMAIN` from your Shopify store settings
- Get `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` from Shopify Admin

**MongoDB:**
- Option A (Local): Install MongoDB locally → `MONGODB_URI=mongodb://localhost:27017/`
- Option B (Cloud): Use MongoDB Atlas free tier → Get connection string

**Admin Emails:**
```env
ADMIN_1=your-email@gmail.com
ADMIN_2=another-admin@gmail.com
```

**Email (for OTP):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password  # Not your Gmail password!
```

For Gmail app password:
1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows Computer"
3. Copy the generated password
4. Use in `SMTP_PASS`

**JWT Secret:**
```env
JWT_SECRET_KEY=create-any-random-string-32-characters-or-more
JWT_EXPIRATION=86400  # 24 hours
```

### Step 3: Start Everything
```bash
npm run dev
```

That's it! 🎉

---

## 🌐 Access the App

Open your browser:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api/*

---

## 📁 Project Structure

```
app/                          # Next.js App Router
  ├── api/                   # API Routes (Backend)
  │   ├── auth/             # Authentication endpoints
  │   └── banners/          # Banner management endpoints
  ├── banners/              # Banner manager page
  ├── login/                # Login page
  ├── verify-otp/           # OTP verification page
  ├── page.jsx              # Dashboard page
  ├── layout.jsx            # Root layout
  └── globals.css           # Global styles

components/                   # React Components
  ├── AuthContext.jsx       # Auth state management
  ├── Login.jsx             # Login form
  ├── OTPVerification.jsx   # OTP input
  └── ProtectedRoute.jsx    # Protected route wrapper

lib/                         # Utility functions
  ├── db.js                 # MongoDB connection
  ├── auth.js               # OTP & admin functions
  ├── token.js              # JWT functions
  ├── shopify.js            # Shopify API calls
  └── middleware.js         # Route protection

next.config.js               # Next.js configuration
vercel.json                  # Vercel deployment config
package.json                 # Dependencies
.env.example                 # Environment template
```

---

## 🔧 Available Commands

```bash
# Development (with hot reload)
npm run dev

# Production build
npm run build

# Run production build
npm start

# Linting
npm run lint
```

---

## 🚀 Deploy to Vercel

### Easiest Way: GitHub Integration

1. Push to GitHub:
```bash
git add .
git commit -m "Convert to Next.js fullstack"
git push
```

2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Select your GitHub repo
5. Set Environment Variables:
   - `MONGODB_URI`
   - `ADMIN_1`, `ADMIN_2`
   - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`
   - `JWT_SECRET_KEY`
   - `NEXT_PUBLIC_SHOPIFY_DOMAIN`
   - `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN`
6. Click "Deploy"

Done! ✅ Your app is now live!

### Alternative: Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts and set environment variables when asked.

---

## 🧪 Testing

### Test OTP Login
1. Open http://localhost:3000/login
2. Enter email set in `ADMIN_1`
3. Check email for OTP (or check server logs)
4. Enter OTP
5. You're logged in! ✅

### Test Banner Upload
1. Go to "Manage Banners"
2. Select a collection
3. Upload an image (max 5MB)
4. See it appear in gallery
5. Try replacing or deleting

---

## 📋 Troubleshooting

| Issue | Solution |
|-------|----------|
| OTP not sending | Check SMTP credentials, verify admin email in `.env` |
| MongoDB error | Ensure MongoDB is running or check connection string |
| Shopify API error | Verify domain and token in `.env` |
| Port 3000 in use | Change port: `npm run dev -- -p 3001` |
| Build fails | Run `npm install` again, clear `.next` folder |

---

## 💡 Key Features

✅ **Single Command** - Everything runs with `npm run dev`  
✅ **Fullstack** - No need for separate backend server  
✅ **Vercel Ready** - Deploy with one click  
✅ **React 19** - Latest React version  
✅ **MongoDB** - Cloud-ready database  
✅ **OTP Auth** - Secure email-based login  
✅ **Responsive** - Mobile-friendly UI  

---

**Ready to go?** Run `npm run dev` and start building! 🎉
