import React from 'react';
import { formatCurrency, formatCompact, renderPriceChange } from '../../../utils/formatters.jsx';

const CoinTableRow = ({ coin, navigate }) => {
    return (
        <tr
            onClick={() => navigate(`/cryptocurrencies/marketcap/${coin.id}`)}
            className='border-b border-gray-800/50 hover:bg-white/5 transition-colors cursor-pointer group'
        >
            <td className='py-2 px-1 text-muted sticky left-0 bg-main group-hover:bg-card transition-all z-10 text-xs'>
                {coin.market_cap_rank}
            </td>
            <td className='py-2 px-2 sticky left-[40px] md:left-[50px] bg-main group-hover:bg-card transition-all z-10'>
                <div className='flex items-center gap-2'>
                    <img src={coin.image} alt={coin.name} className='w-5 h-5 sm:w-6 sm:h-6 rounded-full' />
                    <div className='flex flex-col'>
                        <span className='font-bold text-white text-[11px] sm:text-sm whitespace-nowrap'>
                            {coin.name} <span className='text-[10px] text-muted uppercase ml-1'>{coin.symbol}</span>
                        </span>
                    </div>
                </div>
            </td>
            <td className='py-2 px-2 text-right font-bold text-xs sm:text-sm'>
                {formatCurrency(coin.current_price)}
            </td>
            <td className='py-2 px-2 text-right text-xs sm:text-sm'>
                {renderPriceChange(coin.price_change_percentage_1h_in_currency)}
            </td>
            <td className='py-2 px-2 text-right text-xs sm:text-sm'>
                {renderPriceChange(coin.price_change_percentage_24h_in_currency)}
            </td>
            <td className='py-2 px-2 text-right text-xs sm:text-sm'>
                {renderPriceChange(coin.price_change_percentage_7d_in_currency)}
            </td>
            <td className='py-2 px-2 text-right text-xs sm:text-sm'>
                {renderPriceChange(coin.price_change_percentage_30d_in_currency)}
            </td>
            <td className='py-2 px-2 text-right text-gray-300 text-xs sm:text-sm'>
                {formatCompact(coin.total_volume)}
            </td>
            <td className='py-2 px-2 text-right text-gray-300 text-xs sm:text-sm'>
                {formatCompact(coin.circulating_supply)}
            </td>
            <td className='py-2 px-2 text-right text-gray-300 text-xs sm:text-sm'>
                {coin.total_supply ? formatCompact(coin.total_supply) : (coin.max_supply ? formatCompact(coin.max_supply) : '∞')}
            </td>
            <td className='py-2 px-2 text-right text-gray-300 text-xs sm:text-sm whitespace-nowrap font-medium'>
                {formatCompact(coin.market_cap)}
            </td>
        </tr>
    );
};

export default CoinTableRow;
