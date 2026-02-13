import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import GlobalMarketGraph from '../../Components/Graphs/GlobalMarketGraph';
import GlobalDominanceChart from '../../Components/Graphs/GlobalDominanceChart';
import GlobalDefiChart from '../../Components/Graphs/GlobalDefiChart';
import GlobalStablecoinsChart from '../../Components/Graphs/GlobalStablecoinsChart';
import GlobalAltcoinsChart from '../../Components/Graphs/GlobalAltcoinsChart';
import { TrendingUp, Activity, Layers, Coins } from 'lucide-react';

const GlobalChart = () => {
  const [globalData, setGlobalData] = useState(null);
  const [defiData, setDefiData] = useState(null);
  const [loading, setLoading] = useState(true);

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

      } catch (err) {
        console.error("Error fetching global data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (val) => {
    if (!val) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
  };

  const StatCard = ({ label, value, subValue, icon: Icon, color }) => (
    <div className="bg-[#0b0e11] border border-gray-800 p-6 rounded-3xl flex items-center justify-between gap-4 group hover:border-gray-600 transition-all">
      <div className="flex-1">
        <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
        <h4 className="text-2xl font-bold text-white mb-2 break-all">{value}</h4>
        {subValue && <p className={`text-xs font-bold ${subValue.toString().includes('-') ? 'text-red-500' : 'text-green-500'}`}>{subValue}</p>}
      </div>
      <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center bg-${color}-500/10 border border-${color}-500/20 group-hover:scale-110 transition-transform`}>
        <Icon className={`text-${color}-500`} size={24} />
      </div>
    </div>
  );

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
          <div className='flex items-center gap-2 text-sm mb-2'>
            <span className='text-muted cursor-pointer'>Tools</span>
            <span className='text-muted'>/</span>
            <span className='text-white cursor-pointer'>Global Charts</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Global Cryptocurrency Market Charts</h1>
          <p className="text-muted max-w-3xl">
            The global cryptocurrency market cap today is <span className="text-white font-bold">{globalData ? formatCurrency(globalData.total_market_cap.usd) : '...'}</span>,
            a <span className={globalData?.market_cap_change_percentage_24h_usd >= 0 ? "text-green-500" : "text-red-500"}>
              {globalData?.market_cap_change_percentage_24h_usd?.toFixed(2)}%
            </span> change in the last 24 hours.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            [...Array(4)].map((_, i) => <div key={i} className="h-32 bg-[#0b0e11] animate-pulse rounded-3xl border border-gray-800" />)
          ) : (
            <>
              <StatCard
                label="Market Cap"
                value={formatCurrency(globalData?.total_market_cap?.usd)}
                subValue={`${globalData?.market_cap_change_percentage_24h_usd?.toFixed(2)}% (24h)`}
                icon={TrendingUp}
                color="blue"
              />
              <StatCard
                label="24h Volume"
                value={formatCurrency(globalData?.total_volume?.usd)}
                subValue="Total Trading Volume"
                icon={Activity}
                color="purple"
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
              <p className="text-2xl font-bold text-blue-400">{formatCurrency(Number(defiData.defi_market_cap))}</p>
              <p className="text-xs text-muted">ratio to global: {Number(defiData.defi_to_eth_ratio || 0).toFixed(2)}% (to ETH)</p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-1">Trading Volume (24h)</h4>
              <p className="text-2xl font-bold text-purple-400">{formatCurrency(Number(defiData.trading_volume_24h))}</p>
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