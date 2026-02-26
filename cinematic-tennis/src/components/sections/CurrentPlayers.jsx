import React from 'react';

const CurrentPlayers = () => {
    const pros = [
        'Stefanos Tsitsipas',
        'Aryna Sabalenka',
        'Madison Keys',
        'Karen Khachanov'
    ];

    return (
        <section className="section align-left" style={{
            backgroundColor: 'transparent',
            minHeight: '80vh',
            padding: '4rem 6vw'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', width: '100%' }}>
                <div>
                    <h2 className="text-hero" style={{ fontSize: '3rem', margin: 0, color: '#1a1a1a' }}>The Modern Game.</h2>
                    <p className="text-sub" style={{ margin: '1rem 0 0 0', color: '#555' }}>The game evolves. Precision remains.</p>
                </div>
                <button className="btn-primary" style={{
                    marginTop: 0,
                    background: 'transparent',
                    border: '1px solid #1a1a1a',
                    color: '#1a1a1a'
                }}>View Team</button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                width: '100%'
            }}>
                {pros.map((name) => (
                    <div key={name} style={{
                        borderTop: '1px solid rgba(0,0,0,0.1)',
                        paddingTop: '1rem',
                        opacity: 0.8,
                        transition: 'opacity 0.3s ease',
                        cursor: 'pointer'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.8}
                    >
                        <h4 style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '1.2rem',
                            fontWeight: 300,
                            color: '#1a1a1a'
                        }}>{name}</h4>
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>Blade 98 v9</span>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CurrentPlayers;
