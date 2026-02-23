import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { Share2, Bell, MoreHorizontal } from 'lucide-react';

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 }
    }
};

const Breadcrumbs = ({ crumbs }) => {
    const navigate = useNavigate();

    if (!crumbs || crumbs.length === 0) return null;

    return (
        <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className='flex items-center justify-between w-full mb-4'
        >
            <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-2xl font-bold min-w-0 max-w-[calc(100%-110px)] overflow-hidden">
                {crumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                        <span
                            className={`transition-colors flex items-center gap-2 truncate ${crumb.path
                                ? 'text-muted cursor-pointer hover:text-white'
                                : 'text-white font-bold cursor-default'
                                }`}
                            onClick={() => crumb.path && navigate(crumb.path)}
                            title={crumb.label}
                        >
                            {crumb.label}
                        </span>
                        {index < crumbs.length - 1 && (
                            <span className='text-muted/50 select-none flex-shrink-0'>/</span>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-white group">
                    <Share2 size={18} className="group-hover:scale-110 transition-transform" />
                </button>
                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-white group">
                    <Bell size={18} className="group-hover:scale-110 transition-transform" />
                </button>
                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-white group">
                    <MoreHorizontal size={18} className="group-hover:scale-110 transition-transform" />
                </button>
            </div>
        </motion.div>
    );
};

export default Breadcrumbs;
