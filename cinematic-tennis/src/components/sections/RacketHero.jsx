import React from 'react';

const RacketHero = () => {
    return (
        <section className="section align-center" style={{
            backgroundColor: 'var(--c-bg-main)',
            paddingTop: 'calc(var(--spacing-xl) + 4rem)', // Extra padding for transition
            position: 'relative'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', zIndex: 2 }}>
                <h1 className="text-hero" style={{
                    opacity: 0,
                    animation: 'fadeInUp 1s ease-out forwards',
                    animationDelay: '0.2s'
                }}>
                    Designed for <span style={{ color: 'var(--c-accent)' }}>control</span>. <br />
                    Built for <span style={{ color: 'var(--c-accent)' }}>precision</span>.
                </h1>

                <p className="text-sub" style={{
                    margin: '0 auto 3rem',
                    opacity: 0,
                    animation: 'fadeInUp 1s ease-out forwards',
                    animationDelay: '0.4s'
                }}>
                    The Wilson Blade v9. Engineered for the players who demand feedback and control.
                    Experience the feel of the game like never before.
                </p>

                <button className="btn-primary" style={{
                    opacity: 0,
                    animation: 'fadeInUp 1s ease-out forwards',
                    animationDelay: '0.6s'
                }}>
                    Discover the Blade
                </button>
            </div>

            {/* Placeholder for Racket Image/3D if needed here, 
          but we are coming from a 3D intro so maybe just text is cleaner initially 
      */}

            <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </section>
    );
};

export default RacketHero;
