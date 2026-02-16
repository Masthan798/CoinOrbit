import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { coingeckoFetch } from '../../api/coingeckoClient'
import { Zap } from 'lucide-react'
import CompareGraph from '../../Components/Graphs/CompareGraph'
import CoinSelector from '../../Components/Inputs/CoinSelector'
import ComparisonPieChart from '../../Components/Graphs/ComparisonPieChart'
import PopularComparisons from '../../Components/Coins/PopularComparisons'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.5
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const CompareCoins = () => {
  const [coinsList, setCoinsList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  // Default selections
  const [selectedCoin1, setSelectedCoin1] = useState('bitcoin');
  const [selectedCoin2, setSelectedCoin2] = useState('ethereum');

  const [selectTab, setSelectTab] = useState('Price')

  const [coin1Data, setCoin1Data] = useState(null);
  const [coin2Data, setCoin2Data] = useState(null);
  const [loadingData, setLoadingData] = useState(false);


  const TabsData = ['Price', 'Market Cap', 'Volume', 'FDV', 'Implied Price']

  useEffect(() => {
    const fetchCoinList = async () => {
      try {
        setLoadingList(true);
        const data = await coingeckoFetch('coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false');
        setCoinsList(data);
      } catch (error) {
        console.error("Error fetching coin list:", error);
      } finally {
        setLoadingList(false);
      }
    };
    fetchCoinList();
  }, []);

  useEffect(() => {
    const fetchCoinData = async () => {
      setLoadingData(true);
      try {
        // Fetch full details for FDV and other metrics
        // We need 'market_data=true'
        const [data1, data2] = await Promise.all([
          coingeckoFetch(`coins/${selectedCoin1}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`),
          coingeckoFetch(`coins/${selectedCoin2}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
        ]);
        setCoin1Data(data1);
        setCoin2Data(data2);
      } catch (error) {
        console.error("Error fetching coin comparison data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    if (selectedCoin1 && selectedCoin2) {
      fetchCoinData();
    }
  }, [selectedCoin1, selectedCoin2]);

  // Calculation Logic
  // "Solana price with the fully diluted valuation of Ethereum"
  // Formula: Price = Coin2_FDV / Coin1_CirculatingSupply (or Coin1_TotalSupply if strictly FDV to FDV, but standard "implied price" usually uses circulating)
  // Actually, "Price with FDV" usually means: What if Coin 1 reached Coin 2's Market Cap? 
  // If it says "fully diluted valuation", we should probably use FDV.
  // Let's use: Target Price = Coin2_FDV / Coin1_TotalSupply (since FDV is based on total/max supply). 
  // OR Target Price = Coin2_MC / Coin1_CirculatingSupply (Market Cap comparison). 
  // The user text says "price with the fully diluted valuation". So we use Coin 2's FDV.
  // To get the price per coin, we divide that Total Value (Coin 2 FDV) by Coin 1's Supply. 

  const getComparisonMetrics = () => {
    if (!coin1Data || !coin2Data) return null;

    const c1 = coin1Data;
    const c2 = coin2Data;

    const c2FDV = c2.market_data.fully_diluted_valuation.usd || c2.market_data.market_cap.usd;
    // Use Max Supply if available, else Total Supply, else Circulating for divisor
    const c1Supply = c1.market_data.max_supply || c1.market_data.total_supply || c1.market_data.circulating_supply;

    const impliedPrice = c2FDV / c1Supply;
    const currentPrice = c1.market_data.current_price.usd;
    const impliedMultiplier = impliedPrice / currentPrice;

    const c1VOl = c1.market_data.total_volume.usd;
    const c2VOl = c2.market_data.total_volume.usd;

    const c1MC = c1.market_data.market_cap.usd;
    const c2MC = c2.market_data.market_cap.usd;

    const c1Price = c1.market_data.current_price.usd;
    const c2Price = c2.market_data.current_price.usd;


    // determine what to return based on selectTab
    let mainValue = 0;
    let multiplier = 0;
    let headerText = '';
    let subValue1 = 0;
    let subValue2 = 0;
    let subLabel = '';

    if (selectTab === 'Price') {
      mainValue = c1Price;
      multiplier = c1Price / c2Price;
      headerText = 'price vs';
      subValue1 = c1Price;
      subValue2 = c2Price;
      subLabel = 'Price';
    } else if (selectTab === 'Market Cap') {
      mainValue = c1MC;
      multiplier = c1MC / c2MC;
      headerText = 'Market Cap vs';
      subValue1 = c1MC;
      subValue2 = c2MC;
      subLabel = 'Market Cap';
    } else if (selectTab === 'Volume') {
      mainValue = c1VOl;
      multiplier = c1VOl / c2VOl;
      headerText = 'Volume vs';
      subValue1 = c1VOl;
      subValue2 = c2VOl;
      subLabel = 'Volume';
    } else if (selectTab === 'FDV') {
      mainValue = c1.market_data.fully_diluted_valuation.usd || c1MC;
      const c2Val = c2.market_data.fully_diluted_valuation.usd || c2MC;
      multiplier = mainValue / c2Val;
      headerText = 'FDV vs';
      subValue1 = mainValue;
      subValue2 = c2Val;
      subLabel = 'FDV';
    } else {
      // Implied Price
      mainValue = impliedPrice;
      multiplier = impliedMultiplier;
      headerText = 'price with FDV of';
      subValue1 = c1.market_data.fully_diluted_valuation.usd || c1MC;
      subValue2 = c2.market_data.fully_diluted_valuation.usd || c2MC; // Fixed to use c2 FDV for the second card
      subLabel = 'FDV';
    }

    return {
      mainValue,
      multiplier,
      headerText,
      subValue1,
      subValue2,
      subLabel,
      c1Rank: c1.market_cap_rank,
      c2Rank: c2.market_cap_rank
    };
  };

  const metrics = getComparisonMetrics();
  const formatCurrency = (val) => val ? `$${val.toLocaleString()}` : 'N/A';

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className='w-full flex flex-col justify-start items-start bg-main min-h-full p-4 pb-8 rounded-xl gap-8'>
      <div className='flex items-center gap-2 text-sm'>
        <span className='text-muted cursor-pointer'>Tools</span>
        <span className='text-muted'>/</span>
        <span className='text-white cursor-pointer'>CompareCoins</span>
      </div>
      <motion.div variants={itemVariants} className='w-full flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0'>



        <div className='flex flex-col gap-2 w-full md:w-auto text-center md:text-left'>
          <h1 className='text-3xl font-bold'>Compare Cryptocurrencies</h1>
          <p className='text-muted'>Compare price, market cap, trading volume, and more</p>
        </div>

        <div className='w-full md:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
          <div className='flex flex-nowrap md:flex-wrap items-center gap-2 bg-card p-1 rounded-lg border border-gray-800 min-w-max'>
            {TabsData.map((tab, index) => (
              <button
                key={index}
                onClick={() => setSelectTab(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap flex-shrink-0 ${selectTab === tab ? 'bg-card text-white shadow-lg' : 'text-muted hover:text-white hover:bg-white/5'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className='w-full'>
        <div className='w-full flex flex-col lg:flex-row gap-6'>

          {/* Left Column: Controls & Stats */}
          <div className='w-full lg:w-[450px] flex-shrink-0 flex flex-col gap-4'>

            {/* Selection Area */}
            <div className='flex flex-col gap-3 px-4 py-4 border-gray-800 border rounded-md hover:border-gray-500 transition-all'>
              <div className='flex flex-col gap-2'>
                <label className='text-muted'>Select Coin 1</label>
                <CoinSelector
                  selectedCoinId={selectedCoin1}
                  onSelect={setSelectedCoin1}
                  coinsList={coinsList}
                  loading={loadingList}
                />
              </div>

              <div className='flex flex-col gap-2'>
                <label className='text-muted'>Select Coin 2</label>
                <CoinSelector
                  selectedCoinId={selectedCoin2}
                  onSelect={setSelectedCoin2}
                  coinsList={coinsList}
                  loading={loadingList}
                />
              </div>
            </div>

            {/* FDV Comparison Section */}
            {
              coin1Data && coin2Data && metrics ? (
                <div className='flex flex-col gap-6 items-center w-full px-4 py-6 border-gray-800 border rounded-md hover:border-gray-500 transition-all relative overflow-hidden bg-card/10'>

                  <div className='flex items-center text-center px-2'>
                    <span className='flex flex-wrap items-center justify-center text-md gap-1 text-muted'>
                      <img src={coin1Data.image.small} alt={coin1Data.name} className='w-6 h-6' />
                      <span className='font-bold text-lg text-white'>{coin1Data.name}</span>
                      <span>{metrics.headerText}</span>
                      <img src={coin2Data.image.small} alt={coin2Data.name} className='w-6 h-6 ml-1' />
                      <span className='font-bold text-lg text-white'>{coin2Data.name}</span>
                    </span>
                  </div>

                  <div className='flex flex-col items-center gap-1'>
                    <span className='text-3xl font-bold'>{formatCurrency(metrics.mainValue)}</span>
                    <span className={`text-lg font-medium ${metrics.multiplier >= 1 ? 'text-green-500' : 'text-red-500'}`}>
                      ({metrics.multiplier.toFixed(2)}x)
                    </span>
                  </div>

                  <div className='flex flex-col w-full gap-2 border-t border-gray-800 pt-4 mt-2'>
                    <div className='flex justify-between items-center px-3 py-2 border border-gray-800 rounded-md hover:bg-card/30 transition-colors'>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm text-muted'>{coin1Data.symbol.toUpperCase()} {metrics.subLabel}</span>
                        <span className='px-1.5 py-0.5 text-[10px] bg-white/10 rounded text-gray-300'>#{coin1Data.market_cap_rank}</span>
                      </div>
                      <span className='text-white font-mono text-sm'>{formatCurrency(metrics.subValue1)}</span>
                    </div>
                    <div className='flex justify-between items-center px-3 py-2 border border-gray-800 rounded-md hover:bg-card/30 transition-colors'>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm text-muted'>{coin2Data.symbol.toUpperCase()} {metrics.subLabel}</span>
                        <span className='px-1.5 py-0.5 text-[10px] bg-white/10 rounded text-gray-300'>#{coin2Data.market_cap_rank}</span>
                      </div>
                      <span className='text-white font-mono text-sm'>{formatCurrency(metrics.subValue2)}</span>
                    </div>
                  </div>

                  <div className="absolute bottom-2 right-2 opacity-20 pointer-events-none flex items-center gap-1.5 scale-75">
                    <div className="w-5 h-5 bg-[#3b82f6] rounded-full flex items-center justify-center">
                      <Zap size={10} className="text-white fill-white" />
                    </div>
                    <span className="text-xs font-black tracking-tighter text-white uppercase italic">COIN<span className="text-blue-500">ORBIT</span></span>
                  </div>
                </div>
              ) : (
                <div className='flex flex-col gap-6 items-center w-full px-4 py-6 border-gray-800 border rounded-md relative overflow-hidden bg-card/10 animate-pulse h-[250px]'>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-800 rounded-full"></div>
                    <div className="h-4 w-24 bg-gray-800 rounded"></div>
                    <div className="w-6 h-6 bg-gray-800 rounded-full"></div>
                    <div className="h-4 w-24 bg-gray-800 rounded"></div>
                  </div>
                  <div className="flex flex-col items-center gap-2 mt-4">
                    <div className="h-10 w-48 bg-gray-800 rounded"></div>
                    <div className="h-6 w-32 bg-gray-800 rounded"></div>
                  </div>
                  <div className="w-full mt-auto space-y-2">
                    <div className="h-10 w-full bg-gray-800 rounded"></div>
                    <div className="h-10 w-full bg-gray-800 rounded"></div>
                  </div>
                </div>
              )
            }
          </div>

          {/* Right Column: Graph */}
          <div className="w-full h-[600px] lg:h-auto lg:flex-1 lg:min-h-[500px]">
            {coin1Data && coin2Data && (
              <CompareGraph
                coin1Id={selectedCoin1}
                coin2Id={selectedCoin2}
                coin1Name={coin1Data.name}
                coin2Name={coin2Data.name}
                dataType={
                  selectTab === 'Market Cap' ? 'market_caps' :
                    selectTab === 'Volume' ? 'total_volumes' :
                      selectTab === 'FDV' ? 'market_caps' :
                        'prices'
                }
              />
            )}
          </div>

        </div>
      </motion.div>

      {/* Pie Chart Section - Below Component Section */}
      {coin1Data && coin2Data && metrics && (
        <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-6'>
          <ComparisonPieChart
            title={`${selectTab} Comparison`}
            data={[
              { name: coin1Data.name, value: Number(metrics.subValue1) || 0, color: '#3b82f6' },
              { name: coin2Data.name, value: Number(metrics.subValue2) || 0, color: '#facc15' }
            ]}
          />
          <PopularComparisons
            coinsList={coinsList}
            onSelect={(id1, id2) => {
              setSelectedCoin1(id1);
              setSelectedCoin2(id2);
            }}
          />
        </div>
      )}
    </motion.div>
  )
}

export default CompareCoins