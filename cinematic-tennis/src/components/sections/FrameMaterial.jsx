import React from 'react';

const FrameMaterial = () => {
    return (
        <section className="section align-right" style={{
            background: 'linear-gradient(to left, var(--c-bg-main), #081226)'
        }}>
            <div style={{ maxWidth: '600px', marginRight: '10vw', textAlign: 'right' }}>
                <h2 className="text-hero" style={{ fontSize: '3rem' }}>
                    Braided Graphite.
                </h2>
                <h3 className="text-accent" style={{ justifyContent: 'flex-end', display: 'flex' }}>Material Science</h3>

                <p className="text-sub" style={{ marginLeft: 'auto' }}>
                    Graphite gives strength without weight. Our proprietary braiding technology
                    aligns fibers at 45 degrees to enhance ball pocketing and stability.
                </p>

                <div className="glass-panel" style={{ marginTop: '3rem', textAlign: 'left' }}>
                    <p style={{ fontStyle: 'italic', opacity: 0.8 }}>
                        "Balance without compromise. The frame feels alive in your hand."
                    </p>
                </div>
            </div>

            {/* Visual element on left */}
            <div style={{
                position: 'absolute',
                left: '10%',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '300px',
                height: '600px',
                border: '1px solid rgba(212, 175, 55, 0.2)', // Gold tint
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <span style={{ opacity: 0.3, fontStyle: 'italic' }}>Frame Structure Visual</span>
            </div>
        </section>
    );
};

export default FrameMaterial;
