import { useState } from "react";
import {
  useListPersonas, useListVelas, useCreateVela,
  getListVelasQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import CandleFlame from "@/components/CandleFlame";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

function formatDateEs(raw?: string | null): string {
  if (!raw) return "";
  try {
    const [y, m, d] = raw.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  } catch { return raw; }
}

const FLAME_COLORS = [
  { outer: "#f97316", inner: "#fbbf24", glow: "rgba(249,115,22,0.35)" },
  { outer: "#2196f3", inner: "#7ec8e3", glow: "rgba(33,150,243,0.35)" },
  { outer: "#9c27b0", inner: "#ce93d8", glow: "rgba(156,39,176,0.35)" },
  { outer: "#e91e63", inner: "#f48fb1", glow: "rgba(233,30,99,0.35)" },
  { outer: "#00897b", inner: "#80cbc4", glow: "rgba(0,137,123,0.35)" },
  { outer: "#9ca3af", inner: "#e5e7eb", glow: "rgba(156,163,175,0.35)" },
];

function MiniCandle({ colorIdx }: { colorIdx: number }) {
  const c = FLAME_COLORS[colorIdx % FLAME_COLORS.length];
  const fw = 16, fh = 24, ww = 13, wh = 36;
  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative" style={{ width: fw, height: fh }}>
        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: fw, height: fh, background: `radial-gradient(ellipse at 50% 80%, ${c.outer} 0%, ${c.outer}77 48%, transparent 80%)`, borderRadius: "50% 50% 30% 30%", filter: "blur(1px)" }} />
        <div style={{ position: "absolute", bottom: 1, left: "50%", transform: "translateX(-50%)", width: fw * 0.52, height: fh * 0.62, background: `radial-gradient(ellipse at 50% 70%, ${c.inner} 0%, ${c.outer}bb 65%, transparent 100%)`, borderRadius: "50% 50% 30% 30%" }} />
        <div style={{ position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)", width: fw * 0.17, height: fh * 0.27, background: "rgba(255,255,240,0.95)", borderRadius: "50%", filter: "blur(0.3px)" }} />
      </div>
      <div style={{ width: 1.5, height: 3, background: "#666", borderRadius: 1 }} />
      <div style={{ width: ww, height: wh, background: "linear-gradient(160deg,#f0f0f0 0%,#d1d5db 55%,#9ca3af 100%)", borderRadius: "2px 2px 1px 1px", border: "1px solid #d1d5db", filter: `drop-shadow(0 0 7px ${c.glow})` }} />
    </div>
  );
}

const inputClass =
  "w-full bg-white border-2 border-gray-100 focus:border-orange-400 rounded-xl px-4 py-3 text-black text-sm focus:outline-none transition-colors placeholder:text-black/25";

