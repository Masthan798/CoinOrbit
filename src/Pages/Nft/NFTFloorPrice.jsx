import React from 'react'
import Breadcrumbs from '../../Components/common/Breadcrumbs';

const NFTFloorPrice = () => {
  return (
    <div className='p-4 flex flex-col gap-4'>
      <Breadcrumbs
        crumbs={[
          { label: 'NFTs', path: '/nft-floor' },
          { label: 'Floor Prices' }
        ]}
      />
      <div>NFTFloorPrice</div>
    </div>
  )
}

export default NFTFloorPrice