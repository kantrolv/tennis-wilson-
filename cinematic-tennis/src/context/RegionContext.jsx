import React, { createContext, useContext, useState } from 'react';

const RegionContext = createContext();

const regions = [
    { code: 'US', name: 'United States', lang: 'English', curr: 'USD', symbol: '$', mult: 1, phoneCode: '+1', phoneLength: 10, postalCodeRegex: /^\d{5}(-\d{4})?$/ },
    { code: 'GB', name: 'United Kingdom', lang: 'English', curr: 'GBP', symbol: '£', mult: 0.79, phoneCode: '+44', phoneLength: 10, postalCodeRegex: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i },
    { code: 'FR', name: 'France', lang: 'Français', curr: 'EUR', symbol: '€', mult: 0.92, phoneCode: '+33', phoneLength: 9, postalCodeRegex: /^\d{5}$/ },
    { code: 'DE', name: 'Germany', lang: 'Deutsch', curr: 'EUR', symbol: '€', mult: 0.92, phoneCode: '+49', phoneLength: 10, postalCodeRegex: /^\d{5}$/ },
    { code: 'JP', name: 'Japan', lang: '日本語', curr: 'JPY', symbol: '¥', mult: 148, phoneCode: '+81', phoneLength: 10, postalCodeRegex: /^\d{3}-?\d{4}$/ },
    { code: 'AU', name: 'Australia', lang: 'English', curr: 'AUD', symbol: 'A$', mult: 1.53, phoneCode: '+61', phoneLength: 9, postalCodeRegex: /^\d{4}$/ },
    { code: 'IN', name: 'India', lang: 'English/Hindi', curr: 'INR', symbol: '₹', mult: 83, phoneCode: '+91', phoneLength: 10, postalCodeRegex: /^\d{6}$/ },
    { code: 'AE', name: 'UAE', lang: 'English/Arabic', curr: 'AED', symbol: 'د.إ', mult: 3.67, phoneCode: '+971', phoneLength: 9, postalCodeRegex: /^.*$/ },
];

export const RegionProvider = ({ children }) => {
    // Default: US, English, USD, potentially loaded from localStorage
    const [region, setRegion] = useState(() => {
        const savedRegion = localStorage.getItem('cinematic-tennis-region');
        return savedRegion ? JSON.parse(savedRegion) : {
            countryCode: 'US',
            countryName: 'United States',
            language: 'English',
            currency: 'USD',
            currencySymbol: '$',
            multiplier: 1,
            phoneCode: '+1'
        };
    });

    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [subsequentAction, setSubsequentAction] = useState(null);

    const changeRegion = (countryCode) => {
        const found = regions.find(r => r.code === countryCode);
        if (found) {
            const newRegion = {
                countryCode: found.code,
                countryName: found.name,
                language: found.lang,
                currency: found.curr,
                currencySymbol: found.symbol,
                multiplier: found.mult,
                phoneCode: found.phoneCode
            };
            setRegion(newRegion);
            localStorage.setItem('cinematic-tennis-region', JSON.stringify(newRegion));

            // Execute subsequent action if one was queued (e.g., navigation)
            if (subsequentAction) {
                subsequentAction();
                setSubsequentAction(null);
            }
        }
    };

    // Auto-sync region when any user logs in
    // Backend now stores the same country codes as frontend (US, GB, FR, DE, JP, AU, IN, AE)
    const syncRegionFromUser = (user) => {
        if (user?.region) {
            const frontendCode = user.region;
            if (frontendCode !== region.countryCode) {
                changeRegion(frontendCode);
            }
        }
    };

    const openSelector = (action = null) => {
        if (action) setSubsequentAction(() => action);
        setIsSelectorOpen(true);
    };

    const closeSelector = () => {
        setIsSelectorOpen(false);
        setSubsequentAction(null);
    };

    // Ensure phoneCode exists (migration for existing localStorage data)
    React.useEffect(() => {
        if (!region.phoneCode) {
            const found = regions.find(r => r.code === region.countryCode);
            if (found) {
                setRegion(prev => ({ ...prev, phoneCode: found.phoneCode }));
            }
        }
    }, [region, regions]);

    return (
        <RegionContext.Provider value={{
            region,
            changeRegion,
            syncRegionFromUser,
            regions,
            isSelectorOpen,
            openSelector,
            closeSelector
        }}>
            {children}
        </RegionContext.Provider>
    );
};

export const useRegion = () => useContext(RegionContext);
