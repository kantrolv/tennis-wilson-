import { useRef, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Rackets from './pages/Rackets';
import ProductDetails from './pages/ProductDetails';
import "./index.css";
import ReactLenis from "lenis/react";
import gsap from "gsap";
import { RegionProvider } from "./context/RegionContext";
import { CartProvider } from "./context/CartContext";

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
    <RegionProvider>
      <CartProvider>
        <Router>
          <ReactLenis root ref={lenisRef} autoRaf={false}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/rackets" element={<Rackets />} />
              <Route path="/rackets/:id" element={<ProductDetails />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </ReactLenis>
        </Router>
      </CartProvider>
    </RegionProvider>
  );
}

export default App;
