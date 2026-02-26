import { Environment } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { TennisBall } from "./TennisBall";
import { Racket } from "./Racket";
import { useScroll, scrollState } from "../hooks/useScroll";
import { useRef } from "react";
import * as THREE from "three";
import { damp } from "../utils/physics";
import gsap from "gsap";

export default function Experience() {
    useScroll(); // Initialize scroll listener

    const ballRef = useRef();
    const racketRef = useRef();
    const contentRevealed = useRef(false); // Track whether content sections have been revealed
    const directYControl = useRef(false); // Bypass Y damping during exit (so racket matches page scroll)

    const ambientIntensity = 0.93;
    const environmentStart = 0.12;

    const smoothProgress = useRef(0);

    // Easing helper for extra-smooth ball flight
    const easeInOutCubic = (t) => {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    useFrame((state, delta) => {
        // Smooth scroll progress with damping for silky animation
        // Lambda of 2.0 gives smooth motion while catching up fast enough
        // to prevent content peeking during fast scroll
        const timeLambda = 2.0;
        smoothProgress.current = damp(smoothProgress.current, scrollState.progress, timeLambda, delta);
        const p = smoothProgress.current;

        // -- Choreography Targets --
        directYControl.current = false; // Reset each frame; phases set it true when needed

        // Racket State
        let rPos = new THREE.Vector3(0, 0, 0);
        let rRot = new THREE.Euler(0, 0, 0);
        let rScale = new THREE.Vector3(1, 1, 1);

        // Ball State — Default: Hidden High
        let bPos = new THREE.Vector3(0, 100, 0);
        let bScale = new THREE.Vector3(0, 0, 0);
        let bRot = new THREE.Euler(0, 0, 0);

        // Off-white color for the background transition
        const offWhiteHex = 0xF5F0EB; // Warm off-white

        // -----------------------
        // PHASE 1: RACKET INTRO SPIN (0% - 50%)
        // -----------------------
        const t = THREE.MathUtils.clamp(p / 0.5, 0, 1);

        // Rotation: 450deg Spin -> Upright
        rRot.x = THREE.MathUtils.lerp(2 * Math.PI, -Math.PI / 2, t);
        rRot.y = 0;
        rRot.z = 0;

        // Position: Zoom out to Z=-10
        const startZ = -0.6;
        const endZ = -10;
        rPos.z = THREE.MathUtils.lerp(startZ, endZ, t);
        rPos.x = 0;
        rPos.y = 0;

        // -----------------------
        // PHASE 2: BALL DESCENT (35% - 50%)
        // -----------------------
        if (p > 0.35 && p <= 0.5) {
            const tBall = (p - 0.35) / 0.15;

            bScale.set(0.2, 0.2, 0.2);

            // Smooth fall trajectory
            bPos.y = THREE.MathUtils.lerp(10, -3, tBall);
            bPos.z = THREE.MathUtils.lerp(0, -9.5, tBall);
            bPos.x = 0;

            // Add spin to ball
            bRot.x = tBall * Math.PI * 4;

        } else if (p > 0.5 && p <= 0.75) {
            // -----------------------
            // PHASE 3: HIT SEQUENCE (50% - 75%)
            // -----------------------
            const tHit = (p - 0.5) / 0.25;

            if (tHit < 0.4) {
                // PREP: Cock back
                const tPrep = tHit / 0.4;

                rRot.x = THREE.MathUtils.lerp(-Math.PI / 2, -Math.PI / 2 - Math.PI / 6, tPrep);
                rPos.z = -10;

                // Ball: Static at impact point
                bPos.set(0, -3, -9.5);
                bScale.set(0.2, 0.2, 0.2);
                bRot.x = Math.PI * 4;

            } else {
                // SWING & BALL FLIES TOWARD SCREEN
                const rawSwing = (tHit - 0.4) / 0.6;

                // Apply cubic easing for ultra-smooth ball flight
                const tSwing = easeInOutCubic(rawSwing);

                // Racket swings forward
                rRot.x = THREE.MathUtils.lerp(-Math.PI / 2 - Math.PI / 6, -Math.PI / 2 + 0.2, tSwing);
                rPos.z = -10;

                // Ball flies toward camera with smooth easing
                bPos.z = THREE.MathUtils.lerp(-9.5, 18, tSwing);
                bPos.y = THREE.MathUtils.lerp(-3, 0, tSwing);

                // Size: Become HUGE (Cover Screen) — use smoother scaling curve
                const scale = THREE.MathUtils.lerp(0.2, 35.0, tSwing * tSwing); // quadratic for smooth grow
                bScale.set(scale, scale, scale);

                // Smooth spin
                bRot.x = Math.PI * 4 + (tSwing * Math.PI * 3);

                // Background transition: smooth crossfade from dark to off-white
                if (rawSwing > 0.55) {
                    // Ball has passed the camera — transition to off-white
                    const bgT = THREE.MathUtils.clamp((rawSwing - 0.55) / 0.25, 0, 1);
                    const darkColor = new THREE.Color(0x050505);
                    const lightColor = new THREE.Color(offWhiteHex);
                    const blendedColor = darkColor.clone().lerp(lightColor, bgT);
                    state.scene.background.copy(blendedColor);

                    // Hide ball once it's past the camera
                    if (rawSwing > 0.7) {
                        bScale.set(0, 0, 0);
                    }

                    // Header color sync
                    const header = document.querySelector('header');
                    if (header) {
                        header.style.color = '#1a1a1a';
                        header.style.mixBlendMode = 'normal';
                    }
                } else {
                    // Still dark phase
                    state.scene.background.setHex(0x050505);
                    const header = document.querySelector('header');
                    if (header) {
                        header.style.color = 'var(--c-ivory)';
                        header.style.mixBlendMode = 'difference';
                    }
                }
            }

            rRot.y = 0;
            rRot.z = 0;

        } else if (p > 0.75) {
            // -----------------------
            // PHASE 4: RACKET PRODUCT SHOWCASE (75% - 100%)
            //
            // After the ball hits:
            //   1. Racket rotates 180° to STRAIGHT UPRIGHT (head up ↑, handle down ↓)
            //   2. Moves to the RIGHT side of the screen
            //   3. Scroll-driven zoom:
            //      - Stage 1 (cp 0-0.35): ZOOM on HEAD — racket Y shifts so head fills right viewport
            //      - Stage 2 (cp 0.35-0.7): PAN to HANDLE — racket Y shifts so handle fills right viewport
            //      - Stage 3 (cp 0.7-1.0): ZOOM OUT — full racket visible, smaller, for remaining sections
            //   Text content appears on the LEFT side in sync.
            // -----------------------

            // Initial reveal: bring racket from swing pose to upright on right side
            const tReveal = THREE.MathUtils.clamp((p - 0.75) / 0.12, 0, 1);
            const easedReveal = easeInOutCubic(tReveal);

            // Content scroll progress drives the zoom/pan
            const cp = scrollState.contentProgress;

            // --- BASE POSITION: Right side of screen, FULLY upright ---
            // After swing, racket was at Z=-10 with rRot.x ~ -PI/2 + 0.2
            // We rotate a FULL 180° to rRot.x = +PI/2 (head up, handle down)
            //   - rRot.x = PI/2 → straight upright (head up, handle down)
            //   - rPos.x = 2.5  → right side
            //   - rPos.z = -3.5 → close to camera for zoom
            //   - rRot.y = 0 → perfectly straight, no slant

            // The racket starts at the swing end state:
            // rRot.x = -PI/2 + 0.2, rPos = (0, 0, -10)
            // Target: rRot.x = +PI/2 → full 180° rotation

            // Step 1: Rotate 180° to upright and move to right
            const uprightRotX = Math.PI / 2; // Full upright: head up, handle down
            const revealRotX = THREE.MathUtils.lerp(-Math.PI / 2 + 0.2, uprightRotX, easedReveal);
            const revealPosX = THREE.MathUtils.lerp(0, 2.5, easedReveal);
            const revealPosZ = THREE.MathUtils.lerp(-10, -3.5, easedReveal);

            if (cp < 0.33) {
                // ===========================
                // STAGE 1: ZOOM ON HEAD
                // ===========================
                // Covers RacketHero + RacketStrings sections (first 2 of 6)
                const stageT = THREE.MathUtils.clamp(cp / 0.33, 0, 1);
                const easedStage = easeInOutCubic(stageT);

                // Position: upright on right, head centered
                rPos.x = revealPosX;
                rPos.y = THREE.MathUtils.lerp(0, -1.5, easedStage * easedReveal);
                rPos.z = THREE.MathUtils.lerp(revealPosZ, -2.0, easedStage * easedReveal);

                // Rotation: straight upright, no slant
                rRot.x = revealRotX;
                rRot.y = 0;
                rRot.z = 0;

                // Subtle float
                if (tReveal >= 1) {
                    const time = state.clock.getElapsedTime();
                    rPos.y += Math.sin(time * 0.4) * 0.03;
                }

            } else {
                // ===========================
                // STAGE 2 & 3: HANDLE SHOWCASE & EXIT
                // ===========================

                rPos.x = 2.5;
                rPos.z = -2.5;

                const section = document.getElementById('racket-handle-section');
                if (section) {
                    const rect = section.getBoundingClientRect();
                    const vh = window.innerHeight;
                    // Center of the text section in pixel space
                    const pixelOffset = (rect.top + rect.height / 2) - (vh / 2);

                    // Convert pixel offset to world units exactly tracking DOM
                    // Approx world height at z=-2.5 and fov=35 is 4.7295
                    const worldHeight = 4.7295;
                    const unitsPerPx = worldHeight / vh;

                    // Target Y places the handle (rPos.y = 2.0) perfectly on the section string
                    const targetY = 2.0 - (pixelOffset * unitsPerPx);

                    // Let standard, globally configured physics damping organically 
                    // catch up to targetY. This creates perfect "flow". 
                    rPos.y = targetY;
                } else {
                    const stageT = THREE.MathUtils.clamp((cp - 0.33) / 0.17, 0, 1);
                    rPos.y = THREE.MathUtils.lerp(-1.5, 8.0, stageT);
                }

                // Keep upright, perfectly straight
                rRot.x = Math.PI / 2;
                rRot.y = 0;
                rRot.z = 0;
            }

            // Scale during initial reveal
            if (tReveal < 1) {
                const scaleReveal = THREE.MathUtils.lerp(0.7, 1.0, easedReveal);
                rScale.set(scaleReveal, scaleReveal, scaleReveal);
            }

            // Background: solid off-white
            state.scene.background.setHex(offWhiteHex);

            // Ball gone
            bScale.set(0, 0, 0);
            bPos.z = 20;

            // Header color: dark on light background
            const header = document.querySelector('header');
            if (header) {
                header.style.color = '#1a1a1a';
                header.style.mixBlendMode = 'normal';
            }

            // CONTENT REVEAL: Only show content after damped animation has
            // completed the ball sequence
            if (!contentRevealed.current) {
                contentRevealed.current = true;
                const contentSections = document.querySelector('.home-content-sections');
                const mainEl = document.querySelector('.layout-wrapper main');
                const footerEl = document.querySelector('.layout-wrapper main + div');
                if (contentSections) {
                    gsap.to(contentSections, {
                        autoAlpha: 1,
                        y: 0,
                        duration: 1.0,
                        ease: "power2.out"
                    });
                }
                if (mainEl && footerEl) {
                    gsap.to([mainEl, footerEl], {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.8,
                        ease: "power2.out",
                        delay: 0.2
                    });
                }
            }
        } else {
            // Default: dark background (scroll progress < 35% or any non-hit phase)
            state.scene.background.setHex(0x050505);

            const header = document.querySelector('header');
            if (header) {
                header.style.color = 'var(--c-ivory)';
                header.style.mixBlendMode = 'difference';
            }

            // HIDE CONTENT: If user scrolls back up before the ball hit,
            // keep content hidden
            if (contentRevealed.current) {
                contentRevealed.current = false;
                const contentSections = document.querySelector('.home-content-sections');
                const mainEl = document.querySelector('.layout-wrapper main');
                const footerEl = document.querySelector('.layout-wrapper main + div');
                if (contentSections) {
                    gsap.to(contentSections, {
                        autoAlpha: 0,
                        y: 50,
                        duration: 0.5,
                        ease: "power2.in"
                    });
                }
                if (mainEl && footerEl) {
                    gsap.to([mainEl, footerEl], {
                        autoAlpha: 0,
                        y: 50,
                        duration: 0.5,
                        ease: "power2.in"
                    });
                }
            }
        }

        // Apply Damping to VECTORS
        // vectorLambda 10 = responsive to scroll while smooth
        const vectorLambda = 10

        if (racketRef.current) {
            racketRef.current.position.x = damp(racketRef.current.position.x, rPos.x, vectorLambda, delta);
            // When directYControl is on, set Y directly (no damping)
            // so the racket moves exactly at the same speed as the page content
            if (directYControl.current) {
                racketRef.current.position.y = rPos.y;
            } else {
                racketRef.current.position.y = damp(racketRef.current.position.y, rPos.y, vectorLambda, delta);
            }
            racketRef.current.position.z = damp(racketRef.current.position.z, rPos.z, vectorLambda, delta);

            racketRef.current.rotation.x = damp(racketRef.current.rotation.x, rRot.x, vectorLambda, delta);
            racketRef.current.rotation.y = damp(racketRef.current.rotation.y, rRot.y, vectorLambda, delta);
            racketRef.current.rotation.z = damp(racketRef.current.rotation.z, rRot.z, vectorLambda, delta);

            racketRef.current.scale.x = damp(racketRef.current.scale.x, rScale.x, vectorLambda, delta);
            racketRef.current.scale.y = damp(racketRef.current.scale.y, rScale.y, vectorLambda, delta);
            racketRef.current.scale.z = damp(racketRef.current.scale.z, rScale.z, vectorLambda, delta);
        }

        if (ballRef.current) {
            ballRef.current.position.x = damp(ballRef.current.position.x, bPos.x, vectorLambda, delta);
            ballRef.current.position.y = damp(ballRef.current.position.y, bPos.y, vectorLambda, delta);
            ballRef.current.position.z = damp(ballRef.current.position.z, bPos.z, vectorLambda, delta);

            ballRef.current.scale.x = damp(ballRef.current.scale.x, bScale.x, vectorLambda, delta);
            ballRef.current.scale.y = damp(ballRef.current.scale.y, bScale.y, vectorLambda, delta);
            ballRef.current.scale.z = damp(ballRef.current.scale.z, bScale.z, vectorLambda, delta);

            ballRef.current.rotation.x = damp(ballRef.current.rotation.x, bRot.x, vectorLambda, delta);
            ballRef.current.rotation.y = damp(ballRef.current.rotation.y, bRot.y, vectorLambda, delta);
            ballRef.current.rotation.z = damp(ballRef.current.rotation.z, bRot.z, vectorLambda, delta);
        }
    });

    return (
        <>
            <color attach="background" args={["#050505"]} />

            {/* Lights */}
            <ambientLight intensity={ambientIntensity} />
            <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
            <pointLight position={[-5, 5, 5]} intensity={1} color="#ffffff" />

            {/* Extra fill light for when racket is in hero position on light bg */}
            <pointLight position={[3, 2, -3]} intensity={0.6} color="#faf5ef" />
            <pointLight position={[-3, -2, -3]} intensity={0.3} color="#e8e0d8" />

            <Environment preset="studio" environmentIntensity={environmentStart} />

            <group name="Stage">
                <TennisBall ref={ballRef} />
                <Racket ref={racketRef} />
            </group>
        </>
    );
}
