import React, { useEffect, useState } from 'react'
import Navbar from './Components/Navbar/Navbar'
import AppRouter from './Routes/AppRoutes'
import GlobalBranding from './Components/common/GlobalBranding'
import { CurrencyProvider } from './Context/CurrencyContext'
import { useAuth } from './Context/AuthContext'
import { Toaster } from 'react-hot-toast'
import { useLocation } from 'react-router-dom'
import SplashScreen from './Components/Loadings/SplashScreen'
import { AnimatePresence } from 'framer-motion'

function App() {
  const { user, isRefreshing } = useAuth();
  const location = useLocation();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname);

  useEffect(() => {
    // Initial splash screen timer
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2800); // 2.8s allow animations to complete

    return () => clearTimeout(timer);
  }, []);

  const showSplash = isInitialLoading || isRefreshing;

  return (
    <CurrencyProvider>
      <div className="relative min-h-screen bg-black text-white overflow-hidden">
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#141414',
            color: '#fff',
            border: '1px solid #1F1F1F',
          },
        }} />

        <AnimatePresence mode="wait">
          {showSplash && (
            <div className="fixed inset-0 z-[9999]">
              <SplashScreen key="splash" />
            </div>
          )}
        </AnimatePresence>

        <div 
          key="app-content" 
          className={`flex flex-col lg:flex-row min-h-screen bg-black text-white relative ${showSplash && isInitialLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
        >
          {user && !isAuthPage && <Navbar />}
          <div className="flex-1 lg:h-screen lg:overflow-y-auto p-2 pt-20 sm:p-5 sm:pt-20 lg:pt-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <AppRouter />
          </div>
          <GlobalBranding />
        </div>
      </div>
    </CurrencyProvider>
  )
}

export default App
