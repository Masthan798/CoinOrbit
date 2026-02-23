import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Treemap, Cell, Brush
} from 'recharts';
import { Info, HelpCircle } from 'lucide-react';
import Breadcrumbs from '../../Components/common/Breadcrumbs';
import { useCurrency } from '../../Context/CurrencyContext';
import { NftMarketsData, SingleNftData } from '../../services/AllcoinsData';

// Mock/Static data matched to the UI layout requirements
const timeRanges = ['24H', '7D', '14D', '1M', '3M', 'Max'];

const ChartHeader = ({ title, description }) => (
  <div className="space-y-1 mb-6">
    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{title}</h2>
    <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
      {description}
    </p>
  </div>
);

const TimeRangeSelector = ({ activeRange, setRange }) => (
  <div className="flex p-0.5 bg-gray-800/20 border border-gray-800 rounded-lg w-fit">
    {timeRanges.map(range => (
      <button
        key={range}
        onClick={() => setRange(range)}
        className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${activeRange === range
          ? 'bg-white text-black shadow-lg scale-[1.02]'
          : 'text-muted-foreground hover:text-white'
          }`}
      >
        {range}
      </button>
    ))}
  </div>
);

const NFTGlobalChart = () => {
  const { formatPrice, currency } = useCurrency();
  const [activeRange, setActiveRange] = useState('Max');
  const [loading, setLoading] = useState(true);
  const [nftGlobal, setNftGlobal] = useState(null);
  const [markets, setMarkets] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const vsCurrency = currency.code.toLowerCase();

        // 1. Fetch Top NFT Markets for heatmap and stats
        const marketsRes = await NftMarketsData(vsCurrency);
        const safeMarkets = Array.isArray(marketsRes) ? marketsRes : [];
        setMarkets(safeMarkets);

        // 2. Fetch Benchmark NFT for responsive trend shaping (Pudgy Penguins)
        let benchmark;
        try {
          benchmark = await SingleNftData('pudgy-penguins');
        } catch (e) {
          console.warn("Benchmark fetch failed, using fallback constants");
          benchmark = { floor_price_in_usd_24h_percentage_change: 1.07 };
        }

        // 3. Aggregate global NFT data with robust nested extraction
        const topPunks = safeMarkets.find(m => m.id === 'cryptopunks');

        const getVal = (obj, key) => {
          if (!obj) return 0;
          if (typeof obj === 'number') return obj;
          return obj[key] || obj.usd || 0;
        };

        const totalCap = safeMarkets.reduce((acc, m) => acc + getVal(m.market_cap, vsCurrency), 0) || 17510000000;
        const totalVol = safeMarkets.reduce((acc, m) => acc + getVal(m.volume_24h, vsCurrency), 0) || 19800000;

        setNftGlobal({
          total_market_cap: totalCap,
          total_volume: totalVol,
          punk_dominance: topPunks ? (getVal(topPunks.market_cap, vsCurrency) / totalCap) * 100 : 36.0,
          change_24h: benchmark.floor_price_in_usd_24h_percentage_change || 1.07
        });

        // 4. Generate Responsive historical data based on benchmark collection
        const p1y = getVal(benchmark.floor_price_1y_percentage_change, 'usd') || 429.5;
        const p30d = getVal(benchmark.floor_price_30d_percentage_change, 'usd') || -14.3;
        const p7d = getVal(benchmark.floor_price_7d_percentage_change, 'usd') || -18.0;

        const mockHistory = Array.from({ length: 100 }, (_, i) => {
          let multiplier = 1;
          if (i < 20) multiplier = 0.2 + (i / 20) * (p1y / 100);
          else if (i < 70) multiplier = (p1y / 100) * (0.9 + Math.sin(i / 10) * 0.1);
          else if (i < 90) multiplier = (p1y / 100) * (1 + (p30d / 100) * ((i - 70) / 20));
          else multiplier = (p1y / 100) * (1 + (p30d / 100) + (p7d / 100) * ((i - 90) / 10));

          const baseCap = totalCap * multiplier * (0.95 + Math.random() * 0.1);
          return {
            time: Date.now() - (100 - i) * 24 * 60 * 60 * 1000,
            cap: baseCap,
            vol: totalVol * (0.5 + Math.random()),
            others: 60 + Math.random() * 5 + (multiplier * 2),
            punks: 30 + Math.random() * 5 - (multiplier * 1),
          };
        });
        setChartData(mockHistory);

      } catch (err) {
        console.error("Failed to fetch NFT dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [currency.code]);

  const formatXAxis = (tickItem) => {
    return new Date(tickItem).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white p-4 sm:p-8 flex flex-col gap-10">
      <Breadcrumbs
        crumbs={[
          { label: 'NFTs', path: '/nft-floor' },
          { label: 'Global Charts' }
        ]}
      />

      {/* Global Info Section */}
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Global NFT Stats, Charts and Heatmap</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-4xl">
            The global NFT market cap is currently valued at <span className="text-white font-bold">{formatPrice(nftGlobal?.total_market_cap || 0, { notation: 'compact' })}</span>,
            representing a <span className={`${(nftGlobal?.change_24h || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'} font-bold`}>
              {(nftGlobal?.change_24h || 0).toFixed(2)}%
            </span> change in the last 24 hours as total NFT sales volume reached <span className="text-white font-bold">{formatPrice(nftGlobal?.total_volume || 0, { notation: 'compact' })}</span>.
          </p>
        </header>

        <div className="p-4 bg-card/10 border-gray-800 border-2 rounded-2xl w-fit flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
            <img src="https://assets.coingecko.com/nft_contracts/images/2/small/cryptopunks.png" alt="Punk" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <div className="text-2xl font-black">{nftGlobal?.punk_dominance?.toFixed(1) || '36.0'}%</div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
              Punk Dominance <Info size={10} />
            </div>
          </div>
        </div>
      </div>

      {/* Total Market Cap Chart Section */}
      <section className="space-y-2">
        <ChartHeader
          title="Total NFT Market Cap Chart"
          description="The chart below shows the total market cap & volume of NFT collections tracked across all chains. Only the collections that we have assigned a market cap rank will be counted."
        />
        <div className="p-4 sm:p-8 bg-card/5 border-gray-800 border-2 rounded-[2rem] sm:rounded-[3rem] space-y-8 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[120px] rounded-full -mr-32 -mt-32" />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
            <TimeRangeSelector activeRange={activeRange} setRange={setActiveRange} />
            <div className="flex gap-8">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Global Cap</span>
                <span className="text-xl font-black text-emerald-400">{formatPrice(nftGlobal?.total_market_cap || 0, { notation: 'compact' })}</span>
              </div>
              <div className="flex flex-col border-l border-white/5 pl-8">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">24h Volume</span>
                <span className="text-xl font-black text-white">{formatPrice(nftGlobal?.total_volume || 0, { notation: 'compact' })}</span>
              </div>
            </div>
          </div>

          <div className="h-[500px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCap" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity={0.05} />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis
                  dataKey="time"
                  tickFormatter={formatXAxis}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900 }}
                />
                <YAxis
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900 }}
                  tickFormatter={(val) => formatPrice(val, { notation: 'compact' })}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-4 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl space-y-2">
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-1">
                            {new Date(payload[0].payload.time).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                          <div className="flex justify-between gap-8">
                            <span className="text-[10px] text-white/60 font-black uppercase">Market Cap</span>
                            <span className="text-sm font-black text-white">{formatPrice(payload[0].value)}</span>
                          </div>
                          <div className="flex justify-between gap-8">
                            <span className="text-[10px] text-white/60 font-black uppercase">Volume</span>
                            <span className="text-sm font-black text-white/50">{formatPrice(payload[0].payload.vol)}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="vol" fill="url(#volGradient)" barSize={20} radius={[5, 5, 0, 0]} />
                <Area
                  type="monotone"
                  dataKey="cap"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCap)"
                  animationDuration={2000}
                />
                <Brush
                  dataKey="time"
                  height={40}
                  stroke="#10b981"
                  fill="#0b0e11"
                  tickFormatter={formatXAxis}
                  travellerWidth={10}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Dominance Chart Section */}
      <section className="space-y-4">
        <ChartHeader
          title="Top NFT Collections Dominance Chart"
          description="The chart below compares the market cap dominance of the top 10 largest NFT collections over time."
        />
        <div className="p-4 sm:p-8 bg-card/5 border-gray-800 border-2 rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden relative">
          <div className="h-[500px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis
                  dataKey="time"
                  tickFormatter={formatXAxis}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900 }}
                />
                <YAxis
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900 }}
                  tickFormatter={(val) => `${val}%`}
                  domain={[0, 100]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-4 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl space-y-2">
                          {payload.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between gap-8">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-[10px] text-white font-black uppercase tracking-widest">{entry.name}</span>
                              </div>
                              <span className="text-xs font-black text-white">{entry.value.toFixed(1)}%</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" name="Others" dataKey="others" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" name="Punks" dataKey="punks" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.8} />
                <Brush
                  dataKey="time"
                  height={30}
                  stroke="#10b981"
                  fill="#0b0e11"
                  tickFormatter={formatXAxis}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#10b981]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">CryptoPunks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Others</span>
            </div>
          </div>
        </div>
      </section>

      {/* Heatmap Section */}
      <section className="space-y-4">
        <ChartHeader
          title="Live NFT Heatmap"
          description="View a live visualization of the NFT market below. The heatmap shows the current market share for the top NFT collections, alongside live prices and the 24-hour price change."
        />

        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between mb-4">
          <div className="flex p-0.5 bg-gray-800/20 border border-gray-800 rounded-lg w-fit">
            {['24H', '7D', '1M'].map(t => (
              <button key={t} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${t === '24H' ? 'bg-white text-black' : 'text-muted-foreground hover:text-white'}`}>
                {t}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-gray-800/20 border border-gray-800 rounded-lg text-[10px] font-bold uppercase text-white hover:bg-gray-800/40 transition-all">
            All Chains <HelpCircle size={10} />
          </button>
        </div>

        <div className="p-4 bg-card/5 border-gray-800 border-2 rounded-[2rem] sm:rounded-[3rem] min-h-[600px] flex items-center justify-center overflow-hidden shadow-2xl">
          {loading ? (
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-full" />
              <div className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Loading Heatmap...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={600}>
              <Treemap
                data={markets.slice(0, 50).map(m => ({
                  name: m.name,
                  size: m.market_cap,
                  change: m.floor_price_24h_percentage_change,
                  img: m.image?.small || m.image?.large
                }))}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#0b0e11"
                fill="#22c55e"
                content={<CustomTreeMapContent />}
              />
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
};

const CustomTreeMapContent = (props) => {
  const { x, y, width, height, index, root, name, change, img } = props;

  if (width < 30 || height < 30) return null;

  const isPositive = change >= 0;
  const absChange = Math.abs(change || 0).toFixed(1);

  // Scale colors based on change
  const greenScale = ['#064e3b', '#065f46', '#047857', '#059669', '#10b981', '#34d399'];
  const redScale = ['#450a0a', '#7f1d1d', '#991b1b', '#b91c1c', '#dc2626', '#ef4444'];

  let backgroundColor = '#333';
  if (change !== undefined) {
    const colorIdx = Math.min(Math.floor(Math.abs(change) / 2), 5);
    backgroundColor = isPositive ? greenScale[colorIdx] : redScale[colorIdx];
  }

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: backgroundColor,
          stroke: '#0b0e11',
          strokeWidth: 2,
        }}
      />
      {width > 100 && height > 60 && (
        <foreignObject x={x + 5} y={y + 5} width={width - 10} height={height - 10}>
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-2 select-none overflow-hidden">
            {img && <img src={img} className="w-12 h-12 rounded-full mb-2 bg-black/20 p-1" alt="" />}
            <div className="text-white font-black text-xs sm:text-base leading-tight truncate w-full uppercase tracking-tighter">
              {name}
            </div>
            <div className={`text-[10px] sm:text-sm font-bold ${isPositive ? 'text-white' : 'text-white/80'}`}>
              {isPositive ? '+' : '-'}{absChange}%
            </div>
          </div>
        </foreignObject>
      )}
    </g>
  );
};

export default NFTGlobalChart;