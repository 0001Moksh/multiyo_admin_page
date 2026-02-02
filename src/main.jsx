import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import BannerManager from './BannerManager.jsx'
import Login from './Login.jsx'
import OTPVerification from './OTPVerification.jsx'
import { AuthProvider } from './AuthContext.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/banners" 
            element={
              <ProtectedRoute>
                <BannerManager />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

