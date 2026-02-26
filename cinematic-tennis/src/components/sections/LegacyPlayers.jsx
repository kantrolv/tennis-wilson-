import React from 'react';

const LegacyPlayers = () => {
    const legends = [
        { name: 'Roger Federer', title: 'The Maestro' },
        { name: 'Serena Williams', title: 'The Queen' },
        { name: 'Pete Sampras', title: 'Pistol Pete' },
        { name: 'Steffi Graf', title: 'Fräulein Forehand' }
    ];

    return (
        <section className="section align-center" style={{ backgroundColor: 'transparent' }}>
            <h2 className="text-hero" style={{ color: '#1a1a1a' }}>Trusted by Champions.</h2>
            <p className="text-sub" style={{ marginBottom: '4rem', color: '#555' }}>
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
                    <div key={legend.name} style={{
                        height: '350px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        background: 'rgba(0, 0, 0, 0.04)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        padding: '2rem',
                        borderRadius: '4px',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        cursor: 'pointer'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {/* Subtle gradient overlay */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: `linear-gradient(to top, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0) 80%)`,
                            zIndex: 1
                        }}></div>

                        <div style={{ position: 'relative', zIndex: 2 }}>
                            <h3 style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '1.5rem',
                                marginBottom: '0.2rem',
                                color: '#1a1a1a'
                            }}>{legend.name}</h3>
                            <span style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                color: 'var(--c-wilson-red)',
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
