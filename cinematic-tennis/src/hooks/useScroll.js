import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Mutable state 
export const scrollState = {
    progress: 0,      // 0-1 progress through the cinematic spacer
    contentProgress: 0, // 0-1 progress through the content sections (after spacer)
    velocity: 0,
    hit: false
};

export function useScroll() {
    useLayoutEffect(() => {
        window.scrollTo(0, 0);

        // Track cinematic spacer progress (0-1 over 600vh)
        const trigger = ScrollTrigger.create({
            trigger: document.querySelector('.cinematic-spacer') || document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0,
            onUpdate: (self) => {
                scrollState.progress = self.progress;
                scrollState.velocity = self.getVelocity();

                // Auto-trigger hit if scroll passes threshold
                if (self.progress > 0.6 && !scrollState.hit) {
                    scrollState.hit = true;
                }
            }
        });

        // Track content sections progress (0-1 over the content area)
        const contentEl = document.querySelector('.home-content-sections');
        let contentTrigger;
        if (contentEl) {
            contentTrigger = ScrollTrigger.create({
                trigger: contentEl,
                start: 'top bottom',    // Start when content top reaches bottom of viewport
                end: 'bottom bottom',   // End when content bottom reaches bottom of viewport
                scrub: 0,
                onUpdate: (self) => {
                    scrollState.contentProgress = self.progress;
                }
            });
        }

        // Input listeners for "The Hit"
        const handleInput = (e) => {
            if (e.type === 'click' || (e.type === 'keydown' && e.code === 'Space')) {
                if (scrollState.progress > 0.4) {
                    scrollState.hit = true;
                }
            }
        };

        window.addEventListener('click', handleInput);
        window.addEventListener('keydown', handleInput);

        return () => {
            trigger.kill();
            if (contentTrigger) contentTrigger.kill();
            window.removeEventListener('click', handleInput);
            window.removeEventListener('keydown', handleInput);
        };
    }, []);
}
