import React from 'react';

const RacketHero = () => {
    return (
        <section className="section align-left" id="racket-head-section" style={{
            backgroundColor: 'transparent',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            padding: '4rem 6vw',
            position: 'relative'
        }}>
            {/* Content on the LEFT side — Racket 3D is on the RIGHT (managed by Experience.jsx) */}
            <div style={{ maxWidth: '550px', zIndex: 2 }}>
                <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.25em',
                    color: 'var(--c-wilson-red)',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '1.5rem'
                }}>
                    The Head
                </span>

                <h2 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    lineHeight: 1.1,
                    color: '#1a1a1a',
                    marginBottom: '1.5rem',
                    fontWeight: 400
                }}>
                    100 sq in. of<br />
                    Pure Control.
                </h2>

                <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '1.05rem',
                    lineHeight: 1.7,
                    color: '#555',
                    marginBottom: '2rem',
                    maxWidth: '450px'
                }}>
                    The oversized head provides a generous sweet spot while maintaining
                    the precision that advanced players demand. The isometric head shape
                    expands the hitting area by 20% compared to traditional frames.
                </p>

                {/* Specs Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        borderTop: '2px solid #1a1a1a',
                        paddingTop: '0.75rem'
                    }}>
                        <span style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '2rem',
                            color: '#1a1a1a',
                            fontWeight: 700,
                            display: 'block'
                        }}>100</span>
                        <span style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            color: '#888',
                            letterSpacing: '0.1em'
                        }}>Sq. Inches</span>
                    </div>
                    <div style={{
                        borderTop: '2px solid #1a1a1a',
                        paddingTop: '0.75rem'
                    }}>
                        <span style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '2rem',
                            color: '#1a1a1a',
                            fontWeight: 700,
                            display: 'block'
                        }}>+20%</span>
                        <span style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            color: '#888',
                            letterSpacing: '0.1em'
                        }}>Hitting Area</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RacketHero;
