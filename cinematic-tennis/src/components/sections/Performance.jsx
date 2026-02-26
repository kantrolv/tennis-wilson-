import React from 'react';

const Performance = () => {
    const metrics = [
        { label: 'Control', value: 95 },
        { label: 'Power', value: 75 },
        { label: 'Comfort', value: 85 },
        { label: 'Spin', value: 90 },
    ];

    return (
        <section className="section align-center" style={{ backgroundColor: 'transparent' }}>
            <h2 className="text-hero" style={{ color: '#1a1a1a' }}>Let the racket disappear.</h2>
            <p className="text-sub" style={{ marginBottom: '4rem', color: '#555' }}>
                Only the shot remains. Calibrated for the modern game.
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '4rem',
                width: '100%',
                maxWidth: '1000px'
            }}>
                {metrics.map((m) => (
                    <div key={m.label} style={{ textAlign: 'center' }}>
                        <div style={{
                            height: '200px',
                            width: '10px',
                            background: 'rgba(0,0,0,0.08)',
                            margin: '0 auto 1rem',
                            position: 'relative',
                            borderRadius: '5px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                height: `${m.value}%`,
                                backgroundColor: '#1a1a1a',
                                transition: 'height 1s ease-out'
                            }}></div>
                        </div>
                        <h4 style={{
                            fontFamily: 'var(--font-sans)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            fontSize: '0.9rem',
                            color: '#1a1a1a'
                        }}>{m.label}</h4>
                        <span style={{ opacity: 0.5, fontSize: '0.8rem', color: '#555' }}>{m.value}/100</span>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Performance;
