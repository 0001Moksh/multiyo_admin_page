# 🚀 Deploy to Vercel

Your MultiYO Admin Dashboard is now **Vercel-ready**! Deploy in minutes.

## ✅ What's Ready to Deploy

- ✅ Next.js 14 (React fullstack)
- ✅ API routes (backend)
- ✅ MongoDB integration
- ✅ OTP authentication
- ✅ Banner management system
- ✅ Fully responsive UI
- ✅ Production-optimized build

## 🎯 Deployment Options

### Option 1: GitHub + Vercel (EASIEST - Recommended) ⭐

**Step 1: Push to GitHub**
```bash
cd "C:\Users\renuk\OneDrive\Desktop\NexYug Tech\MultiYO\admin dashboard"
git init
git add .
git commit -m "Next.js fullstack admin dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/multiyo-admin.git
git push -u origin main
```

**Step 2: Deploy on Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Select GitHub repo (it might show up directly)
4. Click **"Import"**

**Step 3: Configure Environment Variables**

In Vercel dashboard, go to **Settings → Environment Variables** and add:

```
NEXT_PUBLIC_SHOPIFY_DOMAIN = your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN = your_token
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/multiyo_admin?retryWrites=true&w=majority
MONGO_DB = multiyo_admin
ADMIN_1 = admin@example.com
ADMIN_2 = another-admin@example.com
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = your-email@gmail.com
SMTP_PASS = your-app-password
JWT_SECRET_KEY = your-random-secret-32-characters-or-more
JWT_EXPIRATION = 86400
NEXT_PUBLIC_API_URL = https://your-app.vercel.app
```

**Step 4: Deploy**
- Click **"Deploy"**
- Wait 2-3 minutes
- Done! ✅ Your app is live!

**Auto-Deploy:** Every push to GitHub automatically deploys to Vercel!

---

### Option 2: Vercel CLI

**Step 1: Install Vercel CLI**
```bash
npm i -g vercel
```

**Step 2: Deploy**
```bash
cd "C:\Users\renuk\OneDrive\Desktop\NexYug Tech\MultiYO\admin dashboard"
vercel
```

**Step 3: Follow Prompts**
- Link to existing Vercel project or create new
- Set environment variables when asked
- Done! ✅

---

### Option 3: Deploy from Git Branch

If you're already using Git:

```bash
git push origin main
```

Vercel will automatically deploy if connected to your GitHub repo!

---

## 📋 Pre-Deployment Checklist

- [ ] Copy `.env.example` → `.env` locally and test
- [ ] Test OTP login locally: `npm run dev`
- [ ] Test banner upload locally
- [ ] Have MongoDB Atlas account (free tier works!)
- [ ] Have Shopify credentials ready
- [ ] Have Gmail app password ready
- [ ] GitHub account created

---

## 🔐 Important: Environment Variables

### Never Commit `.env` File!
```bash
# Already in .gitignore, so you're safe ✅
```

### MongoDB Setup (Free)
1. Go to [mongodb.com/cloud](https://mongodb.com/cloud)
2. Create free account
3. Create cluster (free tier)
4. Get connection string
5. Add `ADMIN_1` user in MongoDB
6. Copy connection string to `MONGODB_URI` in Vercel

### Gmail App Password
1. Enable 2-factor authentication on Gmail
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Select "Mail" and "Windows Computer"
4. Copy generated password
5. Use in `SMTP_PASS` (NOT your Gmail password!)

### Shopify Credentials
1. Go to Shopify Admin
2. Settings → Apps → Develop apps
3. Create app
4. Under Admin API, get credentials
5. Copy domain and token to Vercel

### JWT Secret
```bash
# Generate secure random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ✨ After Deployment

### Test Your Live App
1. Go to `https://your-app.vercel.app`
2. Test login with admin email
3. Upload a banner
4. Delete/replace banner
5. Everything working? ✅ You're done!

### Monitor & Logs
- Vercel Dashboard → Deployments
- Click deployment to see logs
- Check for errors

### Custom Domain (Optional)
1. In Vercel → Settings → Domains
2. Add your custom domain
3. Update DNS records (Vercel will guide you)

---

## 🐛 Troubleshooting Deployment

| Problem | Solution |
|---------|----------|
| Build fails | Check error log, ensure all env vars set |
| OTP not sending | Verify SMTP vars, check Gmail app password |
| MongoDB error | Verify MONGODB_URI, whitelist Vercel IPs |
| Shopify API error | Verify domain and token are correct |
| 500 error | Check Vercel logs, restart deployment |
| CORS error | Already handled in Next.js API routes |

---

## 📊 Your Vercel Dashboard

After deploying:
- **Deployments**: See all versions
- **Analytics**: Monitor traffic & performance
- **Logs**: Debug issues
- **Settings**: Update env vars anytime

---

## 🎯 Next Steps After Deployment

1. **Share URL** with your team
2. **Add admin users** (update `ADMIN_1`, `ADMIN_2` in Vercel)
3. **Monitor usage** in Vercel dashboard
4. **Update banner content** as needed
5. **Track analytics** to optimize

---

## 💡 Pro Tips

✅ **Auto-deploy on push** - Just push to GitHub, Vercel does the rest!
✅ **Preview URLs** - Each PR gets a preview URL
✅ **Rollback** - Redeploy previous version instantly
✅ **Serverless** - No servers to manage
✅ **Scalable** - Handles traffic spikes automatically
✅ **Free tier** - Perfect for testing

---

## 🎉 Congratulations!

Your fullstack admin dashboard is now deployed globally on Vercel! 

**Your App URL:**
```
https://your-app.vercel.app
```

**Key Features Live:**
- ✅ Login from anywhere
- ✅ Manage banners in real-time
- ✅ Integrated with Shopify
- ✅ 99.95% uptime guarantee
- ✅ Auto-scaling & CDN
- ✅ SSL certificate included

---

**Questions?** Check Vercel docs or GitHub issues!
