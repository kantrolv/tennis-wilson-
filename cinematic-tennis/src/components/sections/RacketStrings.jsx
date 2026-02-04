import React from 'react';

const RacketStrings = () => {
    return (
        <section className="section align-left" style={{
            backgroundColor: '#0d1017' // Slightly different shade for contrast
        }}>
            <div style={{ maxWidth: '600px', marginLeft: '10vw' }}>
                <h2 className="text-hero" style={{ fontSize: '3rem' }}>
                    The String Bed.
                </h2>
                <h3 className="text-accent">Precision Engineering</h3>

                <p className="text-sub">
                    Every rally begins here. We've optimized the drilling pattern to
                    increase the sweet spot by 15%, giving you more power even on off-center hits.
                </p>

                <div className="glass-panel" style={{ marginTop: '3rem' }}>
                    <div style={{ display: 'flex', gap: '2rem', justifyContent: 'space-between' }}>
                        <div>
                            <span style={{ display: 'block', fontSize: '2rem', fontWeight: 700, color: 'var(--c-accent)' }}>16x19</span>
                            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>String Pattern</span>
                        </div>
                        <div>
                            <span style={{ display: 'block', fontSize: '2rem', fontWeight: 700, color: 'var(--c-accent)' }}>+15%</span>
                            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Sweet Spot</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual element would be on the right: Close up of strings */}
            <div style={{
                position: 'absolute',
                right: '10%',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '400px',
                height: '400px',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 70%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <span style={{ opacity: 0.3, fontStyle: 'italic' }}>Strings Visual</span>
            </div>
        </section>
    );
};

export default RacketStrings;
