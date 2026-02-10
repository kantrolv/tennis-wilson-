import React from 'react';

const Button = ({ children, type = 'button', variant = 'primary', className = '', onClick }) => {
    const baseStyles = "w-full py-3 px-6 rounded font-semibold text-sm transition-all duration-300 uppercase tracking-widest hover:shadow-lg transform hover:-translate-y-0.5";

    const variants = {
        primary: {
            background: 'var(--c-gold)',
            color: '#000',
            border: 'none',
            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
        },
        secondary: {
            background: 'transparent',
            border: '1px solid var(--c-gold)',
            color: 'var(--c-gold)'
        }
    };

    const style = variants[variant] || variants.primary;

    return (
        <button
            type={type}
            className={`${baseStyles} ${className}`}
            onClick={onClick}
            style={style}
        >
            {children}
        </button>
    );
};

export default Button;
