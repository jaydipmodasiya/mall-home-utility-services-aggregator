import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#E1F8DC',
              color: '#0F2B3D',
              border: '1px solid #F7D8BB',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Manrope, sans-serif',
              fontWeight: '500',
              boxShadow: '0 4px 20px rgba(15, 43, 61, 0.12)',
            },
            success: { iconTheme: { primary: '#1A7C80', secondary: '#E1F8DC' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#E1F8DC' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
