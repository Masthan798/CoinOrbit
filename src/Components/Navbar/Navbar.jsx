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
    HelpCircle,
    LogOut,
    LogIn
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const Navbar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, signOut } = useAuth();

    const isActive = (path) => {
        if (!path) return false;
        if (path === "/") {
            return location.pathname === "/" || location.pathname.startsWith("/marketcap");
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
                { icon: <Layers size={20} />, label: "Categories", path: "/categories" },
                { icon: <Link size={20} />, label: "Chains", path: "/chains" },
                { icon: <Landmark size={20} />, label: "Crypto Treasuries", path: "/cryptotreasuries" },
            ]

        },
        {
            type: "Exchanges",
            items: [
                { icon: <ArrowLeftRight size={20} />, label: "Crypto Exchanges", path: "/exchanges" },
                { icon: <Cpu size={20} />, label: "Decentralized Exchanges", path: "/dex" },
                { icon: <Percent size={20} />, label: "Derivatives", path: "/derivatives" },
                { icon: <LineChart size={20} />, label: "Perp DEXs", path: "/perpdexs" },
            ]

        },
        {
            type: "NFT",
            items: [
                { icon: <Tag size={20} />, label: "NFT Floor Price", path: "/nft-floor" },
                { icon: <Image size={20} />, label: "NFT Related Coins", path: "/nft-coins" },
                { icon: <Eye size={20} />, label: "NFT Watchlist", path: "/nft-watchlist" },
                { icon: <Globe size={20} />, label: "NFT Global Chart", path: "/nft-charts" },
            ]

        },
        {
            type: "TOOLS",
            items: [
                { icon: <List size={20} />, label: "All Coins", path: "/allcoins" },
                { icon: <Calculator size={20} />, label: "Converter", path: "/converter" },
                { icon: <Scale size={20} />, label: "Compare Coins and NFT", path: "/compare" },
                { icon: <PieChart size={20} />, label: "Global Chart", path: "/global-charts" },
            ]

        },

    ];

    const bottomNavItems = [
        { icon: <Briefcase size={20} />, label: "My Portfolio", path: "/myportfolio" },
        { icon: <HelpCircle size={20} />, label: "Help & Support", path: "/support" },
    ];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const mobileMenuVariants = {
        closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
        open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
    };

    return (
        <>
            {/* Mobile Top Navbar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-soft z-[100] flex items-center justify-between px-4">
                <div className="flex items-center gap-2" onClick={() => navigate("/")}>
                    <svg width="180" height="40" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer">
                        <defs>
                            <linearGradient id="logoGradientMobile" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#FFFFFF" />
                                <stop offset="50%" stopColor="#A1A1A1" />
                                <stop offset="100%" stopColor="#737373" />
                            </linearGradient>
                        </defs>
                        <text x="0" y="44" fontSize="42" fontWeight="700" fill="url(#logoGradientMobile)">CoinOrbit</text>
                    </svg>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-muted hover:text-white transition-colors"
                >
                    {isMobileMenuOpen ? <PanelLeftClose size={24} /> : <PanelLeftOpen size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
                        />
                        <motion.div
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={mobileMenuVariants}
                            className="lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-card border-r border-soft z-[120] flex flex-col pt-4 shadow-2xl"
                        >
                            <div className="px-6 mb-6 flex items-center justify-between">
                                <span className="text-2xl font-bold uppercase tracking-tight text-gradient-smoke">Menu</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="text-muted"><PanelLeftClose size={24} /></button>
                            </div>

                            <nav className="flex-1 px-4 overflow-y-auto no-scrollbar">
                                {navItems.map((category, index) => (
                                    <div key={index} className="mb-6">
                                        <p className="px-4 text-sm uppercase tracking-widest text-gray-500 font-bold mb-3">{category.type}</p>
                                        <div className="space-y-1">
                                            {category.items.map((item, itemIdx) => (
                                                <button
                                                    key={itemIdx}
                                                    onClick={() => {
                                                        item.path && navigate(item.path);
                                                        setIsMobileMenuOpen(false);
                                                    }}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${isActive(item.path) ? 'bg-white/10 text-white' : 'text-muted'}`}
                                                >
                                                    {item.icon}
                                                    <span className="font-bold text-base">{item.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </nav>

                            <div className="px-4 py-4 border-t border-soft space-y-1 bg-card/50 backdrop-blur-md">
                                {bottomNavItems.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            item.path && navigate(item.path);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all hover-soft ${isActive(item.path) ? 'bg-white/10 text-white' : 'text-muted hover:text-white'}`}
                                    >
                                        {item.icon}
                                        <span className="font-bold text-base">{item.label}</span>
                                    </button>
                                ))}
                                <button
                                    onClick={async () => {
                                        if (user) {
                                            await signOut();
                                            navigate("/login", { replace: true });
                                            toast.success('Successfully logged out!');
                                        } else {
                                            navigate("/login");
                                        }
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl text-muted hover:text-white transition-all hover-soft"
                                >
                                    {user ? <LogOut size={20} /> : <LogIn size={20} />}
                                    <span className="font-bold text-base">{user ? "Sign Out" : "Sign In"}</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <motion.div
                initial={false}
                animate={isCollapsed ? "collapsed" : "expanded"}
                variants={sidebarVariants}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="hidden lg:flex flex-col bg-card border-r border-soft h-screen sticky top-0"
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
                                className="flex-shrink-0 cursor-pointer"
                                onClick={() => navigate("/")}
                            >
                                <svg width="220" height="60" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <linearGradient id="logoGradientDesktop" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#FFFFFF" />
                                            <stop offset="50%" stopColor="#A1A1A1" />
                                            <stop offset="100%" stopColor="#737373" />
                                        </linearGradient>
                                    </defs>
                                    <text x="0" y="32" fontSize="38" fontWeight="700" fill="url(#logoGradientDesktop)">CoinOrbit</text>
                                    <text x="0" y="52" fontSize="12" fontWeight="400" fill="#A1A1A1" letterSpacing="0.05em">Coin Analysis Platform</text>
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
                                            className="text-sm uppercase tracking-wider text-gray-500 font-bold whitespace-nowrap"
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
                                                        className="font-bold whitespace-nowrap text-lg"
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
                                            className="font-bold whitespace-nowrap text-lg"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>
                    ))}
                    <div className="relative group">
                        <button
                            onClick={async () => {
                                if (user) {
                                    await signOut();
                                    navigate("/login", { replace: true });
                                    toast.success('Successfully logged out!');
                                } else {
                                    navigate("/login");
                                }
                            }}
                            onMouseEnter={(e) => handleMouseEnter(e, user ? "Sign Out" : "Sign In")}
                            onMouseLeave={handleMouseLeave}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all hover-soft text-muted hover:text-white ${isCollapsed ? 'justify-center mx-auto' : ''}`}
                        >
                            <motion.span
                                variants={itemVariants}
                                className="flex-shrink-0 flex items-center justify-center w-6"
                            >
                                {user ? <LogOut size={20} /> : <LogIn size={20} />}
                            </motion.span>
                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.span
                                        variants={contentVariants}
                                        initial="collapsed"
                                        animate="expanded"
                                        exit="collapsed"
                                        className="font-bold whitespace-nowrap text-lg"
                                    >
                                        {user ? "Sign Out" : "Sign In"}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </div>

                {/* Floating Tooltip with Portal */}
                {
                    isCollapsed && hoveredItem && createPortal(
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
                    )
                }
            </motion.div >
        </>
    );
};

export default Navbar;
