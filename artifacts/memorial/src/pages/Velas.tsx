import { useState } from "react";
import { useListVelas, useCreateVela, getListVelasQueryKey, useListPersonas } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

const FLAME_COLORS = [
  { id: "amber", label: "Ámbar", outer: "#ff8c00", inner: "#ffe066", core: "#fffbe0", glow: "rgba(255,140,0,0.45)" },
  { id: "blue", label: "Azul", outer: "#2196f3", inner: "#7ec8e3", core: "#e0f4ff", glow: "rgba(33,150,243,0.4)" },
  { id: "violet", label: "Violeta", outer: "#9c27b0", inner: "#ce93d8", core: "#f3e5f5", glow: "rgba(156,39,176,0.4)" },
  { id: "rose", label: "Rosa", outer: "#e91e63", inner: "#f48fb1", core: "#fce4ec", glow: "rgba(233,30,99,0.4)" },
  { id: "green", label: "Esmeralda", outer: "#00897b", inner: "#80cbc4", core: "#e0f2f1", glow: "rgba(0,137,123,0.4)" },
  { id: "white", label: "Blanco", outer: "#cfd8dc", inner: "#eceff1", core: "#ffffff", glow: "rgba(207,216,220,0.4)" },
];

type FlameColor = typeof FLAME_COLORS[0];

function AnimatedCandle({ color, size = 1 }: { color: FlameColor; size?: number }) {
  const fw = 28 * size, fh = 40 * size, ww = 22 * size, wh = 58 * size;
  return (
    <div className="flex flex-col items-center select-none">
      <div className="candle-flame relative" style={{ width: fw, height: fh }}>
        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: fw, height: fh, background: `radial-gradient(ellipse at 50% 80%, ${color.outer} 0%, ${color.outer}99 40%, transparent 80%)`, borderRadius: "50% 50% 30% 30%", filter: "blur(1.5px)" }} />
        <div style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: fw * 0.55, height: fh * 0.65, background: `radial-gradient(ellipse at 50% 70%, ${color.inner} 0%, ${color.outer}cc 60%, transparent 100%)`, borderRadius: "50% 50% 30% 30%" }} />
        <div style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", width: fw * 0.18, height: fh * 0.28, background: color.core, borderRadius: "50%", filter: "blur(0.5px)" }} />
      </div>
      <div style={{ width: 2, height: 6 * size, background: "#3a2010", borderRadius: 1 }} />
      <div className="candle-glow" style={{ width: ww, height: wh, background: "linear-gradient(135deg, #4a5568 0%, #2d3748 50%, #1a202c 100%)", borderRadius: `${3 * size}px ${3 * size}px ${2 * size}px ${2 * size}px`, border: "1px solid rgba(100,120,140,0.35)", boxShadow: `0 0 14px 5px ${color.glow}` }} />
    </div>
  );
}

const STEPS = ["¿A quién recuerdas?", "¿Cuál es tu nombre?", "Elige el color de la llama", "Tu mensaje"];

