import React, { useLayoutEffect, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Layout = ({ children }) => {
    const mainRef = useRef();
    const footerRef = useRef();

    useLayoutEffect(() => {
        // Ensure elements exist
        if (!mainRef.current || !footerRef.current) return;

        const ctx = gsap.context(() => {
            const triggerEl = document.querySelector(".cinematic-spacer");

            if (triggerEl) {
                // Home Page Animation: Scroll Triggered
                gsap.fromTo([mainRef.current, footerRef.current],
                    { autoAlpha: 0, y: 50 },
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 1.5,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: triggerEl,
                            start: "65% top",
                            end: "80% top",
                            toggleActions: "play none none reverse",
                            scrub: 1
                        }
                    }
                );
            } else {
                // Standard Page Animation: Immediate Fade In
                gsap.to([mainRef.current, footerRef.current], {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out",
                    delay: 0.2 // Small delay for smooth entry
                });
            }
        });

        return () => ctx.revert();
    }, []);

    return (
        <div className="layout-wrapper" style={{
            width: '100%',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 10
        }}>
            <Header />
            {/* Initially hidden via inline style to prevent FOUC */}
            <main ref={mainRef} style={{ flex: 1, opacity: 0, visibility: 'hidden' }}>
                {children}
            </main>
            <div ref={footerRef} style={{ opacity: 0, visibility: 'hidden' }}>
                <Footer />
            </div>
        </div>
    );
};

export default Layout;
