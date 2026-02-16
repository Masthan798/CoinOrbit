import { Routes, Route, useLocation } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import Categories from "../Pages/Cryptocurrencies/Categories"
import Chains from "../Pages/Cryptocurrencies/Chains"
import CryptoTreasuries from "../Pages/Cryptocurrencies/CryptoTreasuries"
import MarketCap from "../Pages/Cryptocurrencies/MarketCap"
import CoinDetail from "../Pages/Cryptocurrencies/CoinDetail"
import HighlightsDetail from "../Pages/Cryptocurrencies/HighlightsDetail"
import CryptoExchanges from "../Pages/Exchages/CryptoExchanges"
import DxE from "../Pages/Exchages/DxE"
import Derivatives from "../Pages/Exchages/Derivatives"
import ExchangeDetail from "../Pages/Exchages/ExchangeDetail"
import PerpDEXs from "../Pages/Exchages/PerpDEXs"
import NFTFloorPrice from "../Pages/Nft/NFTFloorPrice"
import NFTRelatedCoins from "../Pages/Nft/NFTRelatedCoins"
import NFTWatchlist from "../Pages/Nft/NFTWatchlist"
import NFTGlobalChart from "../Pages/Nft/NFTGlobalChart"
import Portfolio from "../Pages/Portfolio/Portfolio"
import Support from "../Pages/Support/Support"
import Allcoins from "../Pages/Tools/Allcoins"
import Converter from "../Pages/Tools/Converter"
import CoinConversionDetail from "../Pages/Tools/CoinConversionDetail"
import CompareCoins from "../Pages/Tools/CompareCoins"
import GlobalChart from "../Pages/Tools/GlobalChart"



const AppRouter = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>

                {/* Cryptocurrencies-nav-list-route */}

                <Route path="/cryptocurrencies/categories" element={<Categories />} />
                <Route path="/cryptocurrencies/chains" element={<Chains />} />
                <Route path="/cryptocurrencies/cryptotreasuries" element={<CryptoTreasuries />} />
                <Route path="/cryptocurrencies/marketcap/:coinId" element={<CoinDetail />} />
                <Route path="/cryptocurrencies/marketcap/:coinId" element={<CoinDetail />} />
                <Route path="/cryptocurrencies/highlights/:type" element={<HighlightsDetail />} />
                <Route path="/" element={<MarketCap />} />


                {/* Exchanges-nav-list-route */}
                <Route path="/exchanges/cryptoexchanges/:exchangeId" element={<ExchangeDetail />} />
                <Route path="/exchanges/cryptoexchanges" element={<CryptoExchanges />} />
                <Route path="/exchanges/decentrilizedexchages" element={<DxE />} />
                <Route path="/exchanges/derivatives" element={<Derivatives />} />
                <Route path="/exchanges/perpdexs" element={<PerpDEXs />} />

                {/* NFT-nav-list-route */}
                <Route path="/nft/nftfloorprice" element={<NFTFloorPrice />} />
                <Route path="/nft/nftrelatedcoins" element={<NFTRelatedCoins />} />
                <Route path="/nft/nftwatchlist" element={<NFTWatchlist />} />
                <Route path="/nft/nftglobalchart" element={<NFTGlobalChart />} />

                {/* Tools-nav-list-route */}
                <Route path="/tools/allcoins" element={<Allcoins />} />
                <Route path="/tools/converter" element={<Converter />} />
                <Route path="/tools/converter/:coinId/:currencyCode" element={<CoinConversionDetail />} />
                <Route path="/tools/comparecoins" element={<CompareCoins />} />
                <Route path="/tools/globalchart" element={<GlobalChart />} />

                {/* My Portfolio && Support nav-list-route */}
                <Route path="/myportfolio" element={<Portfolio />} />
                <Route path="/support" element={<Support />} />


            </Routes>
        </AnimatePresence>
    )
}
export default AppRouter