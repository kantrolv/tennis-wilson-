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
                    dpr={[1, 2]} // Quality scaling
                    camera={{ position: [0, 0, 5], fov: 35 }} // Cinematic FOV
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
                    <RacketHero />
                    <RacketStrings />
                    <FrameMaterial />
                    <Performance />
                    <LegacyPlayers />
                    <CurrentPlayers />
                </Layout>
            </div>

            <div className="grain-overlay" />
            <Loader />
        </>
    );
};

export default Home;
