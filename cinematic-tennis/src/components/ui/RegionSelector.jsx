import React from 'react';
import { useRegion } from '../../context/RegionContext';

const RegionSelector = () => {
    const { region, changeRegion, regions, isSelectorOpen, openSelector, closeSelector } = useRegion();

    return (
        <>
            {/* Trigger Icon */}
            <button
                onClick={() => openSelector()}
                title="Change Region/Language"
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--c-ivory)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    opacity: 0.8,
                    transition: 'opacity 0.2s'
                }}
            >
                <span className="globe-icon" style={{ fontSize: '1.2rem' }}>🌐</span>
                <span style={{ display: 'none', md: { display: 'block' } }}>{region.countryCode} / {region.language}</span>
            </button>

            {/* Modal */}
            {isSelectorOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'fadeIn 0.3s ease-out'
                }}
                    onClick={() => closeSelector()} // Close on background click
                >
                    <div
                        className="glass-panel"
                        style={{
                            width: '90%',
                            maxWidth: '600px',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            backgroundColor: 'rgba(5, 16, 37, 0.95)',
                            border: '1px solid var(--c-gold)',
                            padding: '3rem',
                            position: 'relative'
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent close on modal click
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => closeSelector()}
                            style={{
                                position: 'absolute',
                                top: '1.5rem',
                                right: '1.5rem',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--c-ivory)',
                                fontSize: '1.5rem',
                                cursor: 'pointer'
                            }}
                        >
                            &times;
                        </button>

                        <h2 className="text-hero" style={{ fontSize: '2rem', textAlign: 'center' }}>Change Region</h2>
                        <p className="text-sub" style={{ textAlign: 'center', margin: '0 auto 3rem' }}>
                            Select your location to update currency and shipping options.
                        </p>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                            gap: '1rem'
                        }}>
                            {regions.map((r) => (
                                <button
                                    key={r.code}
                                    onClick={() => {
                                        changeRegion(r.code);
                                        closeSelector();
                                    }}
                                    style={{
                                        background: region.countryCode === r.code ? 'var(--c-gold-dim)' : 'rgba(255,255,255,0.05)',
                                        border: region.countryCode === r.code ? '1px solid var(--c-gold)' : '1px solid rgba(255,255,255,0.1)',
                                        color: 'var(--c-ivory)',
                                        padding: '1.5rem',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        borderRadius: '4px',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem',
                                        alignItems: 'center'
                                    }}
                                >
                                    <span style={{ fontSize: '2rem', lineHeight: 1 }}>
                                        {getFlagEmoji(r.code)}
                                    </span>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.name}</span>
                                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{r.lang}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </>
    );
};

// Simple Flag Helper
function getFlagEmoji(countryCode) {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

export default RegionSelector;
