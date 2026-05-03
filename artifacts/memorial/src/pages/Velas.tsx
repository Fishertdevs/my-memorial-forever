import { useState } from "react";
import { useListVelas, useCreateVela, getListVelasQueryKey, useListPersonas } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

const FLAME_COLORS = [
  { id: "amber",   label: "Ámbar",     outer: "#f97316", inner: "#fbbf24", glow: "rgba(249,115,22,0.3)" },
  { id: "blue",    label: "Azul",      outer: "#2196f3", inner: "#7ec8e3", glow: "rgba(33,150,243,0.3)" },
  { id: "violet",  label: "Violeta",   outer: "#9c27b0", inner: "#ce93d8", glow: "rgba(156,39,176,0.3)" },
  { id: "rose",    label: "Rosa",      outer: "#e91e63", inner: "#f48fb1", glow: "rgba(233,30,99,0.28)" },
  { id: "emerald", label: "Esmeralda", outer: "#00897b", inner: "#80cbc4", glow: "rgba(0,137,123,0.28)" },
  { id: "white",   label: "Blanco",    outer: "#9ca3af", inner: "#e5e7eb", glow: "rgba(156,163,175,0.3)" },
];

type FlameColor = typeof FLAME_COLORS[0];

function AnimatedCandle({ color, size = 1 }: { color: FlameColor; size?: number }) {
  const fw = 26 * size, fh = 38 * size, ww = 20 * size, wh = 56 * size;
  return (
    <div className="flex flex-col items-center select-none">
      <div className="candle-flame relative" style={{ width: fw, height: fh }}>
        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: fw, height: fh, background: `radial-gradient(ellipse at 50% 80%, ${color.outer} 0%, ${color.outer}77 48%, transparent 80%)`, borderRadius: "50% 50% 30% 30%", filter: "blur(1.5px)" }} />
        <div style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: fw * 0.52, height: fh * 0.62, background: `radial-gradient(ellipse at 50% 70%, ${color.inner} 0%, ${color.outer}bb 65%, transparent 100%)`, borderRadius: "50% 50% 30% 30%" }} />
        <div style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", width: fw * 0.17, height: fh * 0.27, background: "rgba(255,255,240,0.95)", borderRadius: "50%", filter: "blur(0.4px)" }} />
      </div>
      <div style={{ width: 2, height: 5 * size, background: "#555", borderRadius: 1 }} />
      <div style={{ width: ww, height: wh, background: "linear-gradient(160deg, #f0f0f0 0%, #d1d5db 55%, #9ca3af 100%)", borderRadius: "3px 3px 2px 2px", border: "1.5px solid #d1d5db", filter: `drop-shadow(0 0 10px ${color.glow})` }} />
    </div>
  );
}

const STEPS = ["¿A quién recuerdas?", "¿Cuál es tu nombre?", "Color de la llama", "Tu mensaje"];