export default function Velas() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    nombreRecordado: "",
    personaId: undefined as number | undefined,
    nombreAutor: "",
    flameColor: FLAME_COLORS[0],
    mensaje: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: velasData } = useListVelas({ limit: 20 });
  const { data: personas } = useListPersonas();
  const createVela = useCreateVela();

  const canNext = () => {
    if (step === 0) return form.nombreRecordado.trim().length > 0;
    if (step === 1) return form.nombreAutor.trim().length > 0;
    if (step === 2) return true;
    if (step === 3) return form.mensaje.trim().length > 0;
    return false;
  };

  const handleSubmit = async () => {
    await createVela.mutateAsync(
      {
        data: {
          personaId: form.personaId ?? null,
          nombreRecordado: form.nombreRecordado,
          nombreAutor: form.nombreAutor,
          mensaje: form.mensaje,
        },
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          queryClient.invalidateQueries({ queryKey: getListVelasQueryKey({ limit: 20 }) });
        },
        onError: () => {
          toast({ title: "Error", description: "No se pudo encender la velita. Intenta de nuevo.", variant: "destructive" });
        },
      }
    );
  };

  const reset = () => {
    setStep(0);
    setSubmitted(false);
    setForm({ nombreRecordado: "", personaId: undefined, nombreAutor: "", flameColor: FLAME_COLORS[0], mensaje: "" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-20 min-h-screen flex flex-col">
        {/* Top: candle preview + form */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">

          {submitted ? (
            /* ── Success state ── */
            <div className="text-center max-w-sm mx-auto fade-in-up">
              <div className="flex justify-center mb-6">
                <AnimatedCandle color={form.flameColor} size={1.6} />
              </div>
              <h2 className="font-serif text-3xl text-[#e8c97e] mb-2">Tu velita está encendida</h2>
              <p className="text-[#8a9baa] text-sm mb-1">En memoria de</p>
              <p className="font-serif text-xl text-[#e8a84c] mb-4">{form.nombreRecordado}</p>
              <p className="text-[#8a9baa] text-sm leading-relaxed mb-8 italic">"{form.mensaje}"</p>
              <button
                onClick={reset}
                className="px-8 py-3 border border-[#2a3a4a] text-[#8a9baa] hover:text-[#e8c97e] hover:border-[#e8a84c]/40 rounded-xl text-sm transition-all duration-200"
              >
                Encender otra velita
              </button>
            </div>
          ) : (
            <div className="w-full max-w-md mx-auto">
              {/* Candle preview */}
              <div className="flex justify-center mb-8">
                <AnimatedCandle color={form.flameColor} size={1.4} />
              </div>

              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2 mb-8">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="transition-all duration-300"
                    style={{
                      width: i === step ? 24 : 8,
                      height: 8,
                      borderRadius: 4,
                      background: i < step ? "#e8a84c" : i === step ? "#e8a84c" : "#1e2d3d",
                    }}
                  />
                ))}
              </div>

              {/* Step label */}
              <p className="text-center text-[#8a9baa] text-xs font-medium tracking-widest uppercase mb-3">
                Paso {step + 1} de {STEPS.length}
              </p>
              <h2 className="font-serif text-center text-2xl text-[#e8c97e] mb-8">
                {STEPS[step]}
              </h2>

              {/* Step content */}
              <div className="step-appear" key={step}>
                {step === 0 && (
                  <div className="space-y-3">
                    {personas && personas.length > 0 && (
                      <div className="grid grid-cols-1 gap-2 mb-4">
                        {personas.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, personaId: p.id, nombreRecordado: p.nombre }))}
                            className="text-left px-4 py-3 rounded-xl border transition-all duration-200 text-sm"
                            style={{
                              background: form.personaId === p.id ? "#1e2d3d" : "transparent",
                              borderColor: form.personaId === p.id ? "#e8a84c" : "#2a3a4a",
                              color: form.personaId === p.id ? "#e8c97e" : "#8a9baa",
                            }}
                          >
                            <span className="font-semibold">{p.nombre}</span>
                            {p.fechaNacimiento && p.fechaFallecimiento && (
                              <span className="ml-2 opacity-60 text-xs">{p.fechaNacimiento} — {p.fechaFallecimiento}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="relative">
                      <input
                        autoFocus
                        value={form.nombreRecordado}
                        onChange={(e) => setForm((f) => ({ ...f, nombreRecordado: e.target.value, personaId: undefined }))}
                        placeholder="O escribe el nombre aquí..."
                        className="w-full bg-transparent border-b-2 border-[#2a3a4a] focus:border-[#e8a84c] px-0 py-3 text-lg text-[#e8c97e] placeholder:text-[#3a4a5a] focus:outline-none transition-colors duration-200"
                        onKeyDown={(e) => e.key === "Enter" && canNext() && setStep(1)}
                      />
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <input
                    autoFocus
                    value={form.nombreAutor}
                    onChange={(e) => setForm((f) => ({ ...f, nombreAutor: e.target.value }))}
                    placeholder="Tu nombre"
                    className="w-full bg-transparent border-b-2 border-[#2a3a4a] focus:border-[#e8a84c] px-0 py-3 text-lg text-[#e8c97e] placeholder:text-[#3a4a5a] focus:outline-none transition-colors duration-200"
                    onKeyDown={(e) => e.key === "Enter" && canNext() && setStep(2)}
                  />
                )}

                {step === 2 && (
                  <div className="grid grid-cols-3 gap-3">
                    {FLAME_COLORS.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, flameColor: color }))}
                        className="flex flex-col items-center gap-2 py-4 px-2 rounded-xl border transition-all duration-200"
                        style={{
                          background: form.flameColor.id === color.id ? "#1e2d3d" : "transparent",
                          borderColor: form.flameColor.id === color.id ? color.outer : "#2a3a4a",
                          boxShadow: form.flameColor.id === color.id ? `0 0 12px ${color.glow}` : "none",
                        }}
                      >
                        <div
                          className="w-6 h-8 rounded-full"
                          style={{
                            background: `radial-gradient(ellipse at 50% 70%, ${color.inner} 0%, ${color.outer} 60%)`,
                            filter: `drop-shadow(0 0 6px ${color.outer})`,
                          }}
                        />
                        <span className="text-xs font-medium" style={{ color: form.flameColor.id === color.id ? color.inner : "#8a9baa" }}>
                          {color.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {step === 3 && (
                  <textarea
                    autoFocus
                    value={form.mensaje}
                    onChange={(e) => setForm((f) => ({ ...f, mensaje: e.target.value }))}
                    placeholder="Escribe desde el corazón..."
                    rows={4}
                    className="w-full bg-transparent border-b-2 border-[#2a3a4a] focus:border-[#e8a84c] px-0 py-3 text-base text-[#e8c97e] placeholder:text-[#3a4a5a] focus:outline-none transition-colors duration-200 resize-none leading-relaxed"
                  />
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-10">
                {step > 0 ? (
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    className="text-sm text-[#4a5a6a] hover:text-[#8a9baa] transition-colors px-2 py-1"
                  >
                    ← Atrás
                  </button>
                ) : (
                  <div />
                )}

                {step < STEPS.length - 1 ? (
                  <button
                    onClick={() => canNext() && setStep((s) => s + 1)}
                    disabled={!canNext()}
                    className="px-8 py-3 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-30"
                    style={{
                      background: canNext() ? "#e8a84c" : "#1e2d3d",
                      color: canNext() ? "#0f1923" : "#4a5a6a",
                    }}
                  >
                    Continuar
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!canNext() || createVela.isPending}
                    className="px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-30"
                    style={{
                      background: canNext() ? "#e8a84c" : "#1e2d3d",
                      color: canNext() ? "#0f1923" : "#4a5a6a",
                    }}
                  >
                    {createVela.isPending ? "Encendiendo..." : "Encender velita 🕯"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom: recent candles */}
        {velasData && velasData.data.length > 0 && (
          <div className="border-t border-[#1e2d3d] px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <p className="text-center text-xs font-medium tracking-widest uppercase text-[#4a5a6a] mb-6">
                {velasData.total} velitas encendidas
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {velasData.data.slice(0, 12).map((vela, i) => (
                  <div
                    key={vela.id}
                    className="group relative"
                    title={`${vela.nombreRecordado} — ${vela.nombreAutor}`}
                  >
                    <div
                      className="fade-in-up"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <AnimatedCandle
                        color={FLAME_COLORS[vela.id % FLAME_COLORS.length]}
                        size={0.65}
                      />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      <div className="bg-[#1e2d3d] border border-[#2a3a4a] rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                        <p className="text-[#e8c97e] font-medium">{vela.nombreRecordado}</p>
                        <p className="text-[#4a5a6a]">por {vela.nombreAutor}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
