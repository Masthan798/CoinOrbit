import React from 'react';
import { ArrowUpRight, ChevronUp, ChevronDown } from 'lucide-react';

const SortIcon = ({ columnKey, sortConfig }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpRight size={14} className="opacity-20 flex-shrink-0" />;
    return sortConfig.direction === 'asc'
        ? <ChevronUp size={14} className="text-blue-500 flex-shrink-0" />
        : <ChevronDown size={14} className="text-blue-500 flex-shrink-0" />;
};

const CoinTableHeader = ({ label, columnKey, sortConfig, onSort, align = 'left', minWidth, sticky }) => {
    return (
        <th
            className={`py-2 px-2 ${align === 'right' ? 'text-right' : 'text-left'} cursor-pointer hover:text-white transition-colors text-[10px] md:text-xs uppercase tracking-wider ${sticky ? sticky : ''}`}
            onClick={() => onSort(columnKey)}
            style={{ minWidth }}
        >
            <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
                {label} <SortIcon columnKey={columnKey} sortConfig={sortConfig} />
            </div>
        </th>
    );
};

export default CoinTableHeader;
