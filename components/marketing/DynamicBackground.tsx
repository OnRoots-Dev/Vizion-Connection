"use client";

export function DynamicBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: -10, overflow: "hidden", background: "#0B0B0F" }}>
      <div style={{
        position: "absolute", left: "-10%", top: "-10%",
        height: "70vh", width: "70vw", borderRadius: "50%",
        background: "#FFD600", opacity: 0.06, filter: "blur(120px)",
        animation: "bg-drift-1 15s linear infinite",
        willChange: "transform",
      }} />
      <div style={{
        position: "absolute", right: "-10%", top: "10%",
        height: "60vh", width: "60vw", borderRadius: "50%",
        background: "#FF4646", opacity: 0.04, filter: "blur(100px)",
        animation: "bg-drift-2 18s linear infinite",
        willChange: "transform",
      }} />
      <style>{`
        @keyframes bg-drift-1 {
          0%   { transform: translate(-20px, -10px) scale(1); }
          50%  { transform: translate(20px, 30px) scale(1.2); }
          100% { transform: translate(-20px, -10px) scale(1); }
        }
        @keyframes bg-drift-2 {
          0%   { transform: translate(20px, 30px) scale(1.2); }
          50%  { transform: translate(-20px, -10px) scale(1); }
          100% { transform: translate(20px, 30px) scale(1.2); }
        }
      `}</style>
    </div>
  );
}