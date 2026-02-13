import React from 'react'
import { motion } from 'framer-motion'

const Allcoins = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      Allcoins
    </motion.div>
  )
}

export default Allcoins