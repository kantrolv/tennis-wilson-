import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { useRegion } from './RegionContext';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { syncRegionFromUser } = useRegion();

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            const token = localStorage.getItem('token');

            if (token) {
                try {
                    const config = {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                    const { data } = await api.get('/api/auth/me');
                    setUser(data);
                    // Auto-sync region for admins on initial load
                    syncRegionFromUser(data);
                } catch (error) {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkUserLoggedIn();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/api/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            setUser(data);
            // Auto-sync region for admins on login
            syncRegionFromUser(data);
            setLoading(false);
            return data;
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        }
    };

    const signup = async (name, email, password, region) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/api/auth/signup', { name, email, password, region });
            localStorage.setItem('token', data.token);
            setUser(data);
            // Sync region for the newly created user
            syncRegionFromUser(data);
            setLoading(false);
            return data;
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Signup failed');
            throw err;
        }
    };

    const addAddress = async (addressData) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const { data } = await api.post('/api/users/address', addressData);
            setUser({ ...user, addresses: data });
            return data;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add address');
            throw err;
        }
    };

    const deleteAddress = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const { data } = await api.delete(`/api/users/address/${id}`);
            setUser({ ...user, addresses: data });
            return data;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete address');
            throw err;
        }
    };

    const updateAddress = async (id, addressData) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const { data } = await api.put(`/api/users/address/${id}`, addressData);
            setUser({ ...user, addresses: data });
            return data;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update address');
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, addAddress, deleteAddress, updateAddress, loading, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
