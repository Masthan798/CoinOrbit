import React from 'react'
import Breadcrumbs from '../../Components/common/Breadcrumbs';

const NFTWatchlist = () => {
  return (
    <div className='p-4 flex flex-col gap-4'>
      <Breadcrumbs
        crumbs={[
          { label: 'NFTs', path: '/' },
          { label: 'Watchlist' }
        ]}
      />
      <div>NFTWatchlist</div>
    </div>
  )
}

export default NFTWatchlist