import { Environment } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
// import { useControls } from "leva"; // Removed as requested
import { TennisBall } from "./TennisBall";
import { Racket } from "./Racket";
import { useScroll, scrollState } from "../hooks/useScroll";
import { useRef } from "react";
import * as THREE from "three";
import { damp } from "../utils/physics";

export default function Experience() {
    useScroll(); // Initialize scroll listener

    const ballRef = useRef();
    const racketRef = useRef();

    // Debug controls removed. Hardcoded values below.
    const ambientIntensity = 0.93;
    const environmentStart = 0.12;

    useFrame((state, delta) => {
        const p = scrollState.progress;

        // -- Choreography Targets --

        // Racket State
        let rPos = new THREE.Vector3(0, 0, 0);
        let rRot = new THREE.Euler(0, 0, 0);

        // Ball State
        // Default: Hidden High
        let bPos = new THREE.Vector3(0, 100, 0);
        let bScale = new THREE.Vector3(0, 0, 0);
        let bRot = new THREE.Euler(0, 0, 0);

        // -----------------------
        // RACKET ANIMATION (0% - 50%)
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

        // Keep Centered
        rPos.x = 0;
        rPos.y = 0;

        // -----------------------
        // BALL ANIMATION (35% - 50%)
        // -----------------------
        // Delayed start to 35% to avoid colliding with handle during early spin.
        if (p > 0.35 && p <= 0.5) {
            // Map 0.35->0.50 to 0->1
            const tBall = (p - 0.35) / 0.15;

            // Show Ball
            bScale.set(0.2, 0.2, 0.2); // Small

            // Fall Trajectory
            // Y: 10 (High) -> -3 (Lower to hit Middle of Head)
            // Z: 0 (Close) -> -9.5 (Very close to Front of Racket at -10)
            bPos.y = THREE.MathUtils.lerp(10, -3, tBall);
            bPos.z = THREE.MathUtils.lerp(0, -9.5, tBall);
            bPos.x = 0;

            // Add some spin to ball
            bRot.x = tBall * Math.PI * 4;

        } else if (p > 0.5 && p <= 0.75) {
            // -----------------------
            // HIT SEQUENCE (50% - 75%)
            // -----------------------
            const tHit = (p - 0.5) / 0.25; // 0 to 1

            // Phase 4a: PREP (Cock Back) - 0.0 to 0.4
            // Phase 4b: SWING (Hit)      - 0.4 to 1.0

            if (tHit < 0.4) {
                // PREP
                const tPrep = tHit / 0.4;

                // Rotation: Go Back 30 degrees (Cock wrist)
                // Start: -90 deg (-PI/2). End: -120 deg (-PI/2 - PI/6).
                rRot.x = THREE.MathUtils.lerp(-Math.PI / 2, -Math.PI / 2 - Math.PI / 6, tPrep);

                // Position: Static (User: "don't move ball just move head back")
                // Keep racket at Z=-10. (No handle movement)
                rPos.z = -10;

                // Ball: Static at impact point
                bPos.set(0, -3, -9.5);
                bScale.set(0.2, 0.2, 0.2);
                bRot.x = Math.PI * 4;

            } else {
                // SWING
                const tSwing = (tHit - 0.4) / 0.6;

                // Rotation: Swing Forward to Normal (or slightly through)
                // Start: -120 deg. End: -90 deg (Normal) or -80 deg.
                rRot.x = THREE.MathUtils.lerp(-Math.PI / 2 - Math.PI / 6, -Math.PI / 2 + 0.2, tSwing);

                // Position: Handle stabilizes or moves through
                // Start: -10 (Static Prep). End: -10.
                rPos.z = THREE.MathUtils.lerp(-10, -10, tSwing);

                // Ball Logic: Launch Towards Screen!
                // Z: -9.5 (Impact) -> 15 (Past Camera)
                // Y: -3 (Impact) -> 0 (Center)
                bPos.z = THREE.MathUtils.lerp(-9.5, 15, tSwing);
                bPos.y = THREE.MathUtils.lerp(-3, 0, tSwing);

                // Size: Become HUGE (Cover Screen)
                const scale = THREE.MathUtils.lerp(0.2, 30.0, tSwing);
                bScale.set(scale, scale, scale);

                // Spin
                bRot.x = Math.PI * 4 + (tSwing * Math.PI * 2);

                // User requested Royal Blue for main site match
                if (p > 0.65) {
                    // > 65%: Royal Blue BG
                    state.scene.background.setHex(0x051025);
                    bScale.set(0, 0, 0);
                } else {
                    // 50-65%: Dark BG
                    state.scene.background.setHex(0x050505);
                }
            }

            rRot.y = 0;
            rRot.z = 0;

        } else if (p > 0.75) {
            // HOLD FINAL STATE
            rRot.x = -Math.PI / 2 + 0.2;
            rPos.z = -10;

            // p > 0.75 is > 70% -> Always Royal Blue / Ball Gone
            state.scene.background.setHex(0x051025);
            bScale.set(0, 0, 0);
            bPos.z = 15; // Just in case, keep z high
        } else {
            // Reset BG for other phases
            state.scene.background.setHex(0x050505);
        }

        // Apply Damping
        // Dynamic Lambda: Smooth (1.5) when slow, Snappy (10+) when fast.
        // This ensures the ball doesn't get "left behind" during fast scrolls.
        const velocity = Math.abs(scrollState.velocity || 0);
        const baseLambda = 1.5;
        const dynamicLambda = velocity > 50 ? 12.0 : (velocity > 20 ? 6.0 : baseLambda);

        // Use the higher value to keep up with user input
        const lambda = dynamicLambda;

        if (racketRef.current) {
            racketRef.current.position.x = damp(racketRef.current.position.x, rPos.x, lambda, delta);
            racketRef.current.position.y = damp(racketRef.current.position.y, rPos.y, lambda, delta);
            racketRef.current.position.z = damp(racketRef.current.position.z, rPos.z, lambda, delta);

            racketRef.current.rotation.x = damp(racketRef.current.rotation.x, rRot.x, lambda, delta);
            racketRef.current.rotation.y = damp(racketRef.current.rotation.y, rRot.y, lambda, delta);
            racketRef.current.rotation.z = damp(racketRef.current.rotation.z, rRot.z, lambda, delta);
        }

        if (ballRef.current) {
            ballRef.current.position.x = damp(ballRef.current.position.x, bPos.x, lambda, delta);
            ballRef.current.position.y = damp(ballRef.current.position.y, bPos.y, lambda, delta);
            ballRef.current.position.z = damp(ballRef.current.position.z, bPos.z, lambda, delta);

            ballRef.current.scale.x = damp(ballRef.current.scale.x, bScale.x, lambda, delta);
            ballRef.current.scale.y = damp(ballRef.current.scale.y, bScale.y, lambda, delta);
            ballRef.current.scale.z = damp(ballRef.current.scale.z, bScale.z, lambda, delta);

            ballRef.current.rotation.x = damp(ballRef.current.rotation.x, bRot.x, lambda, delta);
            ballRef.current.rotation.y = damp(ballRef.current.rotation.y, bRot.y, lambda, delta);
            ballRef.current.rotation.z = damp(ballRef.current.rotation.z, bRot.z, lambda, delta);
        }
    });

    return (
        <>
            <color attach="background" args={["#050505"]} />

            {/* Lights */}
            <ambientLight intensity={ambientIntensity} />
            <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
            <pointLight position={[-5, 5, 5]} intensity={1} color="#ffffff" />

            <Environment preset="studio" environmentIntensity={environmentStart} />

            <group name="Stage">
                <TennisBall ref={ballRef} />
                <Racket ref={racketRef} />
            </group>
        </>
    );
}
