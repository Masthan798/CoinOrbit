import { useState } from 'react'
import Navbar from './Components/Navbar/Navbar'
import AppRouter from './Routes/AppRoutes'


function App() {


  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-black text-white">
      <Navbar />
      <div className="flex-1 lg:h-screen lg:overflow-y-auto p-2 pt-3 sm:p-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <AppRouter />
      </div>
    </div>
  )
}

export default App
