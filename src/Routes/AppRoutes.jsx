import { Routes, Route, useLocation, Navigate, useParams } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import ProtectedRoute from "../Components/common/ProtectedRoute"
import { useAuth } from "../context/AuthContext"
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
import CurrencyPrices from "../Pages/Tools/CurrencyPrices"
import NFTDetail from "../Pages/Nft/NFTDetail"
import Login from "../Pages/Auth/Login"
import Signup from "../Pages/Auth/Signup"
import ForgotPassword from "../Pages/Auth/ForgotPassword"
import ResetPassword from "../Pages/Auth/ResetPassword"

// Helper component for legacy redirects with parameters
const RedirectWithParam = ({ to, paramName }) => {
    const params = useParams();
    return <Navigate to={`${to}/${params[paramName]}`} replace />;
};

const AppRouter = () => {
    const location = useLocation();
    const { user } = useAuth();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>

                {/* Auth-nav-list-route (Public with Redirect for Auth Users) */}
                <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
                <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup />} />
                <Route path="/forgot-password" element={user ? <Navigate to="/" replace /> : <ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth" element={<Navigate to="/login" replace />} />

                {/* Protected Routes */}
                <Route path="/*" element={
                    <ProtectedRoute>
                        <Routes location={location} key={location.pathname}>
                            {/* Cryptocurrencies legacy redirects */}
                            <Route path="/cryptocurrencies/categories" element={<Navigate to="/categories" replace />} />
                            <Route path="/cryptocurrencies/chains" element={<Navigate to="/chains" replace />} />
                            <Route path="/cryptocurrencies/cryptotreasuries" element={<Navigate to="/cryptotreasuries" replace />} />
                            <Route path="/cryptocurrencies/marketcap/:coinId" element={<RedirectWithParam to="/marketcap" paramName="coinId" />} />
                            <Route path="/cryptocurrencies/marketcap" element={<Navigate to="/" replace />} />
                            <Route path="/cryptocurrencies/highlights/:type" element={<RedirectWithParam to="/highlights" paramName="type" />} />
                            <Route path="/cryptocurrencies" element={<Navigate to="/" replace />} />

                            {/* Cryptocurrencies-nav-list-route */}
                            <Route path="/categories" element={<Categories />} />
                            <Route path="/chains" element={<Chains />} />
                            <Route path="/cryptotreasuries" element={<CryptoTreasuries />} />
                            <Route path="/marketcap/:coinId" element={<CoinDetail />} />
                            <Route path="/marketcap" element={<Navigate to="/" replace />} />
                            <Route path="/highlights/:type" element={<HighlightsDetail />} />
                            <Route path="/highlights" element={<Navigate to="/categories" replace />} />
                            <Route path="/" element={<MarketCap />} />

                            {/* Exchanges legacy redirects */}
                            <Route path="/exchanges/cryptoexchanges/:exchangeId" element={<RedirectWithParam to="/exchange" paramName="exchangeId" />} />
                            <Route path="/exchanges/cryptoexchanges" element={<Navigate to="/exchanges" replace />} />
                            <Route path="/exchanges/dex" element={<Navigate to="/dex" replace />} />
                            <Route path="/exchanges/derivatives" element={<Navigate to="/derivatives" replace />} />
                            <Route path="/exchanges/perpdexs" element={<Navigate to="/perpdexs" replace />} />
                            <Route path="/exchanges/exchange-detail/:exchangeId" element={<RedirectWithParam to="/exchange" paramName="exchangeId" />} />

                            {/* Exchanges-nav-list-route */}
                            <Route path="/exchange/:exchangeId" element={<ExchangeDetail />} />
                            <Route path="/exchange" element={<Navigate to="/exchanges" replace />} />
                            <Route path="/exchanges" element={<CryptoExchanges />} />
                            <Route path="/dex" element={<DxE />} />
                            <Route path="/derivatives" element={<Derivatives />} />
                            <Route path="/perpdexs" element={<PerpDEXs />} />

                            {/* NFT legacy redirects */}
                            <Route path="/nft/nftfloorprice" element={<Navigate to="/nft-floor" replace />} />
                            <Route path="/nft/nftrelatedcoins" element={<Navigate to="/nft-coins" replace />} />
                            <Route path="/nft/nftwatchlist" element={<Navigate to="/nft-watchlist" replace />} />
                            <Route path="/nft/nftglobalchart" element={<Navigate to="/nft-charts" replace />} />
                            <Route path="/nft" element={<Navigate to="/nft-floor" replace />} />

                            {/* NFT-nav-list-route */}
                            <Route path="/nft-floor" element={<NFTFloorPrice />} />
                            <Route path="/nft-coins" element={<NFTRelatedCoins />} />
                            <Route path="/nft-watchlist" element={<NFTWatchlist />} />
                            <Route path="/nft-charts" element={<NFTGlobalChart />} />
                            <Route path="/nft-detail/:contractAddress" element={<NFTDetail />} />

                            {/* Tools legacy redirects */}
                            <Route path="/tools/allcoins" element={<Navigate to="/allcoins" replace />} />
                            <Route path="/tools/converter" element={<Navigate to="/converter" replace />} />
                            <Route path="/tools/comparecoins" element={<Navigate to="/compare" replace />} />
                            <Route path="/tools/globalchart" element={<Navigate to="/global-charts" replace />} />
                            <Route path="/tools/prices/:currencyCode" element={<RedirectWithParam to="/prices" paramName="currencyCode" />} />
                            <Route path="/tools" element={<Navigate to="/allcoins" replace />} />

                            {/* Tools-nav-list-route */}
                            <Route path="/allcoins" element={<Allcoins />} />
                            <Route path="/converter" element={<Converter />} />
                            <Route path="/converter/:coinId" element={<Navigate to="/converter" replace />} />
                            <Route path="/converter/:coinId/:currencyCode" element={<CoinConversionDetail />} />
                            <Route path="/compare" element={<CompareCoins />} />
                            <Route path="/global-charts" element={<GlobalChart />} />
                            <Route path="/prices/:currencyCode" element={<CurrencyPrices />} />
                            <Route path="/prices" element={<Navigate to="/converter" replace />} />

                            {/* My Portfolio && Support nav-list-route */}
                            <Route path="/myportfolio" element={<Portfolio />} />
                            <Route path="/support" element={<Support />} />

                            {/* Catch-all route to prevent black screens */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </ProtectedRoute>
                } />

            </Routes>
        </AnimatePresence>
    )
}
export default AppRouter
