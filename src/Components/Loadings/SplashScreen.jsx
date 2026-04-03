import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SplashScreen = ({ isExiting = false }) => {
    const title = "CoinOrbit";
    const subtitle = "Coin Analysis Platform";
    const [displayedSubtitle, setDisplayedSubtitle] = useState("");

    useEffect(() => {
        let currentIndex = 0;
        const typingInterval = setInterval(() => {
            if (currentIndex < subtitle.length) {
                setDisplayedSubtitle(subtitle.substring(0, currentIndex + 1));
                currentIndex++;
            } else {
                clearInterval(typingInterval);
            }
        }, 50); // Speed of typing

        return () => clearInterval(typingInterval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#010101] overflow-hidden"
        >
            {/* Background Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />

            <div className="relative flex flex-col items-center gap-6">
                {/* Logo Title Animation */}
                <motion.div
                    initial={{ y: 20, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ 
                        duration: 1, 
                        ease: [0.22, 1, 0.36, 1], // Custom cubic bezier for premium feel
                    }}
                    className="relative"
                >
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/40 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        {title}
                    </h1>
                    
                    {/* Subtle Shine/Refection Overlay */}
                    <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: "200%" }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                    />
                </motion.div>

                {/* Typing Subtext */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="h-6" // Fixed height to prevent layout shift during typing
                >
                    <p className="text-sm md:text-lg font-medium tracking-[0.3em] uppercase text-gray-500 font-mono">
                        {displayedSubtitle}
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="inline-block w-2 ml-1 bg-blue-500 h-4 align-middle"
                        />
                    </p>
                </motion.div>
            </div>

            {/* Bottom Loading Progress Indicator (Subtle) */}
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "20%" }}
                transition={{ duration: 2.5, ease: "linear" }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent max-w-[200px]"
            />
        </motion.div>
    );
};

export default SplashScreen;
