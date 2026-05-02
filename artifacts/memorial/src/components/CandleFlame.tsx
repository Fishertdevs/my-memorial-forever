interface CandleFlameProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  outerColor?: string;
  innerColor?: string;
  glowColor?: string;
}

export default function CandleFlame({
  size = "md",
  className = "",
  outerColor = "#f97316",
  innerColor = "#fbbf24",
  glowColor = "rgba(249,115,22,0.35)",
}: CandleFlameProps) {
  const sizes = {
    sm: { fw: 18, fh: 26, ww: 14, wh: 38 },
    md: { fw: 26, fh: 38, ww: 20, wh: 54 },
    lg: { fw: 34, fh: 50, ww: 26, wh: 70 },
  };
  const { fw, fh, ww, wh } = sizes[size];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Flame */}
      <div className="candle-flame relative" style={{ width: fw, height: fh }}>
        {/* Outer */}
        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: fw, height: fh, background: `radial-gradient(ellipse at 50% 80%, ${outerColor} 0%, ${outerColor}88 45%, transparent 80%)`, borderRadius: "50% 50% 30% 30%", filter: "blur(1.5px)" }} />
        {/* Inner */}
        <div style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: fw * 0.52, height: fh * 0.62, background: `radial-gradient(ellipse at 50% 70%, ${innerColor} 0%, ${outerColor}cc 65%, transparent 100%)`, borderRadius: "50% 50% 30% 30%" }} />
        {/* Core */}
        <div style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", width: fw * 0.17, height: fh * 0.27, background: "rgba(255,255,230,0.96)", borderRadius: "50%", filter: "blur(0.4px)" }} />
      </div>

      {/* Wick */}
      <div style={{ width: 2, height: 5, background: "#3a2010", borderRadius: 1 }} />

      {/* Candle body — matches the official gray body from the logo */}
      <div
        className="candle-glow"
        style={{
          width: ww,
          height: wh,
          background: "linear-gradient(160deg, #d1d5db 0%, #9ca3af 55%, #6b7280 100%)",
          borderRadius: `${3}px ${3}px ${2}px ${2}px`,
          border: "1px solid rgba(107,114,128,0.5)",
          boxShadow: `0 0 14px 5px ${glowColor}`,
        }}
      />
    </div>
  );
}
