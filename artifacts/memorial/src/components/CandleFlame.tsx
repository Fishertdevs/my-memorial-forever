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
  glowColor = "rgba(249,115,22,0.28)",
}: CandleFlameProps) {
  const s = {
    sm: { fw: 16, fh: 24, ww: 13, wh: 36 },
    md: { fw: 24, fh: 36, ww: 18, wh: 52 },
    lg: { fw: 32, fh: 48, ww: 24, wh: 68 },
  }[size];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="candle-flame relative" style={{ width: s.fw, height: s.fh }}>
        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: s.fw, height: s.fh, background: `radial-gradient(ellipse at 50% 80%, ${outerColor} 0%, ${outerColor}66 50%, transparent 80%)`, borderRadius: "50% 50% 30% 30%", filter: "blur(1.5px)" }} />
        <div style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: s.fw * 0.5, height: s.fh * 0.6, background: `radial-gradient(ellipse at 50% 70%, ${innerColor} 0%, ${outerColor}bb 65%, transparent 100%)`, borderRadius: "50% 50% 30% 30%" }} />
        <div style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", width: s.fw * 0.16, height: s.fh * 0.26, background: "rgba(255,255,240,0.95)", borderRadius: "50%", filter: "blur(0.3px)" }} />
      </div>
      <div style={{ width: 2, height: 5, background: "#555", borderRadius: 1 }} />
      <div
        className="candle-body"
        style={{
          width: s.ww,
          height: s.wh,
          background: "linear-gradient(160deg, #f0f0f0 0%, #d1d5db 55%, #9ca3af 100%)",
          borderRadius: "3px 3px 2px 2px",
          border: "1.5px solid #d1d5db",
          filter: `drop-shadow(0 0 8px ${glowColor})`,
        }}
      />
    </div>
  );
}
