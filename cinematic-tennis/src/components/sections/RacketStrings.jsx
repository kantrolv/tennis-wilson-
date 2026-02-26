import React from 'react';

const RacketStrings = () => {
    return (
        <section className="section align-left" id="racket-strings-section" style={{
            backgroundColor: 'transparent',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            padding: '4rem 6vw',
            position: 'relative'
        }}>
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
                    The String Bed
                </span>

                <h2 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    lineHeight: 1.1,
                    color: '#1a1a1a',
                    marginBottom: '1.5rem',
                    fontWeight: 400
                }}>
                    Precision<br />
                    Engineered.
                </h2>

                <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '1.05rem',
                    lineHeight: 1.7,
                    color: '#555',
                    marginBottom: '2rem',
                    maxWidth: '450px'
                }}>
                    Every rally begins at the string bed. Our optimized 16×19 drilling pattern
                    increases the sweet spot by 15%, giving you more power even on off-center hits.
                    The parallel holes reduce string friction for enhanced spin potential.
                </p>

                {/* String Specs */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        borderTop: '2px solid #1a1a1a',
                        paddingTop: '0.75rem'
                    }}>
                        <span style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '1.8rem',
                            color: '#1a1a1a',
                            fontWeight: 700,
                            display: 'block'
                        }}>16×19</span>
                        <span style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            color: '#888',
                            letterSpacing: '0.1em'
                        }}>String Pattern</span>
                    </div>
                    <div style={{
                        borderTop: '2px solid #1a1a1a',
                        paddingTop: '0.75rem'
                    }}>
                        <span style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '1.8rem',
                            color: '#1a1a1a',
                            fontWeight: 700,
                            display: 'block'
                        }}>+15%</span>
                        <span style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            color: '#888',
                            letterSpacing: '0.1em'
                        }}>Sweet Spot</span>
                    </div>
                    <div style={{
                        borderTop: '2px solid #1a1a1a',
                        paddingTop: '0.75rem'
                    }}>
                        <span style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '1.8rem',
                            color: '#1a1a1a',
                            fontWeight: 700,
                            display: 'block'
                        }}>50-60</span>
                        <span style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            color: '#888',
                            letterSpacing: '0.1em'
                        }}>Tension (lbs)</span>
                    </div>
                </div>

                {/* Quote */}
                <div style={{
                    background: 'rgba(0, 0, 0, 0.03)',
                    borderLeft: '3px solid #1a1a1a',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '0 4px 4px 0'
                }}>
                    <p style={{
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontSize: '1rem',
                        color: '#333',
                        lineHeight: 1.6,
                        margin: 0
                    }}>
                        "The string bed is where feel meets power. We engineered every
                        grommet for optimal string movement."
                    </p>
                </div>
            </div>
        </section>
    );
};

export default RacketStrings;
