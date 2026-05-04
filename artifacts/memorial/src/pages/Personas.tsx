import { useState, useRef } from "react";
import {
  useListPersonas, useListVelas, useCreateVela,
  getListVelasQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import CandleFlame from "@/components/CandleFlame";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const ESPRESSO = "#1a0f07";
const GOLD = "#c9943a";
const CREAM = "#f5f0e8";
const CARD_BG = "#faf7f2";
const WARM_BORDER = "#ddd2bf";

const FLAME_COLORS = [
  { id: "amber",   label: "Ámbar",     outer: GOLD,      inner: "#e8c060", glow: "rgba(201,148,58,0.35)" },
  { id: "blue",    label: "Azul",      outer: "#2196f3", inner: "#7ec8e3", glow: "rgba(33,150,243,0.35)" },
  { id: "violet",  label: "Violeta",   outer: "#9c27b0", inner: "#ce93d8", glow: "rgba(156,39,176,0.35)" },
  { id: "rose",    label: "Rosa",      outer: "#e91e63", inner: "#f48fb1", glow: "rgba(233,30,99,0.28)" },
  { id: "emerald", label: "Esmeralda", outer: "#00897b", inner: "#80cbc4", glow: "rgba(0,137,123,0.28)" },
  { id: "white",   label: "Blanco",    outer: "#9ca3af", inner: "#e5e7eb", glow: "rgba(156,163,175,0.3)" },
];
type FlameColor = typeof FLAME_COLORS[0];

function MiniCandle({ color, size = 1 }: { color: FlameColor; size?: number }) {
  const fw = 16 * size, fh = 24 * size, ww = 13 * size, wh = 36 * size;
  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative" style={{ width: fw, height: fh }}>
        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: fw, height: fh, background: `radial-gradient(ellipse at 50% 80%, ${color.outer} 0%, ${color.outer}77 48%, transparent 80%)`, borderRadius: "50% 50% 30% 30%", filter: "blur(1px)" }} />
        <div style={{ position: "absolute", bottom: 1, left: "50%", transform: "translateX(-50%)", width: fw * 0.52, height: fh * 0.62, background: `radial-gradient(ellipse at 50% 70%, ${color.inner} 0%, ${color.outer}bb 65%, transparent 100%)`, borderRadius: "50% 50% 30% 30%" }} />
        <div style={{ position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)", width: fw * 0.17, height: fh * 0.27, background: "rgba(255,255,240,0.95)", borderRadius: "50%", filter: "blur(0.3px)" }} />
      </div>
      <div style={{ width: 1.5 * size, height: 3 * size, background: "#888", borderRadius: 1 }} />
      <div style={{ width: ww, height: wh, background: `linear-gradient(160deg,#f5f0e8 0%,#d4c8b0 55%,#b5a890 100%)`, borderRadius: "2px 2px 1px 1px", border: `1px solid ${WARM_BORDER}`, filter: `drop-shadow(0 0 7px ${color.glow})` }} />
    </div>
  );
}

const inputClass =
  `w-full border-2 focus:outline-none transition-colors placeholder:text-[${ESPRESSO}]/25 text-sm px-4 py-3 rounded-xl`;

function LightCandleForm({ personaId, personaNombre, onLit }: { personaId: number; personaNombre: string; onLit: () => void }) {
  const [open, setOpen] = useState(false);
  const [nombreAutor, setNombreAutor] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [flameColor, setFlameColor] = useState<FlameColor>(FLAME_COLORS[0]);
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
      setNombreAutor("");
      setMensaje("");
      setFlameColor(FLAME_COLORS[0]);
      setOpen(false);
      onLit();
    } catch {
      toast({ title: "No se pudo encender la velita", variant: "destructive" });
    }
  };

  return (
    <div className="mt-6">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-semibold text-sm transition-all"
          style={{ border: `2px solid ${GOLD}55`, color: GOLD, background: "transparent" }}
        >
          ENCIENDE TU VELITA
        </button>
      ) : (
        <div className="rounded-2xl p-5" style={{ border: `2px solid ${GOLD}44`, background: `${GOLD}08` }}>
          <div className="flex items-center justify-between mb-4">
            <p className="flex-1 text-center text-xs font-bold tracking-widest uppercase" style={{ color: GOLD }}>
              Encender una velita
            </p>
            <button onClick={() => setOpen(false)} style={{ color: `${ESPRESSO}40` }} className="hover:opacity-80 transition-opacity">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 1l12 12M13 1L1 13" /></svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              autoFocus
              value={nombreAutor}
              onChange={(e) => setNombreAutor(e.target.value)}
              className={inputClass}
              style={{ background: CARD_BG, borderColor: WARM_BORDER, color: ESPRESSO }}
              placeholder="Tu nombre"
              maxLength={80}
            />

            <div>
              <p className="text-xs mb-2 font-medium" style={{ color: `${ESPRESSO}55` }}>Color de la llama</p>
              <div className="grid grid-cols-6 gap-2">
                {FLAME_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setFlameColor(c)}
                    title={c.label}
                    className="flex flex-col items-center gap-1 py-2 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: flameColor.id === c.id ? c.outer : WARM_BORDER,
                      background: flameColor.id === c.id ? `${c.outer}12` : CARD_BG,
                      boxShadow: flameColor.id === c.id ? `0 0 10px ${c.glow}` : "none",
                    }}
                  >
                    <div style={{ width: 12, height: 18, borderRadius: "50% 50% 30% 30%", background: `radial-gradient(ellipse at 50% 70%, ${c.inner} 0%, ${c.outer} 70%)`, filter: `drop-shadow(0 0 4px ${c.outer})` }} />
                    <span className="text-[9px] font-semibold leading-none" style={{ color: flameColor.id === c.id ? c.outer : `${ESPRESSO}44` }}>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={3}
              className={inputClass + " resize-none"}
              style={{ background: CARD_BG, borderColor: WARM_BORDER, color: ESPRESSO }}
              placeholder="Escribe un mensaje especial…"
              maxLength={400}
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs" style={{ color: `${ESPRESSO}30` }}>{mensaje.length}/400</span>
              <button
                type="submit"
                disabled={!canSubmit || createVela.isPending}
                className="px-7 py-2.5 rounded-xl font-semibold text-sm transition-all border-0 outline-none"
                style={{ background: GOLD, color: CREAM, opacity: (!canSubmit || createVela.isPending) ? 0.4 : 1 }}
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

