import React from 'react';
import { motion } from 'framer-motion';

const Toggle = ({ isOn, handleToggle, label }) => {
    return (
        <div className='flex items-center gap-3 cursor-pointer group' onClick={handleToggle}>
            {label && <span className='text-[10px] sm:text-sm font-bold uppercase tracking-wider text-muted group-hover:text-white transition-colors whitespace-nowrap'>{label}</span>}
            <div
                className={`w-10 h-5 sm:w-12 sm:h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${isOn ? 'bg-white' : 'bg-gray-800'
                    }`}
            >
                <motion.div
                    className={`${isOn ? 'bg-black' : 'bg-white'} w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-md`}
                    layout
                    transition={{
                        type: "spring",
                        stiffness: 700,
                        damping: 30
                    }}
                    animate={{ x: isOn ? (window.innerWidth < 640 ? 20 : 24) : 0 }}
                />
            </div>
        </div>
    );
};

export default Toggle;
