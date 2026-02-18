import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, ...props }, ref) => {
    return (
        <div style={{ marginBottom: '1.5rem', width: '100%' }}>
            {label && (
                <label
                    style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#e2e8f0',
                        textAlign: 'left'
                    }}
                >
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className="glass-input"
                {...props}
            />
            {error && <p className="error-msg animate-fade-in">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
