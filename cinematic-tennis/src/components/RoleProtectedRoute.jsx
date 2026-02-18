import { useContext } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

/**
 * RoleProtectedRoute - Wraps routes requiring specific user roles
 * 
 * Props:
 *   allowedRoles: string[] — e.g. ['admin', 'superadmin']
 *   children: React.ReactNode
 * 
 * Behavior:
 *   - No user → redirect to /login
 *   - Authenticated but wrong role → redirect to /
 *   - Correct role → render children
 */
const RoleProtectedRoute = ({ allowedRoles, children }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#0a0a0a',
                color: '#ffffff',
                fontSize: '1.1rem',
                fontFamily: 'Inter, sans-serif',
            }}>
                Verifying access...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children ? children : <Outlet />;
};

export default RoleProtectedRoute;
