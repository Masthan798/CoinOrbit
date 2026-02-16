import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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
            initial="hidden"
            animate="visible"
            className='flex items-center gap-2 text-sm mb-2'
        >
            {crumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                    <span
                        className={`transition-colors flex items-center gap-2 ${crumb.path
                                ? 'text-muted cursor-pointer hover:text-white'
                                : 'text-white font-medium cursor-default'
                            }`}
                        onClick={() => crumb.path && navigate(crumb.path)}
                    >
                        {crumb.label}
                    </span>
                    {index < crumbs.length - 1 && (
                        <span className='text-muted/50 select-none'>/</span>
                    )}
                </React.Fragment>
            ))}
        </motion.div>
    );
};

export default Breadcrumbs;
