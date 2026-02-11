import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                    const { data } = await axios.get('http://localhost:5001/api/auth/me', config);
                    setUser(data);
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
            const { data } = await axios.post('http://localhost:5001/api/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            setUser(data);
            setLoading(false);
            return data;
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        }
    };

    const signup = async (name, email, password) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.post('http://localhost:5001/api/auth/signup', { name, email, password });
            localStorage.setItem('token', data.token);
            setUser(data);
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
            const { data } = await axios.post('http://localhost:5001/api/users/address', addressData, config);
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
            const { data } = await axios.delete(`http://localhost:5001/api/users/address/${id}`, config);
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
            const { data } = await axios.put(`http://localhost:5001/api/users/address/${id}`, addressData, config);
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
