import React from "react";

const DermAIPlus = ({ size = 48, color = "#111", className = "" }) => {
  return (
    <div
      className={`dermai-cross ${className}`}
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        className="cross-svg"
      >
        {/* Thick Filled Cross */}
        <path
          d="
            M40 15 
            H60 
            V40 
            H85 
            V60 
            H60 
            V85 
            H40 
            V60 
            H15 
            V40 
            H40 
            Z
          "
          fill={color}
        />
      </svg>

      <style>{`
        .cross-svg {
          transform-origin: center;
          animation: rotate90 3s ease-in-out infinite;
        }

        @keyframes rotate90 {
          0%   { transform: rotate(0deg); }
          50%  { transform: rotate(90deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
};

export default DermAIPlus;
