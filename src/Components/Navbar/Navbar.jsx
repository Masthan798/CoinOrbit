import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    PanelLeftClose,
    PanelLeftOpen,
    Coins,
    Layers,
    Link,
    Landmark,
    ArrowLeftRight,
    Cpu,
    Percent,
    LineChart,
    Tag,
    Image,
    Eye,
    Globe,
    List,
    Calculator,
    Scale,
    PieChart,
    Briefcase,
    HelpCircle
} from "lucide-react";

const Navbar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        if (!path) return false;
        if (path === "/") {
            return location.pathname === "/" || location.pathname.startsWith("/cryptocurrencies/marketcap");
        }
        return location.pathname === path || (location.pathname.startsWith(path) && path !== "/");
    };

    const handleMouseEnter = (e, label) => {
        if (!isCollapsed) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setHoveredItem({
            label,
            top: rect.top + rect.height / 2,
            left: rect.right + 10
        });
    };

    const handleMouseLeave = () => {
        setHoveredItem(null);
    };

    // Animation Variants
    const sidebarVariants = {
        expanded: { width: 280 },
        collapsed: { width: 80 }
    };

    const contentVariants = {
        expanded: { opacity: 1, x: 0, display: "block" },
        collapsed: { opacity: 0, x: -10, transitionEnd: { display: "none" } }
    };

    const itemVariants = {
        expanded: { opacity: 1, x: 0 },
        collapsed: { opacity: 1, x: 0 } // Icons stay visible
    };

    const categoryVariants = {
        expanded: { opacity: 1 },
        collapsed: { opacity: 0 }
    };

    const navItems = [
        {
            type: "Cryptocurrencies",
            items: [
                { icon: <Coins size={20} />, label: "By Market Cap", path: "/" },
                { icon: <Layers size={20} />, label: "Categories", path: "/cryptocurrencies/categories" },
                { icon: <Link size={20} />, label: "Chains", path: "/cryptocurrencies/chains" },
                { icon: <Landmark size={20} />, label: "Crypto Treasuries", path: "/cryptocurrencies/cryptotreasuries" },
            ]

        },
        {
            type: "Exchanges",
            items: [
                { icon: <ArrowLeftRight size={20} />, label: "Crypto Exchanges", path: "/exchanges/cryptoexchanges" },
                { icon: <Cpu size={20} />, label: "Decentralized Exchanges", path: "/exchanges/decentrilizedexchages" },
                { icon: <Percent size={20} />, label: "Derivatives", path: "/exchanges/derivatives" },
                { icon: <LineChart size={20} />, label: "Perp DEXs", path: "/exchanges/perpdexs" },
            ]

        },
        {
            type: "NFT",
            items: [
                { icon: <Tag size={20} />, label: "NFT Floor Price", path: "/nft/nftfloorprice" },
                { icon: <Image size={20} />, label: "NFT Related Coins", path: "/nft/nftrelatedcoins" },
                { icon: <Eye size={20} />, label: "NFT Watchlist", path: "/nft/nftwatchlist" },
                { icon: <Globe size={20} />, label: "NFT Global Chart", path: "/nft/nftglobalchart" },
            ]

        },
        {
            type: "TOOLS",
            items: [
                { icon: <List size={20} />, label: "All Coins", path: "/tools/allcoins" },
                { icon: <Calculator size={20} />, label: "Converter", path: "/tools/converter" },
                { icon: <Scale size={20} />, label: "Compare Coins and NFT", path: "/tools/comparecoins" },
                { icon: <PieChart size={20} />, label: "Global Chart", path: "/tools/globalchart" },
            ]

        },

    ];

    const bottomNavItems = [
        { icon: <Briefcase size={20} />, label: "My Portfolio", path: "/myportfolio" },
        { icon: <HelpCircle size={20} />, label: "Help & Support", path: "/support" },
    ];

    return (
        <motion.div
            initial={false}
            animate={isCollapsed ? "collapsed" : "expanded"}
            variants={sidebarVariants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col bg-card border-r border-soft h-screen sticky top-0"
        >

            {/* Header Row */}
            <div className="p-4 flex items-center justify-between overflow-hidden">
                <AnimatePresence mode="wait">
                    {!isCollapsed && (
                        <motion.div
                            key="logo"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="flex-shrink-0"
                        >
                            <svg width="180" height="40" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                                <text x="0" y="30" fontSize="28" fontWeight="700" fill="#FFFFFF">CoinOrbit</text>
                                <text x="0" y="50" fontSize="10" fontWeight="400" fill="#A1A1A1" letterSpacing="0.05em">Coin Analysis Platform</text>
                            </svg>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`p-2 rounded-lg hover-soft text-muted hover:text-white transition-colors flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}
                >
                    {isCollapsed ? <PanelLeftOpen size={22} /> : <PanelLeftClose size={22} />}
                </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto no-scrollbar">
                {navItems.map((category, index) => (
                    <div key={index} className="mb-4">
                        <div className={`flex items-center justify-center gap-2 mb-2 ${isCollapsed ? 'px-0' : 'px-2'}`}>
                            <span className="w-full h-[1px] bg-white/10"></span>
                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.p
                                        variants={categoryVariants}
                                        initial="collapsed"
                                        animate="expanded"
                                        exit="collapsed"
                                        className="text-[10px] uppercase tracking-wider text-gray-500 font-medium whitespace-nowrap"
                                    >
                                        {category.type}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                            <span className="w-full h-[1px] bg-white/10"></span>
                        </div>
                        <div className="space-y-1">
                            {category.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="relative group">
                                    <button
                                        onClick={() => item.path && navigate(item.path)}
                                        onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                                        onMouseLeave={handleMouseLeave}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all hover-soft ${isActive(item.path) ? 'text-white bg-white/10' : 'text-muted hover:text-white'} ${isCollapsed ? 'justify-center mx-auto' : ''}`}
                                    >
                                        <motion.span
                                            variants={itemVariants}
                                            className={`flex-shrink-0 flex items-center justify-center w-6 transition-colors duration-200 ${isActive(item.path) ? 'text-white' : 'group-hover:text-white'}`}
                                        >
                                            {item.icon}
                                        </motion.span>
                                        <AnimatePresence>
                                            {!isCollapsed && (
                                                <motion.span
                                                    variants={contentVariants}
                                                    initial="collapsed"
                                                    animate="expanded"
                                                    exit="collapsed"
                                                    className="font-medium whitespace-nowrap text-sm"
                                                >
                                                    {item.label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="px-3 py-4 border-t border-soft space-y-2">
                {bottomNavItems.map((item, index) => (
                    <div key={index} className="relative group">
                        <button
                            onClick={() => item.path && navigate(item.path)}
                            onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                            onMouseLeave={handleMouseLeave}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all hover-soft ${isActive(item.path) ? 'text-white bg-white/10' : 'text-muted hover:text-white'} ${isCollapsed ? 'justify-center mx-auto' : ''}`}
                        >
                            <motion.span
                                variants={itemVariants}
                                className={`flex-shrink-0 flex items-center justify-center w-6 transition-colors duration-200 ${isActive(item.path) ? 'text-white' : 'group-hover:text-white'}`}
                            >
                                {item.icon}
                            </motion.span>
                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.span
                                        variants={contentVariants}
                                        initial="collapsed"
                                        animate="expanded"
                                        exit="collapsed"
                                        className="font-medium whitespace-nowrap text-sm"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                ))}
            </div>

            {/* Floating Tooltip with Portal */}
            {isCollapsed && hoveredItem && createPortal(
                <AnimatePresence>
                    <motion.div
                        key="tooltip"
                        initial={{ opacity: 0, x: -10, y: "-50%" }}
                        animate={{ opacity: 1, x: 0, y: "-50%" }}
                        exit={{ opacity: 0, x: -10, y: "-50%" }}
                        className="fixed px-3 py-2 bg-[#1a1a1a] text-white text-xs font-medium rounded-lg shadow-2xl border border-white/10 z-[99999] pointer-events-none whitespace-nowrap"
                        style={{
                            top: hoveredItem.top,
                            left: hoveredItem.left,
                        }}
                    >
                        {hoveredItem.label}
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1a1a1a] border-l border-b border-white/10 rotate-45" />
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}
        </motion.div >
    );
};

export default Navbar;
