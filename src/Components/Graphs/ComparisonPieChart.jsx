import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

const ComparisonsPieChart = ({ data, title }) => {
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
            <ul className="flex flex-col gap-2 text-sm mt-4">
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
            <div className="w-full h-[300px] relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={80}
                            outerRadius={110}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={renderLegend} verticalAlign="middle" align="right" layout="vertical" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default ComparisonsPieChart;
