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
            // Check if we are on the home page by looking for the spacer AND checking URL/path
            // But relying on DOM element is usually safer for this setup
            const triggerEl = document.querySelector(".cinematic-spacer");

            // Only run scroll animation if the spacer actually exists and is visible
            if (triggerEl && window.location.pathname === '/') {
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
                            scrub: 1,
                            onRefresh: self => {
                                if (self.progress > 0) {
                                    gsap.set([mainRef.current, footerRef.current], { autoAlpha: 1, y: 0 });
                                }
                            }
                        }
                    }
                );
            } else {
                // Standard Page Animation: Immediate Fade In
                // Kill any existing ScrollTriggers that might be lingering
                ScrollTrigger.getAll().forEach(t => t.kill());

                gsap.set([mainRef.current, footerRef.current], { autoAlpha: 0, y: 20 });
                gsap.to([mainRef.current, footerRef.current], {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out",
                    delay: 0.1,
                    clearProps: "all" // Ensure no lingering styles block visibility
                });
            }
        });

        // Failsafe: Force visibility after 3 seconds if still hidden (e.g. enhanced reliability)
        const timer = setTimeout(() => {
            if (mainRef.current && getComputedStyle(mainRef.current).opacity === '0') {
                console.warn("GSAP didn't fire, forcing visibility");
                gsap.to([mainRef.current, footerRef.current], { autoAlpha: 1, y: 0, duration: 0.5 });
            }
        }, 3000);

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
