import React from 'react';
import TableSkeleton from '../../../Components/Loadings/TableSkeleton';
import CoinTableHeader from './CoinTableHeader';
import CoinTableRow from './CoinTableRow';

const CoinTable = ({
    loading,
    error,
    coins,
    sortConfig,
    handleSort,
    navigate
}) => {
    return (
        <div className='w-full overflow-x-auto rounded-xl border border-white/5 relative'>
            <table className='w-full min-w-[1200px] text-left text-sm'>
                <thead className='border-b border-gray-800 text-muted bg-[#0b0e11] sticky top-0 z-20'>
                    <tr>
                        <CoinTableHeader
                            label="#"
                            columnKey="market_cap_rank"
                            sortConfig={sortConfig}
                            onSort={handleSort}
                            minWidth="40px"
                            sticky="sticky left-0 bg-[#0b0e11] z-30"
                        />
                        <CoinTableHeader
                            label="Coin"
                            columnKey="name"
                            sortConfig={sortConfig}
                            onSort={handleSort}
                            minWidth="140px"
                            sticky="sticky left-[40px] md:left-[50px] bg-[#0b0e11] z-30"
                        />
                        <CoinTableHeader
                            label="Price"
                            columnKey="current_price"
                            sortConfig={sortConfig}
                            onSort={handleSort}
                            align="right"
                        />
                        <CoinTableHeader
                            label="1h"
                            columnKey="price_change_percentage_1h_in_currency"
                            sortConfig={sortConfig}
                            onSort={handleSort}
                            align="right"
                        />
                        <CoinTableHeader
                            label="24h"
                            columnKey="price_change_percentage_24h_in_currency"
                            sortConfig={sortConfig}
                            onSort={handleSort}
                            align="right"
                        />
                        <CoinTableHeader
                            label="7d"
                            columnKey="price_change_percentage_7d_in_currency"
                            sortConfig={sortConfig}
                            onSort={handleSort}
                            align="right"
                        />
                        <CoinTableHeader
                            label="30d"
                            columnKey="price_change_percentage_30d_in_currency"
                            sortConfig={sortConfig}
                            onSort={handleSort}
                            align="right"
                        />
                        <CoinTableHeader
                            label="24h Vol"
                            columnKey="total_volume"
                            sortConfig={sortConfig}
                            onSort={handleSort}
                            align="right"
                        />
                        <CoinTableHeader
                            label="Circ Supply"
                            columnKey="circulating_supply"
                            sortConfig={sortConfig}
                            onSort={handleSort}
                            align="right"
                        />
                        <CoinTableHeader
                            label="Total Supply"
                            columnKey="total_supply"
                            sortConfig={sortConfig}
                            onSort={handleSort}
                            align="right"
                        />
                        <CoinTableHeader
                            label="Mkt Cap"
                            columnKey="market_cap"
                            sortConfig={sortConfig}
                            onSort={handleSort}
                            align="right"
                        />
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="11" className="p-0">
                                <TableSkeleton rows={10} columns={11} />
                            </td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan="11" className="py-20 text-center text-red-500">{error}</td>
                        </tr>
                    ) : coins.length === 0 ? (
                        <tr>
                            <td colSpan="11" className="py-20 text-center text-muted">No coins match your filters.</td>
                        </tr>
                    ) : (
                        coins.map((coin) => (
                            <CoinTableRow key={coin.id} coin={coin} navigate={navigate} />
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default CoinTable;
