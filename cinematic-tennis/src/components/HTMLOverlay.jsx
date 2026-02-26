import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function HTMLOverlay() {
    const overlayRef = useRef();
    const legendsRef = useRef();

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Legends Reveal at the end (> 90%)
            gsap.fromTo(legendsRef.current,
                { opacity: 0 },
                {
                    opacity: 1,
                    scrollTrigger: {
                        trigger: '.scroll-container',
                        start: '90% top',
                        end: '100% top',
                        scrub: true
                    }
                }
            );
        }, overlayRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={overlayRef} className="html-layer">
            {/* Credits / Legends */}
            <div ref={legendsRef} className="legends-container"
                style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', alignItems: 'center',
                    zIndex: 20, opacity: 0, pointerEvents: 'none',
                    color: '#1a1a1a', // Dark text on off-white BG
                }}
            >
                <div style={{ mixBlendMode: 'multiply' }}>
                    {['ROGER FEDERER', 'RAFAEL NADAL', 'SERENA WILLIAMS', 'NOVAK DJOKOVIC', 'STEFFI GRAF'].map((name, i) => (
                        <div key={i} className="legend-item" style={{
                            fontSize: 'clamp(2rem, 5vw, 4rem)',
                            margin: '1rem 0',
                            fontFamily: '"Playfair Display", serif',
                            fontWeight: 900,
                            letterSpacing: '-0.02em',
                            textAlign: 'center',
                            textTransform: 'uppercase'
                        }}>
                            {name}
                        </div>
                    ))}
                </div>

                <div className="legend-item" style={{ marginTop: '3rem', fontSize: '1rem', opacity: 0.6, fontWeight: 600 }}>
                    THE GAME IS FOREVER.
                </div>
            </div>
        </div>
    );
}
