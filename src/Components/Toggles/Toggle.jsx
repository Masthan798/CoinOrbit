import React from 'react';
import { motion } from 'framer-motion';

const Toggle = ({ isOn, handleToggle, label }) => {
    return (
        <div className='flex items-center gap-3 cursor-pointer group' onClick={handleToggle}>
            {label && <span className='text-sm font-medium text-muted group-hover:text-white transition-colors'>{label}</span>}
            <div
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${isOn ? 'bg-green-500' : 'bg-gray-600'
                    }`}
            >
                <motion.div
                    className='bg-white w-4 h-4 rounded-full shadow-md'
                    layout
                    transition={{
                        type: "spring",
                        stiffness: 700,
                        damping: 30
                    }}
                    animate={{ x: isOn ? 24 : 0 }}
                />
            </div>
        </div>
    );
};

export default Toggle;
