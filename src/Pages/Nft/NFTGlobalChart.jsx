import React from 'react'
import Breadcrumbs from '../../Components/common/Breadcrumbs';

const NFTGlobalChart = () => {
  return (
    <div className='p-4 flex flex-col gap-4'>
      <Breadcrumbs
        crumbs={[
          { label: 'NFTs', path: '/' },
          { label: 'Global Charts' }
        ]}
      />
      <div>NFTGlobalChart</div>
    </div>
  )
}

export default NFTGlobalChart