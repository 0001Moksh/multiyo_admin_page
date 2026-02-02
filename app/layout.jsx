import { AuthProvider } from '@/components/AuthContext'
import './globals.css'

export const metadata = {
  title: 'MultiYO Admin Dashboard',
  description: 'Manage Shopify collections and banners',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
