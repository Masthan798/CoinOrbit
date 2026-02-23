import { useState } from 'react'
import Navbar from './Components/Navbar/Navbar'
import AppRouter from './Routes/AppRoutes'
import GlobalBranding from './Components/common/GlobalBranding'
import { CurrencyProvider } from './Context/CurrencyContext'

function App() {
  return (
    <CurrencyProvider>
      <div className="flex flex-col lg:flex-row min-h-screen bg-black text-white relative">
        <Navbar />
        <div className="flex-1 lg:h-screen lg:overflow-y-auto p-2 pt-20 sm:p-5 sm:pt-20 lg:pt-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <AppRouter />
        </div>
        <GlobalBranding />
      </div>
    </CurrencyProvider>
  )
}

export default App
