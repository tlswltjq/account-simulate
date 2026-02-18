const Button = ({ children, loading, disabled, ...props }) => {
    return (
        <button
            className="btn-primary"
            disabled={disabled || loading}
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: disabled || loading ? 0.7 : 1
            }}
            {...props}
        >
            {loading && (
                <span
                    style={{
                        width: '1em',
                        height: '1em',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        display: 'inline-block'
                    }}
                />
            )}
            {children}
            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </button>
    );
};

export default Button;
