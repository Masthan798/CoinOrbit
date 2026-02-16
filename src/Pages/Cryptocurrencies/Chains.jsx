import React from 'react'
import Breadcrumbs from '../../Components/common/Breadcrumbs';

const Chains = () => {
  return (
    <div className='p-4'>
      <Breadcrumbs
        crumbs={[
          { label: 'Cryptocurrencies', path: '/' },
          { label: 'Chains' }
        ]}
      />
      <div>Chains</div>
    </div>
  )
}

export default Chains