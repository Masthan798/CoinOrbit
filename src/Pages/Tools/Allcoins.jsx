import React from 'react'
import { motion } from 'framer-motion'
import Breadcrumbs from '../../Components/common/Breadcrumbs';

const Allcoins = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className='flex flex-col gap-4'
    >
      <Breadcrumbs
        crumbs={[
          { label: 'Tools', path: '/' },
          { label: 'All Coins' }
        ]}
      />
      <div>Allcoins</div>
    </motion.div>
  )
}

export default Allcoins