# 🔧 OTP Debugging Guide

## Issue
OTP verification shows: "OTP not found or expired"

## ✅ FIXED

I've added comprehensive logging to help debug OTP issues. Here's what to do:

---

## 🚀 Test OTP Flow Now

### Step 1: Check Terminal Logs
When you request OTP, look for this in the terminal where `npm run dev` runs:

```
✓ Compiled / in 10.1s
OTP request for: admin@example.com
Generated OTP: 827886
OTP stored for admin@example.com: 827886 (expires in 5 min)
Email sent successfully to admin@example.com

⚠️ DEV MODE: Use this OTP for testing: 827886
```

**Copy the OTP from logs** ← Use this number!

### Step 2: Enter on Verification Page

Paste the exact OTP from the terminal logs.

Expected logs when verifying:
```
Verifying OTP for admin@example.com. Provided: 827886
Stored OTPs: admin@example.com
OTP verified successfully for admin@example.com
```

### Step 3: Success! ✅

If you see "OTP verified successfully", you're logged in!

---

## 📋 Setup Checklist

Make sure you have in `.env`:

```env
ADMIN_1=your-email@example.com
ADMIN_2=another-admin@example.com
```

Then:

1. **Don't have SMTP configured?** No problem! 
   - OTP still gets generated and stored
   - You'll see it in terminal logs
   - Use it for testing

2. **Have SMTP configured?**
   - OTP gets emailed to you
   - Also visible in logs for debugging

---

## 🧪 Testing Scenarios

### Scenario 1: Email Not Admin ❌
```
OTP request for: random@gmail.com
Email random@gmail.com is not an admin
```
✅ Expected - Set email in ADMIN_1

### Scenario 2: OTP Generated ✅
```
Generated OTP: 827886
OTP stored for admin@example.com: 827886 (expires in 5 min)
```
✅ Expected - Copy this number

### Scenario 3: OTP Verified ✅
```
Verifying OTP for admin@example.com. Provided: 827886
OTP verified successfully for admin@example.com
```
✅ Expected - Login successful!

### Scenario 4: Wrong OTP ❌
```
Verifying OTP for admin@example.com. Provided: 123456
Invalid OTP. Expected: 827886, Got: 123456
```
❌ Expected - Enter correct OTP

### Scenario 5: OTP Expired ❌
```
OTP expired for admin@example.com
```
❌ Expected - Request new OTP

---

## 🔍 Debugging Steps

### Problem: "OTP not found or expired" immediately

**Check 1:** Is email an admin?
```bash
# In .env, verify:
ADMIN_1=your-email@example.com
```

**Check 2:** Did you copy the OTP correctly?
- Look at terminal logs
- Copy exact number shown
- No spaces or dashes

**Check 3:** Did OTP expire?
- OTP valid for 5 minutes
- Check timestamp in logs
- Request new OTP if expired

### Problem: Email not received

**Check 1:** Is SMTP configured?
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-password
```

**Check 2:** Check spam folder

**Check 3:** Use terminal logs as backup
```
⚠️ DEV MODE: Use this OTP for testing: 827886
```

### Problem: Multiple login attempts

**Clear OTP store manually:**
1. Restart server: `npm run dev`
2. Request new OTP
3. Try again

---

## 📝 Environment Setup

### For Development (Without Email)

```env
# Just need admin email
ADMIN_1=test@example.com

# SMTP optional - OTP visible in logs
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-password
```

### For Production (With Email)

```env
# Admin emails
ADMIN_1=admin@example.com
ADMIN_2=admin2@example.com

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Not your Gmail password!
```

**Get Gmail App Password:**
1. Enable 2FA on Gmail
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Select "Mail" and "Windows Computer"
4. Copy generated password
5. Use in `SMTP_PASS`

---

## 🎯 Quick Test

1. Start server: `npm run dev`
2. Open http://localhost:3000/login
3. Enter: `test@example.com` (if in ADMIN_1)
4. Look at terminal for OTP
5. Go to verify page
6. Paste OTP from terminal
7. Login successful! ✅

---

## 📊 What Gets Logged Now

```
REQUEST OTP:
├── OTP request for: admin@example.com
├── Generated OTP: 827886
├── OTP stored for admin@example.com (expires in 5 min)
├── Email sent successfully
└── ⚠️ DEV MODE: Use this OTP: 827886

VERIFY OTP:
├── Verifying OTP for admin@example.com
├── Provided: 827886
├── Stored OTPs: [admin@example.com]
└── OTP verified successfully for admin@example.com
```

---

## 🚨 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Email not admin" | Add to ADMIN_1 in .env |
| "OTP not found" | Check terminal logs for generated OTP |
| "OTP expired" | Request new OTP, valid for 5 min |
| "Invalid OTP" | Copy exact number from logs |
| Email not received | Check SMTP config, use logs as backup |
| Can't log in | Restart server: `npm run dev` |

---

## 💡 Development Tips

✅ **Always check terminal logs first** - OTP shown there for debugging
✅ **OTP valid for 5 minutes** - Timestamp in logs
✅ **SMTP optional for dev** - Still works without email
✅ **One OTP per email** - Request new one to replace
✅ **Case insensitive emails** - test@example.com = TEST@EXAMPLE.COM

---

## 🎉 You're Ready!

Your OTP system is now fully debuggable. 

**Test it now:**
```bash
npm run dev
```

Then check terminal logs when requesting OTP! 🚀
