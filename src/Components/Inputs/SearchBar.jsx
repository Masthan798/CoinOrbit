import React, { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = "Search...", onClose, autoFocus = false, className = "" }) => {
    const inputRef = useRef(null);

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    return (
        <div className={`relative w-full ${className || 'max-w-sm'}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted" />
            </div>
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 bg-[#121212] border border-gray-800 rounded-xl text-sm text-white placeholder-muted focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                placeholder={placeholder}
            />
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-white transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
};

export default SearchBar;
