import React from 'react';

const LegacyPlayers = () => {
    const legends = [
        { name: 'Roger Federer', title: 'The Maestro' },
        { name: 'Serena Williams', title: 'The Queen' },
        { name: 'Pete Sampras', title: 'Pistol Pete' },
        { name: 'Steffi Graf', title: 'Fräulein Forehand' }
    ];

    return (
        <section className="section align-center" style={{ backgroundColor: 'var(--c-bg-main)' }}>
            <h2 className="text-hero">Trusted by Champions.</h2>
            <p className="text-sub" style={{ marginBottom: '4rem' }}>
                Proven through decades. The choice of those who define the sport.
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '2rem',
                width: '100%',
                maxWidth: '1200px'
            }}>
                {legends.map((legend) => (
                    <div key={legend.name} className="glass-panel" style={{
                        height: '350px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        background: 'rgba(255,255,255,0.02)', // Placeholder for image
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'transform 0.3s ease'
                    }}>
                        {/* Placeholder for Image */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 80%)`,
                            zIndex: 1
                        }}></div>

                        <div style={{ position: 'relative', zIndex: 2 }}>
                            <h3 style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '1.5rem',
                                marginBottom: '0.2rem'
                            }}>{legend.name}</h3>
                            <span style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                color: 'var(--c-accent)',
                                letterSpacing: '0.1em'
                            }}>{legend.title}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default LegacyPlayers;
