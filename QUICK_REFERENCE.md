# 📋 Quick Reference Card

## 🚀 Getting Started (Copy & Paste)

### Step 1: Install (One-time)
```bash
cd "C:\Users\renuk\OneDrive\Desktop\NexYug Tech\MultiYO\admin dashboard"
npm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### Step 3: Run Everything
```bash
npm run dev
```

**Visit:** http://localhost:3000

---

## 🔑 Environment Variables Quick Setup

```env
# Must Have (Get from Shopify)
NEXT_PUBLIC_SHOPIFY_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=your_token

# Must Have (Get from MongoDB Atlas free tier)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/multiyo_admin

# Must Have (Your email)
ADMIN_1=your-email@example.com

# Must Have (Gmail App Password)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Generate Random (Any 32+ character string)
JWT_SECRET_KEY=random-secret-string-32-chars-minimum
```

---

## 💻 Common Commands

| Command | What It Does |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Check for code issues |

---

## 🌐 URLs When Running Locally

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Main app |
| http://localhost:3000/login | Login page |
| http://localhost:3000/banners | Banner manager |
| http://localhost:3000/api/collections | API endpoint |

---

## 📁 Key Files & Folders

| Path | Purpose |
|------|---------|
| `app/` | Frontend pages + backend API routes |
| `app/api/` | All backend endpoints |
| `components/` | React components |
| `lib/` | Utility functions & services |
| `.env` | Your configuration (DON'T commit!) |
| `.env.example` | Template for `.env` |

---

## 🔐 How It Works

```
npm run dev
    ↓
Next.js server starts on port 3000
    ↓
Frontend pages load (React UI)
    ↓
API routes available (/api/*)
    ↓
Both run in ONE process ✅
```

---

## 🚢 Deploy to Vercel (3 Steps)

### 1. Push to GitHub
```bash
git push origin main
```

### 2. Go to Vercel.com
- Click "Import Project"
- Select your GitHub repo

### 3. Add Environment Variables
Set same `.env` variables in Vercel dashboard

**Done!** Your app is live on Vercel ✅

---

## 🧪 Test Your Setup

### Test 1: App Loads
1. Run `npm run dev`
2. Open http://localhost:3000
3. Should see login page ✅

### Test 2: OTP Login
1. Enter your admin email
2. Check email for OTP
3. Enter code
4. See dashboard ✅

### Test 3: Upload Banner
1. Go to "Manage Banners"
2. Select collection
3. Upload image
4. See in gallery ✅

---

## ⚠️ Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| `npm run dev` fails | `npm install --force` |
| Can't log in | Check email in `.env` |
| Shopify error | Check credentials in `.env` |
| MongoDB error | Verify connection string |
| Port 3000 in use | `npm run dev -- -p 3001` |

---

## 📞 When Stuck

1. Check `.env` is configured
2. Look at terminal where `npm run dev` runs
3. Open browser DevTools (F12)
4. See error message
5. Google the error

---

## 🎯 Deployment Checklist

- [ ] `.env` created & filled
- [ ] Local test with `npm run dev` works
- [ ] Logged in successfully
- [ ] Uploaded a banner successfully
- [ ] GitHub repo created
- [ ] Vercel account created
- [ ] Vercel env vars set
- [ ] Deployed ✅

---

## 📚 Full Documentation

- **Setup**: See `SETUP.md`
- **Deployment**: See `VERCEL_DEPLOY.md`
- **Project Overview**: See `README_NEXTJS.md`
- **Conversion Details**: See `CONVERSION_COMPLETE.md`

---

## ✅ You're All Set!

Everything is installed and ready. Just:

1. Configure `.env`
2. Run `npm run dev`
3. Visit http://localhost:3000
4. Enjoy! 🎉

---

**Need the full version?** Read the `.md` files in the project root!
