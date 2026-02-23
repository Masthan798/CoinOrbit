import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const currencies = [
    { code: 'usd', symbol: '$', name: 'US Dollar', locale: 'en-US' },
    { code: 'inr', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
    { code: 'eur', symbol: '€', name: 'Euro', locale: 'de-DE' },
    { code: 'gbp', symbol: '£', name: 'British Pound', locale: 'en-GB' },
    { code: 'jpy', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
    { code: 'aud', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
    { code: 'cad', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
];

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrencyState] = useState(() => {
        const saved = localStorage.getItem('appCurrency');
        return saved ? JSON.parse(saved) : currencies[0]; // Default to USD
    });

    const setCurrency = (currencyCode) => {
        const selected = currencies.find(c => c.code === currencyCode) || currencies[0];
        setCurrencyState(selected);
        localStorage.setItem('appCurrency', JSON.stringify(selected));
    };

    const formatPrice = (value, options = {}) => {
        if (value === undefined || value === null) return '...';

        const defaultOptions = {
            style: 'currency',
            currency: currency.code.toUpperCase(),
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
            ...options
        };

        return new Intl.NumberFormat(currency.locale, defaultOptions).format(value);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, currencies }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
