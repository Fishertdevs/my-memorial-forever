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

const NOMBRES_HOMENAJE = [
  "Ana Soledad Lizarazo Calderón",
  "Pablo Esteban Aguirre Camargo",
  "Carlos Alberto Camargo Munevar",
];

function formatDateEs(raw?: string | null): string {
  if (!raw) return "";
  try {
    const [y, m, d] = raw.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  } catch { return raw; }
}

const FLAME_COLORS = [
  { id: "amber",   label: "Ámbar",     outer: "#f97316", inner: "#fbbf24", glow: "rgba(249,115,22,0.35)" },
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
      <div style={{ width: 1.5 * size, height: 3 * size, background: "#666", borderRadius: 1 }} />
      <div style={{ width: ww, height: wh, background: "linear-gradient(160deg,#f0f0f0 0%,#d1d5db 55%,#9ca3af 100%)", borderRadius: "2px 2px 1px 1px", border: "1px solid #d1d5db", filter: `drop-shadow(0 0 7px ${color.glow})` }} />
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
      setDone(true);
      onLit();
    } catch {
      toast({ title: "No se pudo encender la velita", variant: "destructive" });
    }
  };

  const reset = () => { setDone(false); setNombreAutor(""); setMensaje(""); setFlameColor(FLAME_COLORS[0]); setOpen(false); };

  return (
    <div className="mt-6">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl border-2 border-orange-200 text-orange-500 font-semibold text-sm hover:bg-orange-50 hover:border-orange-400 transition-all"
        >
          ENCIENDE TU VELITA
        </button>
      ) : done ? (
        <div className="border-2 border-orange-200 bg-orange-50 rounded-2xl p-6 text-center">
          <div className="flex justify-center mb-3">
            <MiniCandle color={flameColor} size={1.4} />
          </div>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              autoFocus
              value={nombreAutor}
              onChange={(e) => setNombreAutor(e.target.value)}
              className={inputClass}
              placeholder="Tu nombre"
              maxLength={80}
            />

            {/* Color picker */}
            <div>
              <p className="text-xs text-black/40 mb-2 font-medium">Color de la llama</p>
              <div className="grid grid-cols-6 gap-2">
                {FLAME_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setFlameColor(c)}
                    title={c.label}
                    className="flex flex-col items-center gap-1 py-2 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: flameColor.id === c.id ? c.outer : "#e5e7eb",
                      background: flameColor.id === c.id ? "#fff7ed" : "white",
                      boxShadow: flameColor.id === c.id ? `0 0 10px ${c.glow}` : "none",
                    }}
                  >
                    <div style={{ width: 12, height: 18, borderRadius: "50% 50% 30% 30%", background: `radial-gradient(ellipse at 50% 70%, ${c.inner} 0%, ${c.outer} 70%)`, filter: `drop-shadow(0 0 4px ${c.outer})` }} />
                    <span className="text-[9px] font-semibold leading-none" style={{ color: flameColor.id === c.id ? c.outer : "#9ca3af" }}>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

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

function VelaCard({
  vela,
  colorIdx,
  personaId,
}: {
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
    } finally {
      setSaving(false);
    }
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
      className="relative rounded-2xl overflow-hidden border-2 border-black bg-white transition-opacity"
      style={{ boxShadow: "0 4px 18px rgba(0,0,0,0.05)", opacity: deleting ? 0.4 : 1 }}
    >
      <div className="relative flex gap-4 p-5 items-start">
        <div className="flex-shrink-0 mt-1">
          <MiniCandle color={color} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="font-serif text-4xl leading-none text-black/20 select-none float-left mr-1 mt-1">"</span>
          {editing ? (
            <textarea
              autoFocus
              value={editMsg}
              onChange={(e) => setEditMsg(e.target.value)}
              rows={3}
              maxLength={400}
              className="w-full border-2 border-orange-300 rounded-xl px-3 py-2 text-sm text-black resize-none focus:outline-none focus:border-orange-500 mt-1"
            />
          ) : (
            <p className="font-serif text-black text-sm leading-relaxed italic pt-2">{currentMsg}</p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <div className="h-px flex-1 bg-black/10" />
            <span className="text-xs font-semibold tracking-wide text-black">{vela.nombreAutor}</span>
            <span className="text-black/20 text-xs">·</span>
            <span className="text-black/45 text-xs">{vela.tiempoTranscurrido}</span>
          </div>

          {/* Actions */}
          <div className="mt-3 flex items-center gap-3 pt-2 border-t border-gray-100">
            {editing ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="text-xs font-semibold text-orange-500 hover:text-orange-600 disabled:opacity-40 transition-colors"
                >
                  {saving ? "Guardando…" : "Guardar"}
                </button>
                <button
                  onClick={() => { setEditing(false); setEditMsg(currentMsg); }}
                  className="text-xs text-black/35 hover:text-black/60 transition-colors"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={toggleLike}
                  className="flex items-center gap-1 text-xs transition-colors"
                  style={{ color: liked ? "#e91e63" : "#9ca3af" }}
                  title={liked ? "Ya me gusta" : "Me gusta"}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span>{liked ? "Me gusta" : "Me gusta"}</span>
                </button>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1 text-xs text-black/35 hover:text-orange-500 transition-colors"
                  title="Editar"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Editar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1 text-xs text-black/35 hover:text-red-500 transition-colors ml-auto disabled:opacity-40"
                  title="Eliminar"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
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

function VelasSection({ personaId }: { personaId: number }) {
  const { data: velasData, isLoading } = useListVelas(
    { personaId, limit: 50 },
    { query: { queryKey: getListVelasQueryKey({ personaId, limit: 50 }) } }
  );

  if (isLoading) return null;
  if (!velasData || !Array.isArray(velasData.data) || velasData.data.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {velasData.data.slice(0, 20).map((vela, idx) => (
          <div key={vela.id} className="group relative flex flex-col items-center gap-1.5">
            <MiniCandle color={FLAME_COLORS[idx % FLAME_COLORS.length]} />
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

      <div className="grid grid-cols-1 gap-4">
        {velasData.data.map((vela, idx) => (
          <VelaCard key={vela.id} vela={vela} colorIdx={idx} personaId={personaId} />
        ))}
      </div>
    </div>
  );
}

export default function Personas() {
  const { data: personas, isLoading } = useListPersonas();
  const [, forceUpdate] = useState(0);

  const tituloSeccion = personas && personas.length === 1
    ? personas[0].nombre
    : NOMBRES_HOMENAJE.join(" · ");

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#f97316" }}>
              En conmemoración a
            </p>
            {isLoading ? (
              <Skeleton className="h-10 w-80 mx-auto bg-gray-100" />
            ) : (
              <h1 className="font-serif text-4xl text-black mb-4 leading-snug">{tituloSeccion}</h1>
            )}
            <p className="text-black/50 max-w-md mx-auto leading-relaxed">
              {personas && personas.length === 1
                ? "Su vida fue un regalo y su recuerdo, un tesoro que guardamos para siempre en el corazón. Aquí honramos su memoria con amor y gratitud."
                : "Cada vida es una historia que merece ser recordada. Aquí honramos a quienes amamos con todo el corazón."}
            </p>
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
