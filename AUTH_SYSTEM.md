# Admin Authentication System

This MultiYO Admin Dashboard uses a secure, email-based OTP (One-Time Password) authentication system.

## How It Works

### 1. **Login Flow**
- Admin navigates to `/login`
- Enters their registered admin email
- System sends a 6-digit OTP to that email
- Email must be registered in `.env` as `ADMIN_1`, `ADMIN_2`, etc.

### 2. **OTP Verification**
- Admin receives OTP via email (5-minute validity)
- Enters OTP in verification page
- Upon successful verification, receives JWT token
- Token stored in `localStorage` with 24-hour expiration

### 3. **Session Management**
- All API requests to protected endpoints require `Authorization: Bearer <token>` header
- Token automatically included in all dashboard API calls
- Expired or invalid tokens redirect to login
- Logout clears token and session

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Admin Email Addresses (at least one required)
ADMIN_1=admin@example.com
ADMIN_2=another-admin@example.com

# SMTP Configuration for Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# JWT Secret (change this in production!)
JWT_SECRET_KEY=your-secret-key-here
```

### SMTP Setup (Gmail Example)

1. Enable 2-Step Verification on your Google account
2. Generate an App Password at https://myaccount.google.com/apppasswords
3. Use the generated 16-character password in `SMTP_PASS`

## Files Structure

### Backend (Flask)

- **`auth_service.py`** - Authentication logic
  - OTP generation and verification
  - Email sending via SMTP
  - Admin email validation
  - Email masking for security

- **`token_service.py`** - JWT token management
  - Token generation (24-hour expiration)
  - Token verification and validation

- **`app.py`** - Flask routes
  - `POST /api/auth/request-otp` - Request OTP
  - `POST /api/auth/verify-otp` - Verify OTP and get token
  - `POST /api/auth/verify-token` - Check token validity
  - Protected routes with `@require_auth` decorator

### Frontend (React)

- **`Login.jsx`** - Login page component
  - Email input form
  - OTP request handling
  - Session storage for email

- **`OTPVerification.jsx`** - OTP verification page
  - 6-digit OTP input fields
  - Auto-focus between fields
  - Timer countdown (5 minutes)
  - Resend OTP option

- **`AuthContext.jsx`** - Authentication state management
  - Token storage/retrieval
  - Login/logout functions
  - Token verification on app load
  - useAuth hook for components

- **`ProtectedRoute.jsx`** - Route protection wrapper
  - Redirects unauthenticated users to login
  - Shows loading state during verification

## API Endpoints

### Request OTP
```http
POST /api/auth/request-otp
Content-Type: application/json

{
  "email": "admin@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent to ad***@example.com",
  "email": "ad***@example.com",
  "expiresIn": 300
}
```

### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "admin@example.com",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "email": "admin@example.com",
  "expiresIn": 86400
}
```

### Verify Token
```http
POST /api/auth/verify-token
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "valid": true,
  "email": "admin@example.com",
  "expiresAt": 1234567890
}
```

## Security Features

✅ **No Password Storage** - Uses secure OTP instead of passwords
✅ **Email Verification** - Only registered admins can access
✅ **OTP Expiration** - 5-minute validity limit
✅ **Attempt Limiting** - Max 3 verification attempts per OTP
✅ **JWT Tokens** - 24-hour expiration with secure signature
✅ **Email Masking** - Shows masked email for privacy
✅ **HTTPS Only** - All communication encrypted
✅ **CORS Protected** - API requests from frontend only
✅ **Secure Headers** - Authorization bearer tokens required

## Protected Routes

All dashboard routes are protected:
- `/ (Dashboard)` - Collections view
- `/banners` - Banner Manager

Unprotected routes:
- `/login` - Login page
- `/verify-otp` - OTP verification page

## Using Protected Routes

```jsx
// Wrap route with ProtectedRoute
<Route 
  path="/banners" 
  element={
    <ProtectedRoute>
      <BannerManager />
    </ProtectedRoute>
  } 
/>
```

## Making API Calls with Auth

```jsx
// Get token from useAuth hook
const { getToken } = useAuth();

// Add token to API request
const response = await fetch('http://localhost:5000/api/banners', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
  }
});
```

## Troubleshooting

### "Email is not registered as an admin"
- Verify email is in `.env` as `ADMIN_1`, `ADMIN_2`, etc.
- Check for typos and exact email formatting
- Restart backend server after updating `.env`

### "OTP expired"
- OTP is valid for 5 minutes only
- Click "Resend OTP" to request a new one
- Check your spam folder if email doesn't arrive

### "Failed to send OTP email"
- Verify SMTP credentials in `.env`
- For Gmail: Use App Password (not regular password)
- Check Gmail "Less secure app access" settings
- Verify email address has SMTP enabled

### "Invalid or expired token"
- Token expires after 24 hours
- Log out and log back in to refresh
- Clear browser cache and localStorage if issues persist

## Production Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET_KEY` to a strong, random value
- [ ] Use HTTPS for all API communications
- [ ] Enable secure cookies if using sessions
- [ ] Set appropriate CORS origins
- [ ] Use production-grade SMTP service
- [ ] Monitor OTP request rates to prevent abuse
- [ ] Implement rate limiting on auth endpoints
- [ ] Use environment-specific configuration
- [ ] Enable logging and monitoring
- [ ] Regular security audits

## Support

For issues or questions about the authentication system, check:
1. Backend logs in Flask console
2. Browser console for frontend errors
3. Email spam folder if OTP not received
4. .env file for correct configuration
