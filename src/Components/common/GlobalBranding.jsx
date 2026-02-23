import React from 'react';
import { Zap } from 'lucide-react';

const GlobalBranding = () => {
    return (
        <div className="fixed bottom-6 right-24 sm:right-28 opacity-20 pointer-events-none flex items-center gap-1.5 z-[9999]">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#10b981] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <Zap size={12} className="text-white fill-white sm:w-3.5 sm:h-3.5" />
            </div>
            <span className="text-xs sm:text-sm font-black tracking-tighter text-white uppercase italic">
                COIN<span className="text-emerald-500">ORBIT</span>
            </span>
        </div>
    );
};

export default GlobalBranding;
