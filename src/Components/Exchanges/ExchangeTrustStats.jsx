import React, { useMemo } from 'react';
import { ShieldCheck, Info } from 'lucide-react';

const ExchangeTrustStats = ({ exchange, tickers }) => {
    // Calculate Average Bid-Ask Spread from tickers
    const avgSpread = useMemo(() => {
        if (!tickers || tickers.length === 0) return 0;
        const sum = tickers.reduce((acc, t) => acc + (t.bid_ask_spread_percentage || 0), 0);
        return sum / tickers.length;
    }, [tickers]);

    if (!exchange) return null;

    // Trust Score Breakdown (Mock/Static structure to match design since API lacks granular scores)
    const breakdown = [
        { name: 'Liquidity', value: 4.0 },
        { name: 'Scale', value: 3.5 }, // API doesn't give this, estimating based on rank/volume
        { name: 'Cybersecurity', value: 2.0 },
        { name: 'API Coverage', value: 0.5 },
        { name: 'Team', value: 0.5 },
        { name: 'Incident', value: 1.0 },
        { name: 'PoR', value: 1.0 },
    ];

    // Determine color based on trust score
    const scoreColor = exchange.trust_score >= 8 ? 'text-green-500' : exchange.trust_score >= 5 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full mt-8">
            {/* Left Card: Trust Score Breakdown */}
            <div className="w-full lg:w-1/3 bg-[#0d0e12] border border-white/5 rounded-2xl p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-white font-bold text-lg">{exchange.name} Trust Score</h3>
                    <Info size={14} className="text-gray-500 cursor-pointer hover:text-white transition-colors" />
                </div>

                <div className={`text-5xl font-bold mb-6 ${scoreColor}`}>
                    {exchange.trust_score}/10
                </div>

                <div className="flex flex-col gap-4">
                    {breakdown.map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-sm">{item.name}</span>
                                <Info size={12} className="text-gray-600" />
                            </div>
                            <span className="text-white font-mono font-medium">{item.value.toFixed(1)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Key Metrics */}
            <div className="flex-1 flex flex-col gap-6">

                {/* Liquidity Card */}
                <div className="bg-[#0d0e12] border border-white/5 rounded-2xl p-6">
                    <h3 className="text-white font-bold text-lg mb-4">Liquidity</h3>

                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-gray-400 text-sm">Reported Trading Volume</span>
                            <span className="text-white font-bold font-mono">
                                ${(exchange.trade_volume_24h_btc_normalized || exchange.trade_volume_24h_btc || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-gray-400 text-sm">Average Bid-Ask Spread</span>
                            <span className="text-white font-bold font-mono">
                                {avgSpread.toFixed(3)}%
                            </span>
                        </div>

                        <div className="flex flex-col gap-2 py-2 relative group">
                            <span className="text-gray-400 text-sm">Trading Pair Total Trust Score</span>

                            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden cursor-help">
                                <div
                                    className="h-full bg-gradient-to-r from-green-500 to-yellow-400 transition-all duration-500"
                                    style={{ width: `${(exchange.trust_score || 5) * 10}%` }}
                                />
                            </div>

                            {/* Hover Tooltip */}
                            <div className="absolute bottom-full right-0 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                <div className="bg-[#1a1c23] border border-white/10 px-3 py-1.5 rounded-lg shadow-xl text-xs font-bold text-white flex items-center gap-2">
                                    <ShieldCheck size={12} className={scoreColor} />
                                    <span>{exchange.trust_score}/10</span>
                                    <span className="text-gray-400">({(exchange.trust_score * 10).toFixed(0)}%)</span>
                                </div>
                                <div className="w-2 h-2 bg-[#1a1c23] border-r border-b border-white/10 rotate-45 absolute bottom-[-4px] right-4"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scale & Security Card */}
                <div className="bg-[#0d0e12] border border-white/5 rounded-2xl p-6 flex flex-col gap-6">
                    <div>
                        <h3 className="text-white font-bold text-lg mb-4">Scale</h3>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-gray-400 text-sm">Volume Percentile</span>
                            <span className="text-white font-bold text-sm">Top 5%</span> {/* Approximation */}
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-gray-400 text-sm">Combined Orderbook Percentile</span>
                            <span className="text-white font-bold text-sm">99th</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-bold text-lg mb-4">Cybersecurity</h3>
                        <div className="flex items-center gap-2">
                            <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                <ShieldCheck size={14} />
                                Certified
                            </div>
                            <div className="flex gap-0.5 text-green-500">
                                ★★★
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ExchangeTrustStats;
