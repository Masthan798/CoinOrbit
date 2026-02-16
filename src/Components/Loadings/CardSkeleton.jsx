import React from 'react';

const CardSkeleton = () => {
    return (
        <div className="bg-card/50 border border-gray-800 rounded-xl p-6 relative overflow-hidden animate-pulse h-full min-h-[160px]">
            <div className="flex flex-col gap-4">
                {/* Header (Title + Icon placeholder) */}
                <div className="flex justify-between items-start">
                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                    <div className="h-8 w-8 bg-gray-700 rounded-lg"></div>
                </div>

                {/* Main Value */}
                <div className="mt-2 text-2xl font-bold">
                    <div className="h-8 bg-gray-700 rounded w-32"></div>
                </div>

                {/* Footer / Secondary Info */}
                <div className="mt-auto flex items-center gap-2">
                    <div className="h-4 bg-gray-700 rounded w-16"></div>
                    <div className="h-4 bg-gray-700 rounded w-12"></div>
                </div>
            </div>
        </div>
    );
};

export default CardSkeleton;
