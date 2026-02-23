import React from 'react'
import Breadcrumbs from '../../Components/common/Breadcrumbs';

const Portfolio = () => {
    return (
        <div className='p-4 flex flex-col gap-4'>
            <Breadcrumbs
                crumbs={[
                    { label: 'Home', path: '/' },
                    { label: 'Portfolio' }
                ]}
            />
            <div>Portfolio</div>
        </div>
    )
}

export default Portfolio
