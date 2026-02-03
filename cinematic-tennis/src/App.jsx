import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import Experience from "./components/Experience";
import "./index.css";
import ReactLenis from "lenis/react";
import { HTMLOverlay } from "./components/HTMLOverlay";
import { Loader } from "./components/Loader";
import gsap from "gsap";

function App() {
  const lenisRef = useRef();

  useEffect(() => {
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <>
      <ReactLenis root ref={lenisRef} autoRaf={false}>
        {/* The 3D Layer */}
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

        {/* The Scrollable Area (Height defines the timeline) */}
        <div className="scroll-container">
          {/* HTML overlays will go here later */}
          <div style={{ height: '400vh' }}></div>
        </div>

        <HTMLOverlay />
        <div className="grain-overlay" />
        <Loader />
      </ReactLenis>
    </>
  );
}

export default App;
