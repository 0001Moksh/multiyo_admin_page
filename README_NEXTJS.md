# MultiYO Admin Dashboard

A modern, fullstack admin dashboard for managing Shopify collections and banners with OTP-based authentication.

## 🚀 Features

- ✅ **React + Next.js** - Modern fullstack framework
- ✅ **OTP Authentication** - Secure email-based login
- ✅ **JWT Tokens** - Session management
- ✅ **MongoDB** - Data persistence
- ✅ **Banner Management** - Upload, replace, delete banners
- ✅ **Shopify Integration** - Real-time collections from Shopify Storefront API
- ✅ **Responsive Design** - Mobile-friendly UI
- ✅ **Vercel Ready** - One-click deployment

## 🛠 Tech Stack

**Frontend:**
- React 19
- Next.js 15
- CSS Modules

**Backend:**
- Next.js API Routes (Node.js)
- MongoDB
- JWT authentication
- Nodemailer for OTP emails

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```
NEXT_PUBLIC_SHOPIFY_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=your_token
MONGODB_URI=mongodb://localhost:27017/
ADMIN_1=admin@example.com
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
JWT_SECRET_KEY=your-secret-key-min-32-chars
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Deployment on Vercel

### Option 1: GitHub Integration (Easiest)
1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Auto-deploy on every push

### Option 2: Vercel CLI
```bash
npm i -g vercel
vercel
```

### Environment Variables on Vercel
Set these in Vercel Dashboard → Settings → Environment Variables:
- `MONGODB_URI`
- `ADMIN_1`, `ADMIN_2`...
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`
- `JWT_SECRET_KEY`
- `NEXT_PUBLIC_SHOPIFY_DOMAIN`
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN`

## 📖 API Endpoints

### Authentication
- `POST /api/auth/request-otp` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP and get token
- `POST /api/auth/verify-token` - Verify JWT token

### Collections
- `GET /api/collections` - Get Shopify collections (protected)

### Banners
- `GET /api/banners` - Get all banners (protected)
- `POST /api/banners` - Upload banner (protected)
- `PUT /api/banners/[id]` - Replace banner (protected)
- `DELETE /api/banners/[id]` - Delete banner (protected)

## 🔐 Environment Variables

```env
# Shopify
NEXT_PUBLIC_SHOPIFY_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=your_token

# Database
MONGODB_URI=mongodb://localhost:27017/
MONGO_DB=multiyo_admin

# Admin Emails
ADMIN_1=admin@example.com
ADMIN_2=admin2@example.com

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# JWT
JWT_SECRET_KEY=your-secret-key-32-chars-minimum
JWT_EXPIRATION=86400

# Deployment
NEXT_PUBLIC_API_URL=https://your-vercel-domain.vercel.app
```

## 📝 Usage

1. **Login**: Click "Send OTP" and enter your admin email
2. **Verify**: Enter the 6-digit code from email
3. **Dashboard**: View Shopify collections
4. **Banners**: Upload, replace, or delete banners
5. **Logout**: Click logout to end session

## 🎨 Customization

- Edit `/app/globals.css` for global styles
- Modify `/app/page.module.css` for dashboard styling
- Update `/app/banners/banners.module.css` for banner manager
- All components in `/components` directory

## 🐛 Troubleshooting

**OTP not sending?**
- Check SMTP credentials
- Verify admin email in `.env`
- Check email spam folder

**MongoDB connection error?**
- Ensure MongoDB is running or use MongoDB Atlas cloud
- Verify `MONGODB_URI` in `.env`

**Shopify API error?**
- Verify domain and token are correct
- Check Storefront API token has necessary scopes

## 📜 License

MIT

---

**Need help?** Check the documentation or create an issue.
