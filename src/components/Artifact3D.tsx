"use client";

import React from 'react';

export default function Artifact3D() {
  return (
    <div className="relative w-full h-48 flex items-center justify-center overflow-hidden border-terminal bg-black/50 mb-6">
      <div className="absolute top-2 left-2 text-xs text-cyan-700">ARTIFACT_ANALYSIS // UNKNOWN_ORIGIN</div>
      
      {/* CSS 3D Cube Animation */}
      <div className="cube-container">
        <div className="cube">
          <div className="face front"></div>
          <div className="face back"></div>
          <div className="face right"></div>
          <div className="face left"></div>
          <div className="face top"></div>
          <div className="face bottom"></div>
        </div>
      </div>

      <style jsx>{`
        .cube-container {
          perspective: 800px;
          width: 100px;
          height: 100px;
        }
        .cube {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          animation: rotate 10s infinite linear;
        }
        .face {
          position: absolute;
          width: 100px;
          height: 100px;
          border: 1px solid #06b6d4;
          background: rgba(6, 182, 212, 0.1);
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
        }
        .front  { transform: rotateY(0deg) translateZ(50px); }
        .back   { transform: rotateY(180deg) translateZ(50px); }
        .right  { transform: rotateY(90deg) translateZ(50px); }
        .left   { transform: rotateY(-90deg) translateZ(50px); }
        .top    { transform: rotateX(90deg) translateZ(50px); }
        .bottom { transform: rotateX(-90deg) translateZ(50px); }

        @keyframes rotate {
          from { transform: rotateX(0deg) rotateY(0deg); }
          to { transform: rotateX(360deg) rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}
