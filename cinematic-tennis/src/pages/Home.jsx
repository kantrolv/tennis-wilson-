import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Experience from "../components/Experience";
import { HTMLOverlay } from "../components/HTMLOverlay";
import { Loader } from "../components/Loader";
import Layout from "../components/layout/Layout";
import RacketHero from "../components/sections/RacketHero";
import RacketStrings from "../components/sections/RacketStrings";
import FrameMaterial from "../components/sections/FrameMaterial";
import Performance from "../components/sections/Performance";
import LegacyPlayers from "../components/sections/LegacyPlayers";
import CurrentPlayers from "../components/sections/CurrentPlayers";

const Home = () => {
    return (
        <>
            {/* 3D Layer - Only on Home */}
            <div className="webgl-canvas">
                <Canvas
                    shadows
                    dpr={[1, 2]}
                    camera={{ position: [0, 0, 5], fov: 35 }}
                    gl={{ antialias: true, alpha: true }}
                >
                    <Suspense fallback={null}>
                        <Experience />
                    </Suspense>
                </Canvas>
            </div>

            {/* The Scrollable Area */}
            <div className="scroll-container">
                <Layout>
                    <div className="cinematic-spacer" style={{ height: '600vh' }}></div>
                    {/*
                        Content sections — starts hidden, revealed by Experience.jsx
                        when the damped animation passes 75%.
                        
                        Section layout maps to racket showcase stages:
                        - Stage 1 (contentProgress 0-0.35): Head & Strings → RacketHero + RacketStrings
                        - Stage 2 (contentProgress 0.35-0.7): Handle → FrameMaterial
                        - Stage 3 (contentProgress 0.7-1.0): Full view → Performance + Players
                    */}
                    <div className="home-content-sections" style={{
                        opacity: 0,
                        visibility: 'hidden',
                        transform: 'translateY(50px)'
                    }}>
                        {/* STAGE 1: Head & Strings (racket shows head up, strings facing viewer) */}
                        <RacketHero />
                        <RacketStrings />

                        {/* STAGE 2: Handle (racket rotates to show handle) */}
                        <FrameMaterial />

                        {/* STAGE 3: Full racket view — Performance & Players */}
                        <Performance />
                        <LegacyPlayers />
                        <CurrentPlayers />
                    </div>
                </Layout>
            </div>

            <div className="grain-overlay" />
            <Loader />
        </>
    );
};

export default Home;