function LightCandleForm({ personaId, personaNombre, onLit }: { personaId: number; personaNombre: string; onLit: () => void }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [nombreAutor, setNombreAutor] = useState("");
  const [mensaje, setMensaje] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createVela = useCreateVela();

  const canSubmit = nombreAutor.trim().length > 0 && mensaje.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await createVela.mutateAsync({
        data: { personaId, nombreRecordado: personaNombre, nombreAutor: nombreAutor.trim(), mensaje: mensaje.trim() },
      });
      queryClient.invalidateQueries({ queryKey: getListVelasQueryKey({ personaId, limit: 50 }) });
      setDone(true);
      onLit();
    } catch {
      toast({ title: "No se pudo encender la velita", variant: "destructive" });
    }
  };

  const reset = () => { setDone(false); setNombreAutor(""); setMensaje(""); setOpen(false); };

  return (
    <div className="mt-6">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl border-2 border-dashed border-orange-200 text-orange-500 font-semibold text-sm hover:bg-orange-50 hover:border-orange-400 transition-all"
        >
          <CandleFlame size="sm" />
          Enciende tu velita
        </button>
      ) : done ? (
        <div className="border-2 border-orange-200 bg-orange-50 rounded-2xl p-6 text-center">
          <CandleFlame size="md" className="mx-auto mb-3" />
          <p className="font-serif text-lg text-black mb-1">Tu velita está encendida</p>
          <p className="text-black/45 text-sm mb-4">Gracias por honrar su memoria.</p>
          <button onClick={reset} className="text-orange-500 text-sm font-semibold hover:underline">
            Encender otra velita
          </button>
        </div>
      ) : (
        <div className="border-2 border-orange-200 rounded-2xl p-5 bg-orange-50/30">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "#f97316" }}>
              Encender una velita
            </p>
            <button onClick={() => setOpen(false)} className="text-black/30 hover:text-black/60 transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 1l12 12M13 1L1 13" /></svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              autoFocus
              value={nombreAutor}
              onChange={(e) => setNombreAutor(e.target.value)}
              className={inputClass}
              placeholder="Tu nombre"
              maxLength={80}
            />
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={3}
              className={inputClass + " resize-none"}
              placeholder={`Escribe un mensaje para ${personaNombre}…`}
              maxLength={400}
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-black/25">{mensaje.length}/400</span>
              <button
                type="submit"
                disabled={!canSubmit || createVela.isPending}
                className="px-7 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-30 text-white"
                style={{ background: canSubmit ? "#f97316" : "#f3f4f6", color: canSubmit ? "white" : "#9ca3af" }}
              >
                {createVela.isPending ? "Encendiendo…" : "🕯 Encender"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function VelasSection({ personaId }: { personaId: number }) {
  const { data: velasData, isLoading } = useListVelas(
    { personaId, limit: 50 },
    { query: { queryKey: getListVelasQueryKey({ personaId, limit: 50 }) } }
  );

  if (isLoading) return null;
  if (!velasData || velasData.data.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-gray-100" />
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "#f97316" }}>
          {velasData.total} velita{velasData.total !== 1 ? "s" : ""} encendida{velasData.total !== 1 ? "s" : ""}
        </p>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      {/* Row of candle flames */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {velasData.data.slice(0, 20).map((vela, idx) => (
          <div key={vela.id} className="group relative flex flex-col items-center gap-1.5">
            <MiniCandle colorIdx={idx} />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="bg-black text-white rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl max-w-[200px]">
                <p className="font-semibold truncate">{vela.nombreAutor}</p>
                <p className="text-white/60 truncate">{vela.mensaje}</p>
              </div>
              <div className="w-2 h-2 bg-black rotate-45 mx-auto -mt-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Message cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {velasData.data.map((vela, idx) => (
          <div
            key={vela.id}
            className="flex gap-3 p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all"
          >
            <div className="flex-shrink-0 pt-0.5">
              <MiniCandle colorIdx={idx} />
            </div>
            <div className="min-w-0">
              <p className="text-black/70 text-sm leading-relaxed mb-2 italic">"{vela.mensaje}"</p>
              <div className="flex items-center gap-2 text-xs text-black/35">
                <span className="font-semibold text-black/50">{vela.nombreAutor}</span>
                <span>·</span>
                <span>{vela.tiempoTranscurrido}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Personas() {
  const { data: personas, isLoading } = useListPersonas();
  const [, forceUpdate] = useState(0);

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            {personas && personas.length === 1 ? (
              <>
                <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#f97316" }}>
                  En conmemoración a
                </p>
                <h1 className="font-serif text-4xl text-black mb-4">{personas[0].nombre}</h1>
                <p className="text-black/50 max-w-md mx-auto leading-relaxed">
                  Su vida fue un regalo y su recuerdo, un tesoro que guardamos para siempre en el corazón.
                  Aquí honramos su memoria con amor y gratitud.
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#f97316" }}>
                  Nuestros seres queridos
                </p>
                <h1 className="font-serif text-5xl text-black mb-4">En Memoria</h1>
                <p className="text-black/50 max-w-md mx-auto leading-relaxed">
                  Cada vida es una historia que merece ser recordada. Aquí honramos a quienes amamos.
                </p>
              </>
            )}
          </div>

          {isLoading ? (
            <div className="max-w-xl mx-auto space-y-3">
              <Skeleton className="h-14 w-full bg-gray-100 rounded-xl" />
              <Skeleton className="h-24 w-full bg-gray-100 rounded-xl" />
            </div>
          ) : personas && personas.length > 0 ? (
            <div className="max-w-xl mx-auto">
              <LightCandleForm
                personaId={personas[0].id}
                personaNombre={personas[0].nombre}
                onLit={() => forceUpdate((n) => n + 1)}
              />
              <VelasSection personaId={personas[0].id} />
            </div>
          ) : (
            <div className="text-center py-24">
              <CandleFlame size="lg" className="mx-auto mb-6 opacity-40" />
              <p className="text-black/40 text-lg">Aún no hay perfiles en el memorial.</p>
            </div>
          )}
        </div>
      </div>

      <footer className="py-8 px-4 text-center" style={{ background: "#ffffff", borderTop: "3px solid #f97316" }}>
        <p className="font-serif text-black/70 text-sm tracking-widest uppercase mb-1">En Tu Memoria</p>
        <p className="text-black/35 text-xs font-light">Siempre estarás en nuestros corazones</p>
      </footer>
    </div>
  );
}
