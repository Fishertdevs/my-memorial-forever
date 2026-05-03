import { useListPersonas, useListVelas, getListVelasQueryKey } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import CandleFlame from "@/components/CandleFlame";
import { Skeleton } from "@/components/ui/skeleton";

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
                <h1 className="font-serif text-5xl text-black mb-4">{personas[0].nombre}</h1>
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
            <div className="grid grid-cols-1 gap-8 justify-items-center">
              {[1].map((i) => (
                <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
                  <Skeleton className="h-52 w-full bg-gray-100" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-5 w-3/4 bg-gray-100" />
                    <Skeleton className="h-4 w-1/2 bg-gray-100" />
                    <Skeleton className="h-14 w-full bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : personas && personas.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 justify-items-center">
              <div className="group block w-full max-w-xl">
                <div className="border border-gray-100 rounded-2xl overflow-hidden hover:border-orange-200 hover:shadow-lg hover:shadow-orange-50 transition-all duration-300 fade-in-up">
                  <div className="relative h-56 bg-gray-50 flex items-center justify-center overflow-hidden">
                    {personas[0].fotoPrincipal ? (
                      <img
                        src={personas[0].fotoPrincipal}
                        alt={personas[0].nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: "linear-gradient(155deg, #1c1c2e 0%, #16213e 55%, #0f3460 100%)" }}
                      >
                        <span className="font-serif text-4xl text-orange-300/80">
                          {personas[0].nombre.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 right-3">
                      <CandleFlame size="sm" />
                    </div>
                  </div>
                  <div className="p-6 bg-white">
                    <h2 className="font-serif text-xl text-black mb-1">
                      {personas[0].nombre}
                    </h2>
                    {(personas[0].fechaNacimiento || personas[0].fechaFallecimiento) && (
                      <p className="text-xs mb-3 tracking-wide font-medium" style={{ color: "#f97316" }}>
                        {formatDateEs(personas[0].fechaNacimiento)}
                        {personas[0].fechaNacimiento && personas[0].fechaFallecimiento && " — "}
                        {formatDateEs(personas[0].fechaFallecimiento)}
                      </p>
                    )}
                    {personas[0].biografia && (
                      <p className="text-black/50 text-sm leading-relaxed line-clamp-3 mb-4">
                        {personas[0].biografia}
                      </p>
                    )}
                  </div>
                </div>

                {/* Velas section */}
                <VelasSection personaId={personas[0].id} />
              </div>
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
