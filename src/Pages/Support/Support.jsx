import React from 'react'
import Breadcrumbs from '../../Components/common/Breadcrumbs';

const Support = () => {
  return (
    <div className='p-4 flex flex-col gap-4'>
      <Breadcrumbs
        crumbs={[
          { label: 'Home', path: '/' },
          { label: 'Support' }
        ]}
      />
      <div>Support</div>
    </div>
  )
}

export default Support