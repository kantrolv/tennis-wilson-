import React, { createContext, useContext, useState } from 'react';

const RegionContext = createContext();

export const RegionProvider = ({ children }) => {
    // Default: US, English, USD
    const [region, setRegion] = useState({
        countryCode: 'US',
        countryName: 'United States',
        language: 'English',
        currency: 'USD',
        currencySymbol: '$',
        multiplier: 1
    });

    const regions = [
        { code: 'US', name: 'United States', lang: 'English', curr: 'USD', symbol: '$', mult: 1 },
        { code: 'GB', name: 'United Kingdom', lang: 'English', curr: 'GBP', symbol: '£', mult: 0.79 },
        { code: 'FR', name: 'France', lang: 'Français', curr: 'EUR', symbol: '€', mult: 0.92 },
        { code: 'DE', name: 'Germany', lang: 'Deutsch', curr: 'EUR', symbol: '€', mult: 0.92 },
        { code: 'JP', name: 'Japan', lang: '日本語', curr: 'JPY', symbol: '¥', mult: 148 },
        { code: 'AU', name: 'Australia', lang: 'English', curr: 'AUD', symbol: 'A$', mult: 1.53 },
        { code: 'IN', name: 'India', lang: 'English/Hindi', curr: 'INR', symbol: '₹', mult: 83 },
    ];

    const changeRegion = (countryCode) => {
        const found = regions.find(r => r.code === countryCode);
        if (found) {
            setRegion({
                countryCode: found.code,
                countryName: found.name,
                language: found.lang,
                currency: found.curr,
                currencySymbol: found.symbol,
                multiplier: found.mult
            });
        }
    };

    return (
        <RegionContext.Provider value={{ region, changeRegion, regions }}>
            {children}
        </RegionContext.Provider>
    );
};

export const useRegion = () => useContext(RegionContext);
