import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#d97706', '#f59e0b', '#fcd34d', '#fed7aa', '#fde68a', '#d1d5db', '#9ca3af', '#4b5563'];
const isMobile = window.innerWidth < 768;

const StatCard = ({ title, data }) => {
    // Custom Legend Component
    const renderLegend = () => {
        return (
            <div className="flex flex-col gap-1.5 sm:gap-2 justify-center w-full">
                {data.map((entry, index) => (
                    <div key={`legend-${index}`} className="flex items-center justify-between text-xs w-full">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-gray-300 font-medium truncate max-w-[100px] sm:max-w-[150px]">{entry.name}</span>
                        </div>
                        <span className="text-gray-400 font-mono ml-4 tabular-nums text-right">
                            {entry.percent.toFixed(2)}%
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-[#0d0e12] border border-white/5 rounded-2xl p-4 sm:p-6 flex flex-col h-auto sm:h-[320px]">
            <h2 className="text-white font-bold text-base sm:text-lg mb-4">{title}</h2>

            {data && data.length > 0 ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 h-full">
                    {/* Chart */}
                    <div className="relative w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={isMobile ? 40 : 50} // Creates the donut hole
                                    outerRadius={isMobile ? 70 : 80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-[#1a1c23] border border-white/10 p-2 rounded-lg shadow-xl">
                                                    <span className="text-gray-200 font-bold text-xs">
                                                        {data.name}: <span className="text-white">{data.percent.toFixed(2)}%</span>
                                                    </span>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    {renderLegend()}
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    No data available
                </div>
            )}
        </div>
    );
};

const ExchangeStats = ({ tickers }) => {

    const { pairData, currencyData } = useMemo(() => {
        if (!tickers || tickers.length === 0) {
            return { pairData: [], currencyData: [] };
        }

        // --- 1. Volume by Market Pair ---
        // Sort by volume descending
        const sortedTickers = [...tickers].sort((a, b) =>
            (b.converted_volume?.usd || 0) - (a.converted_volume?.usd || 0)
        );

        const totalVolume = sortedTickers.reduce((sum, t) => sum + (t.converted_volume?.usd || 0), 0);

        // Take top 5 pairs
        const topPairs = sortedTickers.slice(0, 5).map(t => ({
            name: `${t.base}/${t.target}`,
            value: t.converted_volume?.usd || 0,
            percent: totalVolume > 0 ? ((t.converted_volume?.usd || 0) / totalVolume) * 100 : 0
        }));

        // Combine the rest into "Others"
        const otherPairsVolume = sortedTickers.slice(5).reduce((sum, t) => sum + (t.converted_volume?.usd || 0), 0);
        if (otherPairsVolume > 0) {
            topPairs.push({
                name: 'Others',
                value: otherPairsVolume,
                percent: totalVolume > 0 ? (otherPairsVolume / totalVolume) * 100 : 0
            });
        }


        // --- 2. Volume by Currency (Target) ---
        // Group by 'target' currency (e.g., USDT, USD, BTC)
        const currencyMap = {};
        sortedTickers.forEach(t => {
            const currency = t.target; // Using 'target' as the quote currency
            const vol = t.converted_volume?.usd || 0;
            if (currencyMap[currency]) {
                currencyMap[currency] += vol;
            } else {
                currencyMap[currency] = vol;
            }
        });

        // Convert map to array and sort
        const sortedCurrencies = Object.entries(currencyMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // Take top 5 currencies
        const topCurrencies = sortedCurrencies.slice(0, 5).map(c => ({
            name: c.name,
            value: c.value,
            percent: totalVolume > 0 ? (c.value / totalVolume) * 100 : 0
        }));

        // Combine rest
        const otherCurrenciesVolume = sortedCurrencies.slice(5).reduce((sum, c) => sum + c.value, 0);
        if (otherCurrenciesVolume > 0) {
            topCurrencies.push({
                name: 'Others',
                value: otherCurrenciesVolume,
                percent: totalVolume > 0 ? (otherCurrenciesVolume / totalVolume) * 100 : 0
            });
        }

        return { pairData: topPairs, currencyData: topCurrencies };

    }, [tickers]);

    return (
        <div className="w-full">
            <h2 className="text-lg sm:text-xl text-white font-bold mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center gap-2">
                <span>Exchange Statistics</span>
                <span className="text-[10px] sm:text-xs font-normal text-muted bg-white/5 px-2 py-1 rounded-full border border-white/5 w-fit">24h Vol Distribution</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title="Volume by Market Pair" data={pairData} />
                <StatCard title="Volume by Currency" data={currencyData} />
            </div>
        </div>
    );
};

export default ExchangeStats;