function VelaCard({ vela, colorIdx, personaId }: {
  vela: { id: number; nombreAutor: string; mensaje: string; tiempoTranscurrido: string };
  colorIdx: number;
  personaId: number;
}) {
  const color = FLAME_COLORS[colorIdx % FLAME_COLORS.length];
  const likeKey = `like_vela_${vela.id}`;
  const [liked, setLiked] = useState(() => localStorage.getItem(likeKey) === "1");
  const [editing, setEditing] = useState(false);
  const [editMsg, setEditMsg] = useState(vela.mensaje);
  const [currentMsg, setCurrentMsg] = useState(vela.mensaje);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleLike = () => {
    const next = !liked;
    setLiked(next);
    if (next) localStorage.setItem(likeKey, "1");
    else localStorage.removeItem(likeKey);
  };

  const handleSaveEdit = async () => {
    if (!editMsg.trim() || editMsg.trim() === currentMsg) { setEditing(false); return; }
    setSaving(true);
    try {
      await fetch(`/api/velas/${vela.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: editMsg.trim() }),
      });
      setCurrentMsg(editMsg.trim());
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: getListVelasQueryKey({ personaId, limit: 50 }) });
    } catch {
      toast({ title: "No se pudo editar", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Eliminar esta velita?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/velas/${vela.id}`, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: getListVelasQueryKey({ personaId, limit: 50 }) });
    } catch {
      toast({ title: "No se pudo eliminar", variant: "destructive" });
      setDeleting(false);
    }
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden transition-opacity"
      style={{ border: `2px solid ${ESPRESSO}22`, background: CARD_BG, boxShadow: "0 4px 18px rgba(26,15,7,0.08)", opacity: deleting ? 0.4 : 1 }}
    >
      <div className="relative flex gap-4 p-5 items-start">
        <div className="flex-shrink-0 mt-1">
          <MiniCandle color={color} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="font-serif text-4xl leading-none select-none float-left mr-1 mt-1" style={{ color: `${ESPRESSO}18` }}>"</span>
          {editing ? (
            <textarea
              autoFocus
              value={editMsg}
              onChange={(e) => setEditMsg(e.target.value)}
              rows={3}
              maxLength={400}
              className="w-full rounded-xl px-3 py-2 text-sm resize-none focus:outline-none mt-1"
              style={{ border: `2px solid ${GOLD}66`, background: CREAM, color: ESPRESSO }}
            />
          ) : (
            <p className="font-serif text-sm leading-relaxed italic pt-2" style={{ color: ESPRESSO }}>{currentMsg}</p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <div className="h-px flex-1" style={{ background: `${ESPRESSO}12` }} />
            <span className="text-xs font-semibold tracking-wide" style={{ color: ESPRESSO }}>{vela.nombreAutor}</span>
            <span className="text-xs" style={{ color: `${ESPRESSO}25` }}>·</span>
            <span className="text-xs" style={{ color: `${ESPRESSO}45` }}>{vela.tiempoTranscurrido}</span>
          </div>

          <div className="mt-3 flex items-center gap-3 pt-2" style={{ borderTop: `1px solid ${ESPRESSO}10` }}>
            {editing ? (
              <>
                <button onClick={handleSaveEdit} disabled={saving} className="text-xs font-semibold transition-colors" style={{ color: GOLD }}>
                  {saving ? "Guardando…" : "Guardar"}
                </button>
                <button onClick={() => { setEditing(false); setEditMsg(currentMsg); }} className="text-xs transition-colors" style={{ color: `${ESPRESSO}40` }}>
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <button onClick={toggleLike} className="flex items-center gap-1 text-xs transition-colors" style={{ color: liked ? "#e91e63" : `${ESPRESSO}30` }} title="Me gusta">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
                <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs transition-colors" style={{ color: `${ESPRESSO}35` }} title="Editar">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Editar
                </button>
                <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-1 text-xs transition-colors ml-auto" style={{ color: `${ESPRESSO}30` }} title="Eliminar">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                  </svg>
                  Eliminar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VelasCarousel({ velas, personaId }: { velas: { id: number; nombreAutor: string; mensaje: string; tiempoTranscurrido: string }[]; personaId: number }) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(velas.length - 1, c + 1));

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  return (
    <div className="relative mt-4">
      <div className="overflow-hidden rounded-2xl" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${current * 100}%)` }}>
          {velas.map((vela, idx) => (
            <div key={vela.id} className="flex-shrink-0 w-full">
              <VelaCard vela={vela} colorIdx={idx} personaId={personaId} />
            </div>
          ))}
        </div>
      </div>

      {velas.length > 1 && (
        <>
          {current > 0 && (
            <button
              onClick={prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10"
              style={{ background: CARD_BG, border: `1px solid ${WARM_BORDER}`, boxShadow: "0 2px 8px rgba(26,15,7,0.12)", color: `${ESPRESSO}60` }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}
          {current < velas.length - 1 && (
            <button
              onClick={next}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10"
              style={{ background: CARD_BG, border: `1px solid ${WARM_BORDER}`, boxShadow: "0 2px 8px rgba(26,15,7,0.12)", color: `${ESPRESSO}60` }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          )}
          <div className="flex justify-center gap-2 mt-4">
            {velas.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="transition-all duration-300 rounded-full"
                style={{ width: i === current ? 22 : 7, height: 7, background: i === current ? GOLD : `${ESPRESSO}20` }}
              />
            ))}
          </div>
        </>
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
  if (!velasData || !Array.isArray(velasData.data) || velasData.data.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {velasData.data.slice(0, 20).map((vela, idx) => (
          <div key={vela.id} className="group relative flex flex-col items-center gap-1.5">
            <MiniCandle color={FLAME_COLORS[idx % FLAME_COLORS.length]} />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl max-w-[200px]" style={{ background: ESPRESSO, color: CREAM }}>
                <p className="font-semibold truncate">{vela.nombreAutor}</p>
                <p className="truncate" style={{ color: `${CREAM}66` }}>{vela.mensaje}</p>
              </div>
              <div className="w-2 h-2 rotate-45 mx-auto -mt-1" style={{ background: ESPRESSO }} />
            </div>
          </div>
        ))}
      </div>

      <VelasCarousel velas={velasData.data} personaId={personaId} />
    </div>
  );
}

export default function Personas() {
  const { data: personas, isLoading } = useListPersonas();
  const [, forceUpdate] = useState(0);

  return (
    <div className="min-h-screen" style={{ background: CREAM, color: ESPRESSO }}>
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h1 className="font-serif text-4xl mb-3 leading-snug" style={{ color: ESPRESSO }}>
              Siempre estarán en nuestra memoria
            </h1>
            <p className="max-w-md mx-auto leading-relaxed text-sm" style={{ color: `${ESPRESSO}60` }}>
              Con esta velita te recordaremos siempre. Que su luz siga brillando en cada corazón que los amó.
            </p>
          </div>

          {isLoading ? (
            <div className="max-w-xl mx-auto space-y-3">
              <Skeleton className="h-14 w-full rounded-xl" style={{ background: `${ESPRESSO}10` }} />
              <Skeleton className="h-24 w-full rounded-xl" style={{ background: `${ESPRESSO}10` }} />
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
              <CandleFlame size="lg" className="mx-auto mb-6 opacity-40" outerColor={GOLD} innerColor="#e8c060" glowColor="rgba(201,148,58,0.28)" />
              <p className="text-lg" style={{ color: `${ESPRESSO}40` }}>Aún no hay perfiles en el memorial.</p>
            </div>
          )}
        </div>
      </div>

      <footer className="py-8 px-4 text-center" style={{ background: ESPRESSO, borderTop: `2px solid ${GOLD}44` }}>
        <p className="font-serif text-sm tracking-widest uppercase mb-1" style={{ color: `${CREAM}80` }}>En Tu Memoria</p>
        <p className="text-xs font-light" style={{ color: `${CREAM}40` }}>Siempre estarás en nuestros corazones</p>
      </footer>
    </div>
  );
}
