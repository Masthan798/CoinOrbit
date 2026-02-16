import React from 'react';

const StatsCardSkeleton = () => {
    return (
        <div className="flex flex-col gap-2 justify-center items-start p-6 border-gray-700 border rounded-xl bg-card/30 animate-pulse h-[110px]">
            {/* Value */}
            <div className="h-8 bg-gray-700 rounded w-24"></div>
            {/* Label */}
            <div className="h-4 bg-gray-700 rounded w-32 mt-2"></div>
        </div>
    );
};

export default StatsCardSkeleton;
