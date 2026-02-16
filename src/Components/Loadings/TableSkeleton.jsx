import React from 'react';

const TableSkeleton = ({ rows = 10, columns = 7 }) => {
    return (
        <div className="w-full animate-pulse">
            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[900px] text-left border-collapse">
                    <thead className="border-b border-gray-800">
                        <tr>
                            {Array.from({ length: columns }).map((_, index) => (
                                <th key={index} className="py-4 px-4">
                                    <div className="h-4 bg-gray-800 rounded w-24"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                            <tr key={rowIndex} className="border-b border-gray-800/50">
                                {Array.from({ length: columns }).map((_, colIndex) => (
                                    <td key={colIndex} className="py-4 px-4">
                                        <div className="h-4 bg-gray-800/50 rounded w-full max-w-[120px]"></div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TableSkeleton;
