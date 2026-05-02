interface CandleFlameProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function CandleFlame({ size = "md", className = "" }: CandleFlameProps) {
  const sizes = {
    sm: { flame: { width: 20, height: 28 }, wax: { width: 16, height: 40 } },
    md: { flame: { width: 28, height: 40 }, wax: { width: 22, height: 56 } },
    lg: { flame: { width: 36, height: 52 }, wax: { width: 28, height: 72 } },
  };

  const s = sizes[size];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Flame */}
      <div
        className="candle-flame relative"
        style={{
          width: s.flame.width,
          height: s.flame.height,
        }}
      >
        {/* Outer flame */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: s.flame.width,
            height: s.flame.height,
            background: "radial-gradient(ellipse at 50% 80%, #ff8c00 0%, #ff4500 40%, transparent 80%)",
            borderRadius: "50% 50% 30% 30%",
            filter: "blur(1px)",
          }}
        />
        {/* Inner flame */}
        <div
          style={{
            position: "absolute",
            bottom: 2,
            left: "50%",
            transform: "translateX(-50%)",
            width: s.flame.width * 0.55,
            height: s.flame.height * 0.65,
            background: "radial-gradient(ellipse at 50% 70%, #ffe066 0%, #ffb300 60%, transparent 100%)",
            borderRadius: "50% 50% 30% 30%",
          }}
        />
        {/* Core */}
        <div
          style={{
            position: "absolute",
            bottom: 3,
            left: "50%",
            transform: "translateX(-50%)",
            width: s.flame.width * 0.2,
            height: s.flame.height * 0.3,
            background: "rgba(255, 255, 220, 0.95)",
            borderRadius: "50%",
            filter: "blur(0.5px)",
          }}
        />
      </div>

      {/* Wick */}
      <div
        style={{
          width: 2,
          height: 6,
          background: "#3a2010",
          borderRadius: 1,
        }}
      />

      {/* Wax body */}
      <div
        className="candle-glow"
        style={{
          width: s.wax.width,
          height: s.wax.height,
          background: "linear-gradient(135deg, hsl(35,60%,82%) 0%, hsl(35,50%,72%) 50%, hsl(30,45%,60%) 100%)",
          borderRadius: "3px 3px 2px 2px",
          border: "1px solid rgba(180,140,80,0.4)",
        }}
      />
    </div>
  );
}
