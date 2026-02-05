import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Experience from "./components/Experience";
import Auth from './pages/Auth';
import "./index.css";
import ReactLenis from "lenis/react";
import { HTMLOverlay } from "./components/HTMLOverlay";
import { Loader } from "./components/Loader";
import gsap from "gsap";

import Layout from "./components/layout/Layout";
import RacketHero from "./components/sections/RacketHero";
import RacketStrings from "./components/sections/RacketStrings";
import FrameMaterial from "./components/sections/FrameMaterial";
import Performance from "./components/sections/Performance";
import LegacyPlayers from "./components/sections/LegacyPlayers";
import CurrentPlayers from "./components/sections/CurrentPlayers";
import Shop from "./components/sections/Shop";
import CheckoutDemo from "./components/sections/CheckoutDemo";
import { RegionProvider } from "./context/RegionContext";

function App() {
  const lenisRef = useRef();
  const [checkoutProduct, setCheckoutProduct] = useState(null);

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
    <RegionProvider>
      <Router>
        <ReactLenis root ref={lenisRef} autoRaf={false}>
          <Routes>
            <Route path="/" element={
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
                  {/* Spacer for 3D Intro Animation */}
                  <div className="cinematic-spacer" style={{ height: '400vh' }}></div>

                  {/* Main Website Content */}
                  <div style={{ position: 'relative', zIndex: 20, backgroundColor: 'var(--c-bg-main)' }}>
                    <Layout>
                      <RacketHero />
                      <RacketStrings />
                      <FrameMaterial />
                      <Performance />
                      <LegacyPlayers />
                      <CurrentPlayers />
                      <Shop onCheckout={setCheckoutProduct} />
                    </Layout>
                  </div>
                </div>

                <HTMLOverlay />
                <div className="grain-overlay" />
                <Loader />

                <CheckoutDemo
                  product={checkoutProduct}
                  onClose={() => setCheckoutProduct(null)}
                  onConfirm={async () => {
                    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

                    if (!userInfo || !userInfo.token) {
                      alert("Please log in to place an order.");
                      window.location.href = '/auth';
                      return;
                    }

                    try {
                      const config = {
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${userInfo.token}`,
                        },
                      };

                      const orderData = {
                        orderItems: [{
                          name: checkoutProduct.name,
                          qty: 1,
                          image: checkoutProduct.imageUrl,
                          price: checkoutProduct.price,
                          product: checkoutProduct._id
                        }],
                        totalPrice: checkoutProduct.price
                      };

                      await axios.post('http://localhost:5001/api/orders', orderData, config);

                      alert(`Order placed successfully for ${checkoutProduct.name}!`);
                      setCheckoutProduct(null);
                    } catch (error) {
                      console.error("Order failed:", error);
                      alert("Failed to place order. Please try again.");
                    }
                  }}
                />
              </>
            } />

            <Route path="/auth" element={<Auth />} />
          </Routes>
        </ReactLenis>
      </Router>
    </RegionProvider>
  );
}

export default App;
