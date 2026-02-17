import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const ComparisonsPieChart = ({ data, title }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const COLORS = ['#3b82f6', '#facc15', '#10b981', '#ef4444']; // Blue, Yellow, Green, Red

    // Calculate total for percentage in Legend
    const total = data.reduce((sum, item) => sum + item.value, 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const percent = total > 0 ? (payload[0].value / total) * 100 : 0;
            return (
                <div className="bg-[#1e222d] border border-gray-700 p-3 rounded-lg shadow-xl">
                    <p className="text-white font-bold">{payload[0].name}</p>
                    <p className="text-gray-300">
                        {title}: <span className="text-white font-mono">{payload[0].value.toLocaleString()}</span>
                    </p>
                    <p className="text-sm" style={{ color: payload[0].fill }}>
                        {percent.toFixed(2)}%
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderLegend = (props) => {
        const { payload } = props;
        return (
            <ul className={`flex ${isMobile ? 'flex-row justify-center flex-wrap' : 'flex-col'} gap-2 text-sm mt-4`}>
                {payload.map((entry, index) => {
                    // entry.payload is the data object { name, value, color }
                    // We calculate percent manually
                    const percent = total > 0 ? (entry.payload.value / total) * 100 : 0;
                    return (
                        <li key={`item-${index}`} className="flex items-center justify-between text-gray-400 gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span>{entry.value}</span>
                            </div>
                            <span className="font-mono text-white">{percent.toFixed(2)}%</span>
                        </li>
                    )
                })}
            </ul>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full bg-[#0b0e11] border border-gray-800 rounded-3xl p-6 flex flex-col items-center justify-center"
        >
            <h3 className="text-lg font-bold text-white mb-4 self-start">{title}</h3>
            <div className={`w-full ${isMobile ? 'h-[350px]' : 'h-[300px]'} relative flex items-center justify-center`}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={isMobile ? 60 : 80}
                            outerRadius={isMobile ? 85 : 110}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                            cx={isMobile ? "50%" : "40%"}
                            cy="50%"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            content={renderLegend}
                            verticalAlign={isMobile ? "bottom" : "middle"}
                            align={isMobile ? "center" : "right"}
                            layout={isMobile ? "horizontal" : "vertical"}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default ComparisonsPieChart;
