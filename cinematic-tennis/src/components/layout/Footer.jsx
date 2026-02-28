import React from 'react';
import { useLocation } from 'react-router-dom';

const Footer = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';

    // On home page, footer sits on off-white background
    // On other pages, footer sits on dark background
    const footerStyle = isHome ? {
        padding: '4rem 6vw',
        borderTop: '1px solid rgba(0,0,0,0.1)',
        marginTop: 'auto',
        backgroundColor: 'transparent',
        color: '#1a1a1a'
    } : {
        padding: '4rem 6vw',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        marginTop: 'auto',
        backgroundColor: 'var(--c-royal-blue)',
        color: 'var(--c-ivory)'
    };

    const mutedColor = isHome ? '#777' : 'var(--c-text-muted)';
    const accentColor = isHome ? '#1a1a1a' : 'var(--c-accent)';
    const dividerColor = isHome ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)';

    return (
        <footer style={footerStyle}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '2rem'
            }}>
                <div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1rem' }}>WILSON</h3>
                    <p style={{ color: mutedColor, maxWidth: '300px' }}>
                        Elevating the game since 1914.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '4rem' }}>
                    <div>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: accentColor }}>Shop</h4>
                        <ul style={{ listStyle: 'none', color: mutedColor, lineHeight: '2' }}>
                            <li>Rackets</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: accentColor }}>Support</h4>
                        <ul style={{ listStyle: 'none', color: mutedColor, lineHeight: '2' }}>
                            <li>Contact Us: wilson@gmail.com</li>

                        </ul>
                    </div>
                </div>
            </div>

            <div style={{
                marginTop: '4rem',
                paddingTop: '2rem',
                borderTop: `1px solid ${dividerColor}`,
                display: 'flex',
                justifyContent: 'space-between',
                color: mutedColor,
                fontSize: '0.8rem'
            }}>
                <p>&copy; 2026 Wilson Sporting Goods. All rights reserved.</p>
                <p>Privacy Policy &nbsp; Terms of Service</p>
            </div>
        </footer>
    );
};

export default Footer;
