import React from 'react';
import { motion } from 'framer-motion';

const AuthBackground = () => {
    // Generate an array for the grid boxes
    const boxes = Array.from({ length: 40 });

    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-main pointer-events-none">
            {/* Ambient Gradients */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            ></div>

            {/* Animated Boxes */}
            <div className="absolute inset-0 flex flex-wrap justify-between p-4 gap-8">
                {boxes.map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: [0, 0.15, 0],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: Math.random() * 4 + 4,
                            repeat: Infinity,
                            delay: Math.random() * 10,
                            ease: "easeInOut"
                        }}
                        className="w-16 h-16 border border-white/10 rounded-xl"
                        style={{
                            marginLeft: `${Math.random() * 20}%`,
                            marginTop: `${Math.random() * 20}%`
                        }}
                    />
                ))}
            </div>

            {/* Subtle Noise/Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            ></div>
        </div>
    );
};

export default AuthBackground;
