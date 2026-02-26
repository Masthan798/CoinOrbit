import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import GlobalMarketGraph from '../../Components/Graphs/GlobalMarketGraph';
import GlobalDominanceChart from '../../Components/Graphs/GlobalDominanceChart';
import GlobalDefiChart from '../../Components/Graphs/GlobalDefiChart';
import GlobalStablecoinsChart from '../../Components/Graphs/GlobalStablecoinsChart';
import GlobalAltcoinsChart from '../../Components/Graphs/GlobalAltcoinsChart';
import { TrendingUp, Activity, Layers, Coins } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import Breadcrumbs from '../../Components/common/Breadcrumbs';
import { useCurrency } from '../../Context/CurrencyContext';

const GlobalChart = () => {
  const [globalData, setGlobalData] = useState(null);
  const [defiData, setDefiData] = useState(null);
  const [sparklineData, setSparklineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currency, formatPrice } = useCurrency();

  // User provided API Key
  const API_KEY = 'CG-YuB3NdXKuFv58irhTuLNk2S9';
  const options = {
    method: 'GET',
    headers: { 'x-cg-demo-api-key': API_KEY }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Global Data
        const globalRes = await fetch('https://api.coingecko.com/api/v3/global', options);
        const globalJson = await globalRes.json();
        if (globalJson.data) setGlobalData(globalJson.data);

        // 2. Fetch DeFi Global Data
        const defiRes = await fetch('https://api.coingecko.com/api/v3/global/decentralized_finance_defi', options);
        const defiJson = await defiRes.json();
        if (defiJson.data) setDefiData(defiJson.data);

        // 3. Fetch 7-Day Sparkline Data (BTC Proxy)
        const sparkRes = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?days=7&vs_currency=${currency.code}`, options);
        const sparkJson = await sparkRes.json();
        if (sparkJson.market_caps) {
          setSparklineData({
            market_caps: sparkJson.market_caps.map(item => item[1]),
            total_volumes: sparkJson.total_volumes.map(item => item[1]),
          });
        }

      } catch (err) {
        console.error("Error fetching global data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currency.code]);

  const formatValue = (val) => {
    return formatPrice(val);
  };

  const StatCard = ({ label, value, subValue, icon: Icon, color, chartData }) => {
    const isPositive = chartData ? chartData[chartData.length - 1] >= chartData[0] : true;
    const trendColor = isPositive ? '#22c55e' : '#ef4444';

    return (
      <div
        className={`bg-[#0b0e11] p-4 sm:p-6 rounded-3xl flex items-center justify-between gap-4 group transition-all relative overflow-hidden h-40 border-2`}
        style={{
          borderColor: `${trendColor}20`,
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = `${trendColor}60`}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = `${trendColor}20`}
      >
        <div className="flex flex-col z-10 h-full justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
            <h4 className="text-2xl font-bold text-white break-all">{value}</h4>
          </div>
          {subValue && (
            <p className={`text-xs font-bold ${subValue.toString().includes('-') ? 'text-red-500' : 'text-green-500'}`}>
              {subValue}
            </p>
          )}
        </div>

        <div className={`w-12 h-12 shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform z-10 self-start`}>
          <Icon className={`text-${color}-500`} size={28} />
        </div>

        {chartData && (
          <div className="absolute inset-x-0 bottom-0 h-24 opacity-40 group-hover:opacity-60 transition-opacity pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.map(v => ({ value: v }))} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`gradient-${label.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={trendColor} stopOpacity={0.6} />
                    <stop offset="95%" stopColor={trendColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={trendColor}
                  fill={`url(#gradient-${label.replace(/\s+/g, '')})`}
                  strokeWidth={2.5}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full min-h-screen p-4 pb-20 flex flex-col items-center gap-8 bg-main"
    >
      <div className="w-full max-w-7xl flex flex-col gap-8">

        {/* Breadcrumb / Header */}
        <div className="flex flex-col gap-2">
          <Breadcrumbs
            crumbs={[
              { label: 'Market Cap', path: '/' },
              { label: 'Tools', path: '/allcoins' },
              { label: 'Global Charts' }
            ]}
          />
          <h1 className="text-3xl font-bold text-white">Global Cryptocurrency Market Charts</h1>
          <p className="text-muted max-w-3xl">
            The global cryptocurrency market cap today is <span className="text-white font-bold">{globalData ? formatPrice(globalData.total_market_cap[currency.code]) : '...'}</span>,
            a <span className={globalData?.market_cap_change_percentage_24h_usd >= 0 ? "text-green-500" : "text-red-500"}>
              {globalData?.market_cap_change_percentage_24h_usd?.toFixed(2)}%
            </span> change in the last 24 hours.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#0b0e11] border border-gray-800 p-6 rounded-3xl flex items-center justify-between gap-4 h-40 animate-pulse relative overflow-hidden">
                <div className="flex flex-col h-full justify-between z-10 w-full">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-800 rounded"></div>
                    <div className="h-8 w-32 bg-gray-800 rounded"></div>
                  </div>
                  <div className="h-3 w-16 bg-gray-800 rounded"></div>
                </div>
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-gray-800 self-start"></div>
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gray-800/10"></div>
              </div>
            ))
          ) : (
            <>
              <StatCard
                label="Market Cap"
                value={formatPrice(globalData?.total_market_cap?.[currency.code])}
                subValue={`${globalData?.market_cap_change_percentage_24h_usd?.toFixed(2)}% (24h)`}
                icon={TrendingUp}
                color="blue"
                chartData={sparklineData?.market_caps}
              />
              <StatCard
                label="24h Volume"
                value={formatPrice(globalData?.total_volume?.[currency.code])}
                subValue="Total Trading Volume"
                icon={Activity}
                color="purple"
                chartData={sparklineData?.total_volumes}
              />
              <StatCard
                label="BTC Dominance"
                value={`${globalData?.market_cap_percentage?.btc?.toFixed(2)}%`}
                subValue={`ETH: ${globalData?.market_cap_percentage?.eth?.toFixed(2)}%`}
                icon={Layers}
                color="orange" // BTC Color
              />
              <StatCard
                label="Active Cryptos"
                value={globalData?.active_cryptocurrencies?.toLocaleString()}
                subValue={`${globalData?.markets?.toLocaleString()} Markets`}
                icon={Coins}
                color="green"
              />
            </>
          )}
        </div>

        {/* DeFi Stats Section (If requested) or Extra Details */}
        {defiData && (
          <div className="w-full bg-[#0b0e11] border border-gray-800 rounded-3xl p-6 flex flex-wrap gap-8 items-center justify-between">
            <div>
              <h4 className="text-lg font-bold text-white mb-1">DeFi Market Cap</h4>
              <p className="text-2xl font-bold text-blue-400">{formatPrice(Number(defiData.defi_market_cap))}</p>
              <p className="text-xs text-muted">ratio to global: {Number(defiData.defi_to_eth_ratio || 0).toFixed(2)}% (to ETH)</p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-1">Trading Volume (24h)</h4>
              <p className="text-2xl font-bold text-purple-400">{formatPrice(Number(defiData.trading_volume_24h))}</p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-1">Top Coin</h4>
              <p className="text-xl font-bold text-white">{defiData.top_coin_name} <span className="text-sm text-muted">({defiData.top_coin_defi_dominance?.toFixed(2)}%)</span></p>
            </div>
          </div>
        )}

        {/* Chart Section */}
        <div className="w-full flex flex-col gap-8">
          <div className="w-full h-[500px]">
            <GlobalMarketGraph apiKey={API_KEY} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="w-full h-[500px]">
              <GlobalDominanceChart />
            </div>
            <div className="w-full h-[500px]">
              <GlobalAltcoinsChart />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="w-full h-[500px]">
              <GlobalDefiChart />
            </div>
            <div className="w-full h-[500px]">
              <GlobalStablecoinsChart />
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  )
}

export default GlobalChart