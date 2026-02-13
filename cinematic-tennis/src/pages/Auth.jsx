import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('user'); // 'user' or 'recruiter'
    const [isLogin, setIsLogin] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Basic validation
        if (!isLogin && formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const payload = {
            email: formData.email,
            password: formData.password
        };

        if (!isLogin) {
            payload.username = formData.username;
            payload.role = role;
        }

        try {
            // Assuming proxy is set up in vite.config or we use full URL
            // Using full URL for local dev if proxy isn't set, but try relative first
            const { data } = await axios.post(`http://localhost:5001${endpoint}`, payload);

            // Store token
            localStorage.setItem('userInfo', JSON.stringify(data));

            // Redirect based on role
            if (data.role === 'recruiter') {
                navigate('/');
                // In real app, might redirect to /dashboard
            } else {
                navigate('/');
            }

        } catch (err) {
            setError(err.response && err.response.data.message ? err.response.data.message : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#020610', // Deep space black
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'var(--font-sans)',
            paddingTop: '80px' // Clear header
        }}>
            {/* Background Ambience */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                left: '-20%',
                width: '60%',
                height: '60%',
                background: 'radial-gradient(circle, rgba(5, 50, 150, 0.15), transparent 70%)',
                filter: 'blur(80px)',
                zIndex: 0
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-20%',
                right: '-20%',
                width: '60%',
                height: '60%',
                background: role === 'recruiter'
                    ? 'radial-gradient(circle, rgba(0, 200, 100, 0.1), transparent 70%)'
                    : 'radial-gradient(circle, rgba(212, 175, 55, 0.1), transparent 70%)',
                filter: 'blur(80px)',
                transition: 'background 0.5s ease',
                zIndex: 0
            }} />

            <div className="auth-card" style={{
                zIndex: 10,
                width: '100%',
                maxWidth: '450px',
                padding: '2.5rem',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(16px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                transform: 'translateY(0)',
                animation: 'float 6s ease-in-out infinite',
                transition: 'all 0.4s ease'
            }}>
                <style>
                    {`
                        @keyframes float {
                            0% { transform: translateY(0px); }
                            50% { transform: translateY(-15px); }
                            100% { transform: translateY(0px); }
                        }
                        .auth-card:hover {
                            transform: scale(1.02) translateY(-5px);
                            border-color: rgba(255, 255, 255, 0.2);
                            box-shadow: 0 0 30px rgba(5, 50, 150, 0.2);
                        }
                        .input-group input:focus {
                            border-color: ${role === 'recruiter' ? '#00ff88' : '#D4AF37'};
                            box-shadow: 0 0 15px ${role === 'recruiter' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(212, 175, 55, 0.1)'};
                        }
                    `}
                </style>

                {/* Role Toggles */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', marginBottom: '2rem' }}>
                    <button
                        onClick={() => setRole('user')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            border: 'none',
                            background: role === 'user' ? '#D4AF37' : 'transparent',
                            color: role === 'user' ? '#000' : '#888',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        User
                    </button>
                    <button
                        onClick={() => setRole('recruiter')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            border: 'none',
                            background: role === 'recruiter' ? '#00ff88' : 'transparent',
                            color: role === 'recruiter' ? '#000' : '#888',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Recruiter
                    </button>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{
                        fontSize: '2rem',
                        fontFamily: 'var(--font-serif)',
                        color: '#fff',
                        marginBottom: '0.5rem',
                        textShadow: role === 'recruiter' ? '0 0 20px rgba(0, 255, 136, 0.3)' : '0 0 20px rgba(212, 175, 55, 0.3)'
                    }}>
                        {isLogin ? 'Welcome Back' : 'Join the Future'}
                    </h2>
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>
                        {isLogin ? `Log in to your ${role} account` : `Create your ${role} profile`}
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(255, 50, 50, 0.1)',
                        border: '1px solid rgba(255, 50, 50, 0.3)',
                        color: '#ff5555',
                        padding: '10px',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {!isLogin && (
                        <div className="input-group">
                            <input
                                type="text"
                                name="username"
                                placeholder="Full Name"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '10px',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                        </div>
                    )}

                    <div className="input-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    </div>

                    {!isLogin && (
                        <div className="input-group">
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '10px',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                        </div>
                    )}

                    <button type="submit" style={{
                        marginTop: '1rem',
                        padding: '14px',
                        borderRadius: '50px',
                        border: 'none',
                        background: role === 'recruiter'
                            ? 'linear-gradient(90deg, #00ff88, #00b8ff)'
                            : 'linear-gradient(90deg, #D4AF37, #F2D06B)',
                        color: '#000',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transform: 'translateY(0)',
                        transition: 'transform 0.2s',
                        boxShadow: role === 'recruiter'
                            ? '0 4px 15px rgba(0, 255, 136, 0.3)'
                            : '0 4px 15px rgba(212, 175, 55, 0.3)'
                    }}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Create Account')}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span
                        onClick={() => setIsLogin(!isLogin)}
                        style={{
                            color: '#fff',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Auth;
