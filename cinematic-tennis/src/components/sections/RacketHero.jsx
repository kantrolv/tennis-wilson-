import React from 'react';

const RacketHero = () => {
    return (
        <section className="section align-left" id="racket-head-section" style={{
            backgroundColor: 'transparent',
            minHeight: '100vh',
            display: 'flex',
            padding: '4rem 13vw',
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
                    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <div className="spec-card">
                        <span className="spec-value">100</span>
                        <span className="spec-label">Sq. Inches</span>
                    </div>
                    <div className="spec-card">
                        <span className="spec-value">+20%</span>
                        <span className="spec-label">Hitting Area</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RacketHero;
