import React from 'react';

const ShortStayLoader = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100%',
      backgroundColor: '#ffffff', // Optional: background color
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999, // Ensure it's on top
    }}>
        <div className="loader"></div>
        <style>{`
            .loader {
            width: 50px;
            aspect-ratio: 1;
            border-radius: 50%;
            background: #514b82;
            -webkit-mask: radial-gradient(circle closest-side at 50% 40%,#0000 94%, #000);
            transform-origin: 50% 40%;
            animation: l25 1s infinite linear;
            }
            @keyframes l25 {
            100% {transform: rotate(1turn)}
            }
        `}</style>
    </div>
  );
};

export default ShortStayLoader;
