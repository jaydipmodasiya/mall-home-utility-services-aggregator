import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { Toaster } from 'react-hot-toast'
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
              background: '#FDFAF4',
              color: '#1A1208',
              border: '1px solid #F5ECD7',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Manrope, sans-serif',
              fontWeight: '500',
              boxShadow: '0 4px 20px rgba(90, 60, 20, 0.12)',
            },
            success: { iconTheme: { primary: '#F5A623', secondary: '#FDFAF4' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#FDFAF4' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
