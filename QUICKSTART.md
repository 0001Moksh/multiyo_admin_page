# Quick Start Guide - Admin Authentication

## 🚀 Start the Application (5 minutes)

### Step 1: Install Dependencies

**Backend:**
```bash
pip install flask flask-cors pymongo python-dotenv pyjwt
```

**Frontend:**
```bash
npm install
```

### Step 2: Start Backend Server

```bash
python app.py
```

Expected output:
```
* Running on http://127.0.0.1:5000
Connected to MongoDB successfully!
```

### Step 3: Start Frontend (New Terminal)

```bash
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Step 4: Access Dashboard

Open browser to: **http://localhost:5173/**

---

## 📧 Test Login

### Admin Emails (Already Configured)
- `mokshbhardwaj2333@gmail.com` (ADMIN_1)
- `multiyocare@gmail.com` (ADMIN_2)

### Login Flow

1. **Enter Email**
   - Type admin email on login page
   - Click "Send OTP"

2. **Receive OTP**
   - Check email inbox (spam folder if not found)
   - 6-digit code valid for 5 minutes

3. **Enter OTP**
   - Return to app and enter 6 digits
   - Each digit auto-focuses
   - Click "Verify OTP"

4. **Access Dashboard**
   - See collections and banner manager
   - Click "Logout" to exit

---

## 🔐 Security Reminders

✅ **OTP Valid:** 5 minutes only
✅ **Token Expires:** 24 hours
✅ **Max Attempts:** 3 per OTP
✅ **Auto-Logout:** On invalid token
✅ **Email Only:** No passwords stored

---

## 📁 Key Files

### Backend
- `app.py` - Flask server & API routes
- `auth_service.py` - OTP generation & SMTP
- `token_service.py` - JWT tokens
- `.env` - Configuration

### Frontend
- `src/Login.jsx` - Login form
- `src/OTPVerification.jsx` - OTP input
- `src/AuthContext.jsx` - Auth state
- `src/ProtectedRoute.jsx` - Route protection
- `src/App.jsx` - Dashboard
- `src/BannerManager.jsx` - Banner management

---

## 🛠️ Troubleshooting

### OTP Not Received?
1. Check spam folder
2. Verify email in .env (ADMIN_1, ADMIN_2)
3. Restart backend server
4. Check SMTP credentials

### Can't Login?
1. Verify email is admin (ADMIN_1 or ADMIN_2)
2. Check token in localStorage
3. Clear browser cache
4. Try another browser

### Token Expired?
- Click logout and log back in
- New token valid for 24 hours

---

## 📝 Add New Admin

1. Open `.env` file
2. Add new line:
   ```env
   ADMIN_3=newemail@example.com
   ```
3. Restart `python app.py`
4. New admin can log in

---

## 📚 Full Documentation

- **AUTH_SYSTEM.md** - Complete auth system docs
- **AUTH_IMPLEMENTATION.md** - Implementation details

---

## ✅ What's Configured

- ✅ OTP email sending (Gmail SMTP)
- ✅ JWT token generation
- ✅ Protected API routes
- ✅ MongoDB connection
- ✅ CORS enabled
- ✅ Login/Logout flow
- ✅ Admin email management
- ✅ Banner upload protection

---

## 🎯 Next Steps

1. **Test Login** - Verify OTP email works
2. **Try Banner Upload** - Must be authenticated
3. **Test Logout** - Clear session
4. **Review Logs** - Check console for debug info
5. **Production Deploy** - Change JWT_SECRET_KEY

---

## 💡 Tips

- Use localhost:5000 for backend API
- Use localhost:5173 for frontend
- OTP resend available on verification page
- Admin emails saved in .env (no database changes)
- Tokens auto-verified on app load

---

**Ready? Open http://localhost:5173 and test it out!** 🎉
