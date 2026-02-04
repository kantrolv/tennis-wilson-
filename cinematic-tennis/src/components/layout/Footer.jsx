import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            padding: '4rem 6vw',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            marginTop: 'auto',
            backgroundColor: 'var(--c-royal-blue)'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '2rem'
            }}>
                <div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1rem' }}>WILSON</h3>
                    <p style={{ color: 'var(--c-text-muted)', maxWidth: '300px' }}>
                        Elevating the game since 1914.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '4rem' }}>
                    <div>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--c-accent)' }}>Shop</h4>
                        <ul style={{ listStyle: 'none', color: 'var(--c-text-muted)', lineHeight: '2' }}>
                            <li>Rackets</li>
                            <li>Strings</li>
                            <li>Bags</li>
                            <li>Apparel</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--c-accent)' }}>Support</h4>
                        <ul style={{ listStyle: 'none', color: 'var(--c-text-muted)', lineHeight: '2' }}>
                            <li>Contact Us</li>
                            <li>Shipping</li>
                            <li>Returns</li>
                            <li>Warranty</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div style={{
                marginTop: '4rem',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                color: 'var(--c-text-muted)',
                fontSize: '0.8rem'
            }}>
                <p>&copy; 2026 Wilson Sporting Goods. All rights reserved.</p>
                <p>Privacy Policy &nbsp; Terms of Service</p>
            </div>
        </footer>
    );
};

export default Footer;
