import React from 'react';

export const formatCurrency = (val) => {
  if (val === null || val === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val);
};

export const formatCompact = (val) => {
  if (val === null || val === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(val);
};

export const renderPriceChange = (val) => {
  if (val === null || val === undefined) return <span className="text-muted">-</span>;
  const isPositive = val >= 0;
  return (
    <span className={`flex items-center gap-0.5 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
      {isPositive ? '▲' : '▼'} {Math.abs(val).toFixed(1)}%
    </span>
  );
};
