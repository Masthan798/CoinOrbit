import { useState } from 'react'
import Navbar from './Components/Navbar/Navbar'
import AppRouter from './Routes/AppRoutes'


function App() {


  return (
    <div className="flex h-screen bg-black text-white">
      <Navbar />
      <div className="flex-1 overflow-y-auto p-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <AppRouter />
      </div>
    </div>
  )
}

export default App
