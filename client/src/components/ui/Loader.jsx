import React from 'react';

export default function Loader({ text = 'Loading data...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem',
      gap: '1.25rem',
      width: '100%',
      minHeight: '200px'
    }}>
      <div style={{ position: 'relative', width: '32px', height: '32px' }}>
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          style={{
            color: 'var(--brand-500)',
            animation: 'spin 1s linear infinite',
            width: '100%',
            height: '100%',
          }}
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>

      {text && (
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.8125rem',
          fontWeight: 500,
          animation: 'pulse-opacity 2s ease-in-out infinite',
        }}>
          {text}
        </p>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse-opacity {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}
