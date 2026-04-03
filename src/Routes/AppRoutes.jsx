import React, { Suspense, lazy } from "react"
import { Routes, Route, useLocation, Navigate, useParams } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import ProtectedRoute from "../Components/common/ProtectedRoute"
import { useAuth } from "../Context/AuthContext"

// Lazy load all page components
const Categories = lazy(() => import("../Pages/Cryptocurrencies/Categories"));
const CryptoTreasuries = lazy(() => import("../Pages/Cryptocurrencies/CryptoTreasuries"));
const MarketCap = lazy(() => import("../Pages/Cryptocurrencies/MarketCap"));
const CoinDetail = lazy(() => import("../Pages/Cryptocurrencies/CoinDetail"));
const HighlightsDetail = lazy(() => import("../Pages/Cryptocurrencies/HighlightsDetail"));
const CryptoExchanges = lazy(() => import("../Pages/Exchages/CryptoExchanges"));
const Derivatives = lazy(() => import("../Pages/Exchages/Derivatives"));
const ExchangeDetail = lazy(() => import("../Pages/Exchages/ExchangeDetail"));
const PerpDEXs = lazy(() => import("../Pages/Exchages/PerpDEXs"));
const NFTFloorPrice = lazy(() => import("../Pages/Nft/NFTFloorPrice"));
const NFTWatchlist = lazy(() => import("../Pages/Nft/NFTWatchlist"));
const Portfolio = lazy(() => import("../Pages/Portfolio/Portfolio"));
const Support = lazy(() => import("../Pages/Support/Support"));
const Allcoins = lazy(() => import("../Pages/Tools/Allcoins"));
const Converter = lazy(() => import("../Pages/Tools/Converter"));
const CoinConversionDetail = lazy(() => import("../Pages/Tools/CoinConversionDetail"));
const CompareCoins = lazy(() => import("../Pages/Tools/CompareCoins"));
const GlobalChart = lazy(() => import("../Pages/Tools/GlobalChart"));
const CurrencyPrices = lazy(() => import("../Pages/Tools/CurrencyPrices"));
const NFTDetail = lazy(() => import("../Pages/Nft/NFTDetail"));
const Login = lazy(() => import("../Pages/Auth/Login"));
const Signup = lazy(() => import("../Pages/Auth/Signup"));
const ForgotPassword = lazy(() => import("../Pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../Pages/Auth/ResetPassword"));

// Simple loading fallback
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
);

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
            <Suspense fallback={<PageLoader />}>
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

                                <Route path="/cryptotreasuries" element={<CryptoTreasuries />} />
                                <Route path="/marketcap/:coinId" element={<CoinDetail />} />
                                <Route path="/marketcap" element={<Navigate to="/" replace />} />
                                <Route path="/highlights/:type" element={<HighlightsDetail />} />
                                <Route path="/highlights" element={<Navigate to="/categories" replace />} />
                                <Route path="/" element={<MarketCap />} />

                                {/* Exchanges legacy redirects */}
                                <Route path="/exchanges/cryptoexchanges/:exchangeId" element={<RedirectWithParam to="/exchange" paramName="exchangeId" />} />
                                <Route path="/exchanges/cryptoexchanges" element={<Navigate to="/exchanges" replace />} />

                                <Route path="/exchanges/derivatives" element={<Navigate to="/derivatives" replace />} />
                                <Route path="/exchanges/perpdexs" element={<Navigate to="/perpdexs" replace />} />
                                <Route path="/exchanges/exchange-detail/:exchangeId" element={<RedirectWithParam to="/exchange" paramName="exchangeId" />} />

                                {/* Exchanges-nav-list-route */}
                                <Route path="/exchange/:exchangeId" element={<ExchangeDetail />} />
                                <Route path="/exchange" element={<Navigate to="/exchanges" replace />} />
                                <Route path="/exchanges" element={<CryptoExchanges />} />

                                <Route path="/derivatives" element={<Derivatives />} />
                                <Route path="/perpdexs" element={<PerpDEXs />} />

                                {/* NFT legacy redirects */}
                                <Route path="/nft/nftfloorprice" element={<Navigate to="/nft-floor" replace />} />
                                <Route path="/nft/nftwatchlist" element={<Navigate to="/nft-watchlist" replace />} />
                                <Route path="/nft" element={<Navigate to="/nft-floor" replace />} />

                                {/* NFT-nav-list-route */}
                                <Route path="/nft-floor" element={<NFTFloorPrice />} />
                                <Route path="/nft-watchlist" element={<NFTWatchlist />} />
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
            </Suspense>
        </AnimatePresence>
    )
}
export default AppRouter
