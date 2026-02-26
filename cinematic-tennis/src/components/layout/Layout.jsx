import React, { useLayoutEffect, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';
import CartSidebar from '../cart/CartSidebar';
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
            const isHome = triggerEl && window.location.pathname === '/';

            if (isHome) {
                // HOME PAGE: Content visibility is controlled by Experience.jsx
                // via the damped scroll progress (not raw scroll position).
                // We just set initial hidden state here.
                // Experience.jsx will toggle the 'content-revealed' class on .layout-wrapper
                // when the damped animation reaches the ball-hit completion point.
                gsap.set([mainRef.current, footerRef.current], { autoAlpha: 0, y: 50 });

                // No ScrollTrigger here — Experience.jsx handles the timing
            } else {
                // Standard Page Animation: Immediate Fade In
                ScrollTrigger.getAll().forEach(t => t.kill());

                gsap.set([mainRef.current, footerRef.current], { autoAlpha: 0, y: 20 });
                gsap.to([mainRef.current, footerRef.current], {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out",
                    delay: 0.1,
                    clearProps: "all"
                });
            }
        });

        // Failsafe: Force visibility after 5 seconds if still hidden
        const timer = setTimeout(() => {
            if (mainRef.current && getComputedStyle(mainRef.current).opacity === '0') {
                console.warn("GSAP didn't fire, forcing visibility");
                gsap.to([mainRef.current, footerRef.current], { autoAlpha: 1, y: 0, duration: 0.5 });
            }
        }, 5000);

        return () => {
            ctx.revert();
            clearTimeout(timer);
        };
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
            <CartSidebar />
        </div>
    );
};

export default Layout;
