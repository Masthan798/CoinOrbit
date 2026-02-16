import React from 'react'
import Breadcrumbs from '../../Components/common/Breadcrumbs';

const NFTRelatedCoins = () => {
  return (
    <div className='p-4 flex flex-col gap-4'>
      <Breadcrumbs
        crumbs={[
          { label: 'NFTs', path: '/' },
          { label: 'Related Coins' }
        ]}
      />
      <div>NFTRelatedCoins</div>
    </div>
  )
}

export default NFTRelatedCoins