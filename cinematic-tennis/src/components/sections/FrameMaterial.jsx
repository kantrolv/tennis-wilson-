import React from 'react';

const FrameMaterial = () => {
    return (
        <section className="section align-left" id="racket-handle-section" style={{
            backgroundColor: 'transparent',
            minHeight: '100vh',
            display: 'flex',
            padding: '4rem 13vw',
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
                    The Handle
                </span>

                <h2 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    lineHeight: 1.1,
                    color: '#1a1a1a',
                    marginBottom: '1.5rem',
                    fontWeight: 400
                }}>
                    Where Feel<br />
                    Begins.
                </h2>

                <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '1.05rem',
                    lineHeight: 1.7,
                    color: '#555',
                    marginBottom: '2rem',
                    maxWidth: '450px'
                }}>
                    The handle is your only connection to the racket. Wilson's proprietary
                    CounterVail™ technology in the handle dampens up to 40% of shock vibration
                    without sacrificing power or feel. The ergonomic grip shape reduces fatigue
                    during long matches.
                </p>

                {/* Handle Specs */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <div className="spec-card">
                        <span className="spec-value">-40%</span>
                        <span className="spec-label">Vibration</span>
                    </div>
                    <div className="spec-card">
                        <span className="spec-value">4¼"</span>
                        <span className="spec-label">Grip Size</span>
                    </div>
                </div>

                {/* Material callout */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start',
                    padding: '1.25rem',
                    background: 'rgba(0, 0, 0, 0.03)',
                    borderRadius: '6px'
                }}>
                    <div style={{
                        width: '3px',
                        height: '100%',
                        minHeight: '60px',
                        backgroundColor: 'var(--c-wilson-red)',
                        borderRadius: '2px',
                        flexShrink: 0
                    }}></div>
                    <div>
                        <h4 style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.85rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: '#1a1a1a',
                            marginBottom: '0.5rem',
                            fontWeight: 600
                        }}>CounterVail™ Technology</h4>
                        <p style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.9rem',
                            color: '#666',
                            lineHeight: 1.6,
                            margin: 0
                        }}>
                            Embedded carbon fibers absorb impact energy, channeling it
                            back into your swing instead of your arm. Play longer. Hit harder.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FrameMaterial;
