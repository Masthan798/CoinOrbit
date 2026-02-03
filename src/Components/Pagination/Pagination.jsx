import React, { useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, ChevronDown, ChevronUp } from 'lucide-react';

const Pagination = ({
    currentPage,
    setCurrentPage,
    perPage,
    setPerPage,
    totalItems,
    onPageChange
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const totalPages = Math.ceil(totalItems / perPage);

    const getPageNumbers = () => {
        const delta = 1;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }
        return rangeWithDots;
    };

    const handlePageChange = (page) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentPage(page);
        if (onPageChange) onPageChange(page);
    };

    return (
        <div className='w-full flex flex-row flex-nowrap items-center justify-between gap-2 sm:gap-4 mt-8 px-2 sm:px-4 text-muted'>
            {/* Section 1: Result Range */}
            <div className='flex items-center gap-2 font-medium shrink-0'>
                <span className='text-xs sm:text-sm text-white whitespace-nowrap'>
                    {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, totalItems)}
                </span>
                <div className='hidden md:flex flex-col text-[8px] sm:text-[10px] leading-tight text-muted uppercase'>
                    <span>of {totalItems}+</span>
                </div>
            </div>

            {/* Section 2: Page Navigation */}
            <div className='flex items-center gap-0.5 sm:gap-2'>
                <button
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className='p-1 sm:p-2 hover:bg-card rounded-lg transition-colors disabled:opacity-30'
                >
                    <ArrowLeftIcon className='w-3 h-3 sm:w-4 sm:h-4' />
                </button>

                <div className='flex items-center gap-0.5 sm:gap-1'>
                    {getPageNumbers().map((page, index) => {
                        const isNeighbor = typeof page === 'number' && Math.abs(page - currentPage) <= 1;
                        const isFirstPage = page === 1;
                        const isFirstDots = index === 1 && page === '...';

                        // Mobile visibility logic
                        const showOnMobile = isFirstPage || (isFirstDots && currentPage > 2) || isNeighbor;

                        return page === '...' ? (
                            <span key={`dots-${index}`} className={`${isFirstDots && showOnMobile ? 'inline' : 'hidden md:inline'} px-0.5 text-muted`}>...</span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`w-6 h-6 sm:w-8 sm:h-8 items-center justify-center rounded-lg transition-colors ${showOnMobile ? 'flex' : 'hidden md:flex'
                                    } ${currentPage === page
                                        ? 'bg-card text-white font-bold'
                                        : 'hover:bg-card'
                                    }`}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className='p-1 sm:p-2 hover:bg-card rounded-lg transition-colors disabled:opacity-30'
                >
                    <ArrowRightIcon className='w-3 h-3 sm:w-4 sm:h-4' />
                </button>
            </div>

            {/* Section 3: Rows Selector */}
            <div className='flex items-center gap-1 sm:gap-2 relative'>
                <span className='hidden xs:inline text-xs text-muted'>Rows</span>
                <div className='relative'>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className='flex items-center gap-1 sm:gap-2 bg-card px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors text-white font-medium min-w-[50px] sm:min-w-[80px] justify-between text-[10px] sm:text-xs font-bold'
                    >
                        <span>{perPage}</span>
                        {isDropdownOpen ? <ChevronUp className='w-3 h-3 sm:w-4 sm:h-4' /> : <ChevronDown className='w-3 h-3 sm:w-4 sm:h-4' />}
                    </button>

                    {isDropdownOpen && (
                        <>
                            <div
                                className='fixed inset-0 z-40'
                                onClick={() => setIsDropdownOpen(false)}
                            />
                            <div className='absolute bottom-full mb-2 right-0 w-24 sm:w-32 bg-card border border-gray-700 rounded-xl overflow-hidden shadow-2xl z-50'>
                                {[10, 50, 100, 200].map((value) => (
                                    <button
                                        key={value}
                                        onClick={() => {
                                            setPerPage(value);
                                            setCurrentPage(1);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-sm transition-colors hover:bg-gray-800 ${perPage === value ? 'bg-gray-800 text-white font-bold' : 'text-white'
                                            }`}
                                    >
                                        {value}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Pagination;
