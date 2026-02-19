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
import { AuthProvider } from "./context/AuthContext";
import Login from './pages/Login';
import Signup from './pages/Signup';
import "./styles/Auth.css";
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import SuperadminDashboard from './pages/SuperadminDashboard';

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
      <AuthProvider>
        <CartProvider>
          <Router>
            <ReactLenis root ref={lenisRef} autoRaf={false}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/rackets" element={<Rackets />} />
                <Route path="/rackets/:id" element={<ProductDetails />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected Routes (any logged-in user) */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/cart" element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />

                {/* Admin Routes (admin + superadmin) */}
                <Route path="/admin/dashboard" element={
                  <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
                    <AdminDashboard />
                  </RoleProtectedRoute>
                } />

                {/* Superadmin Routes (superadmin only) */}
                <Route path="/superadmin/dashboard" element={
                  <RoleProtectedRoute allowedRoles={['superadmin']}>
                    <SuperadminDashboard />
                  </RoleProtectedRoute>
                } />
              </Routes>
            </ReactLenis>
          </Router>
        </CartProvider>
      </AuthProvider>
    </RegionProvider>
  );
}

export default App;
