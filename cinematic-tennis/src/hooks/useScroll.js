import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Mutable state 
export const scrollState = {
    progress: 0,
    velocity: 0,
    hit: false
};

export function useScroll() {
    useLayoutEffect(() => {
        window.scrollTo(0, 0);

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

        // Input listeners for "The Hit"
        const handleInput = (e) => {
            if (e.type === 'click' || (e.type === 'keydown' && e.code === 'Space')) {
                if (scrollState.progress > 0.4) { // Only allow hit after descent
                    scrollState.hit = true;
                    // Maybe auto-scroll to Act 6?
                    // window.scrollTo(...) 
                }
            }
        };

        window.addEventListener('click', handleInput);
        window.addEventListener('keydown', handleInput);

        return () => {
            trigger.kill();
            window.removeEventListener('click', handleInput);
            window.removeEventListener('keydown', handleInput);
        };
    }, []);
}
