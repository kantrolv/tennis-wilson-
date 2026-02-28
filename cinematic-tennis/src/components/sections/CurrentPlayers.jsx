import React from 'react';

const CurrentPlayers = () => {
    const pros = [
        { name: 'Stefanos Tsitsipas', racket: 'Blade 98 v9', image: 'https://i.pinimg.com/1200x/a4/36/76/a43676165790c9dc9d3fa19f8f38cdcf.jpg' },
        { name: 'Aryna Sabalenka', racket: 'Blade 98 v9', image: 'https://i.pinimg.com/736x/b6/a4/3d/b6a43d4c7430261d2cdac5a8d510e987.jpg' },
        { name: 'Madison Keys', racket: 'Blade 98 v9', image: 'https://i.pinimg.com/736x/c3/5b/40/c35b40eb2cd0337d20ec1b10efe3a2c2.jpg' },
        { name: 'Karen Khachanov', racket: 'Blade 98 v9', image: 'https://i.pinimg.com/736x/14/08/87/140887f334ade78848895bf5d16dc8f5.jpg' }
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
                    color: '#1a1a1a',
                    display: 'none'
                }}>View Team</button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                width: '100%'
            }}>
                {pros.map((pro) => (
                    <div key={pro.name} style={{
                        transition: 'transform 0.3s ease',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            const img = e.currentTarget.querySelector('.current-player-img');
                            if (img) img.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            const img = e.currentTarget.querySelector('.current-player-img');
                            if (img) img.style.transform = 'scale(1)';
                        }}
                    >
                        <div style={{
                            width: '100%',
                            aspectRatio: '3/4',
                            overflow: 'hidden',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(0,0,0,0.04)'
                        }}>
                            <div className="current-player-img" style={{
                                width: '100%',
                                height: '100%',
                                background: pro.image ? `url(${pro.image}) center/cover no-repeat` : 'none',
                                transition: 'transform 0.5s ease'
                            }}></div>
                        </div>
                        <div style={{
                            borderTop: '1px solid rgba(0,0,0,0.1)',
                            paddingTop: '1rem'
                        }}>
                            <h4 style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '1.2rem',
                                fontWeight: 300,
                                color: '#1a1a1a',
                                margin: '0 0 0.2rem 0'
                            }}>{pro.name}</h4>
                            <span style={{ fontSize: '0.8rem', color: '#888' }}>{pro.racket}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CurrentPlayers;