export default function Velas() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ nombreRecordado: "", personaId: undefined as number | undefined, nombreAutor: "", flameColor: FLAME_COLORS[0], mensaje: "" });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: velasData } = useListVelas({ limit: 20 });
  const { data: personas } = useListPersonas();
  const createVela = useCreateVela();

  const canNext = () => {
    if (step === 0) return form.nombreRecordado.trim().length > 0;
    if (step === 1) return form.nombreAutor.trim().length > 0;
    if (step === 2) return true;
    return form.mensaje.trim().length > 0;
  };

  const handleSubmit = async () => {
    await createVela.mutateAsync(
      { data: { personaId: form.personaId ?? null, nombreRecordado: form.nombreRecordado, nombreAutor: form.nombreAutor, mensaje: form.mensaje } },
      {
        onSuccess: () => { setSubmitted(true); queryClient.invalidateQueries({ queryKey: getListVelasQueryKey({ limit: 20 }) }); },
        onError: () => toast({ title: "Error", description: "No se pudo encender la velita.", variant: "destructive" }),
      }
    );
  };

  const reset = () => { setStep(0); setSubmitted(false); setForm({ nombreRecordado: "", personaId: undefined, nombreAutor: "", flameColor: FLAME_COLORS[0], mensaje: "" }); };

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <div className="pt-20 min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          {submitted ? (
            <div className="text-center max-w-sm mx-auto fade-in-up">
              <div className="flex justify-center mb-6">
                <AnimatedCandle color={form.flameColor} size={1.5} />
              </div>
              <h2 className="font-serif text-3xl text-black mb-2">Tu velita está encendida</h2>
              <p className="text-black/40 text-sm mb-1">En memoria de</p>
              <p className="font-serif text-xl text-orange-500 mb-4">{form.nombreRecordado}</p>
              <p className="text-black/50 text-sm leading-relaxed mb-8 italic">"{form.mensaje}"</p>
              <button onClick={reset} className="px-8 py-3 border border-gray-200 text-black/50 hover:text-orange-500 hover:border-orange-300 rounded-xl text-sm transition-all">
                Encender otra velita
              </button>
            </div>
          ) : (
            <div className="w-full max-w-md mx-auto">
              <div className="flex justify-center mb-8">
                <AnimatedCandle color={form.flameColor} size={1.3} />
              </div>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mb-7">
                {STEPS.map((_, i) => (
                  <div key={i} className="transition-all duration-300 rounded-full" style={{ width: i === step ? 22 : 7, height: 7, background: i <= step ? "#f97316" : "#e5e7eb" }} />
                ))}
              </div>

              <p className="text-center text-xs font-bold tracking-widest uppercase text-orange-500 mb-2">Paso {step + 1} de {STEPS.length}</p>
              <h2 className="font-serif text-center text-2xl text-black mb-8">{STEPS[step]}</h2>

              <div className="step-appear" key={step}>
                {step === 0 && (
                  <div className="space-y-2">
                    {personas && personas.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {personas.map((p) => (
                          <button key={p.id} type="button"
                            onClick={() => setForm((f) => ({ ...f, personaId: p.id, nombreRecordado: p.nombre }))}
                            className="w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium"
                            style={{ borderColor: form.personaId === p.id ? "#f97316" : "#e5e7eb", background: form.personaId === p.id ? "#fff7ed" : "white", color: form.personaId === p.id ? "#ea580c" : "#111" }}
                          >
                            {p.nombre}
                            {(p.fechaNacimiento || p.fechaFallecimiento) && (
                            <span className="ml-2 text-xs opacity-50">
                              {p.fechaNacimiento ? new Date(p.fechaNacimiento + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : ""}
                              {p.fechaNacimiento && p.fechaFallecimiento ? " — " : ""}
                              {p.fechaFallecimiento ? new Date(p.fechaFallecimiento + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : ""}
                            </span>
                          )}
                          </button>
                        ))}
                      </div>
                    )}
                    <input autoFocus value={form.nombreRecordado}
                      onChange={(e) => setForm((f) => ({ ...f, nombreRecordado: e.target.value, personaId: undefined }))}
                      placeholder="O escribe el nombre aquí..."
                      className="w-full bg-transparent border-b-2 border-gray-200 focus:border-orange-500 px-0 py-3 text-lg text-black placeholder:text-black/25 focus:outline-none transition-colors"
                      onKeyDown={(e) => e.key === "Enter" && canNext() && setStep(1)}
                    />
                  </div>
                )}
                {step === 1 && (
                  <input autoFocus value={form.nombreAutor} onChange={(e) => setForm((f) => ({ ...f, nombreAutor: e.target.value }))}
                    placeholder="Tu nombre"
                    className="w-full bg-transparent border-b-2 border-gray-200 focus:border-orange-500 px-0 py-3 text-lg text-black placeholder:text-black/25 focus:outline-none transition-colors"
                    onKeyDown={(e) => e.key === "Enter" && canNext() && setStep(2)}
                  />
                )}
                {step === 2 && (
                  <div className="grid grid-cols-3 gap-3">
                    {FLAME_COLORS.map((color) => (
                      <button key={color.id} type="button" onClick={() => setForm((f) => ({ ...f, flameColor: color }))}
                        className="flex flex-col items-center gap-2 py-4 px-2 rounded-xl border-2 transition-all duration-200"
                        style={{ borderColor: form.flameColor.id === color.id ? color.outer : "#e5e7eb", background: form.flameColor.id === color.id ? "#fff7ed" : "white", boxShadow: form.flameColor.id === color.id ? `0 0 12px ${color.glow}` : "none" }}
                      >
                        <div className="w-5 h-7 rounded-full" style={{ background: `radial-gradient(ellipse at 50% 70%, ${color.inner} 0%, ${color.outer} 70%)`, filter: `drop-shadow(0 0 5px ${color.outer})` }} />
                        <span className="text-xs font-semibold" style={{ color: form.flameColor.id === color.id ? color.outer : "#9ca3af" }}>{color.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                {step === 3 && (
                  <textarea autoFocus value={form.mensaje} onChange={(e) => setForm((f) => ({ ...f, mensaje: e.target.value }))}
                    placeholder="Escribe desde el corazón..."
                    rows={4}
                    className="w-full bg-transparent border-b-2 border-gray-200 focus:border-orange-500 px-0 py-3 text-base text-black placeholder:text-black/25 focus:outline-none transition-colors resize-none leading-relaxed"
                  />
                )}
              </div>

              <div className="flex items-center justify-between mt-10">
                {step > 0 ? (
                  <button onClick={() => setStep((s) => s - 1)} className="text-sm text-black/30 hover:text-black/60 transition-colors px-1">← Atrás</button>
                ) : <div />}
                {step < STEPS.length - 1 ? (
                  <button onClick={() => canNext() && setStep((s) => s + 1)} disabled={!canNext()}
                    className="px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-30"
                    style={{ background: canNext() ? "#f97316" : "#f3f4f6", color: canNext() ? "white" : "#9ca3af" }}
                  >Continuar</button>
                ) : (
                  <button onClick={handleSubmit} disabled={!canNext() || createVela.isPending}
                    className="px-8 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-30"
                    style={{ background: canNext() ? "#f97316" : "#f3f4f6", color: canNext() ? "white" : "#9ca3af" }}
                  >{createVela.isPending ? "Encendiendo..." : "Encender velita 🕯"}</button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Candles list at bottom */}
        {velasData && velasData.data.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-10 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <p className="text-center text-xs font-bold tracking-widest uppercase text-orange-500 mb-8">{velasData.total} velitas encendidas</p>
              <div className="flex flex-wrap justify-center gap-6">
                {velasData.data.slice(0, 12).map((vela, i) => (
                  <div key={vela.id} className="group relative" title={`${vela.nombreRecordado} — ${vela.nombreAutor}`}>
                    <AnimatedCandle color={FLAME_COLORS[vela.id % FLAME_COLORS.length]} size={0.65} />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="bg-black text-white rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                        <p className="font-semibold">{vela.nombreRecordado}</p>
                        <p className="text-white/60">por {vela.nombreAutor}</p>
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
