import { useEffect, useRef } from 'react';
import { scrollState } from '../hooks/useScroll';

/**
 * Cinematic "scroll to begin" hint.
 * Sits at the bottom of the initial dark intro and fades out as the
 * user scrolls into the racket animation (driven by scrollState.progress).
 */
export function ScrollHint() {
    const hintRef = useRef();

    useEffect(() => {
        let frame;
        const tick = () => {
            if (hintRef.current) {
                // Fully visible at the top, gone by the time the intro spin begins.
                const fade = 1 - Math.min(scrollState.progress / 0.08, 1);
                hintRef.current.style.opacity = fade;
                hintRef.current.style.pointerEvents = fade < 0.1 ? 'none' : 'auto';
            }
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <div ref={hintRef} className="scroll-hint">
            <span className="scroll-hint__label">Scroll to begin</span>
            <span className="scroll-hint__line">
                <span className="scroll-hint__dot" />
            </span>
        </div>
    );
}

export default ScrollHint;
