import React from 'react'
import Breadcrumbs from '../../Components/common/Breadcrumbs';

const DxE = () => {
  return (
    <div className='p-4 flex flex-col gap-4'>
      <Breadcrumbs
        crumbs={[
          { label: 'Exchanges', path: '/' },
          { label: 'Decentralized Exchanges' }
        ]}
      />
      <div>DxE</div>
    </div>
  )
}

export default DxE