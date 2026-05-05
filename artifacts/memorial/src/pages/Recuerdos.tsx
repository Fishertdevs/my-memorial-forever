import { useState, useRef, useCallback } from "react";
import {
  useListPersonas,
  useListRecuerdos,
  useCreateRecuerdo,
  getListRecuerdosQueryKey,
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
const NOMBRES_CORTOS = "Ana Soledad, Pablo Esteban y Carlos Alberto";

const inputClass = "w-full border-2 focus:outline-none transition-colors text-sm px-4 py-3 rounded-xl";

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.65)" }}>
      <div className="rounded-2xl px-8 py-7 w-full max-w-xs shadow-2xl" style={{ background: "#2a1a0e", border: `1px solid ${GOLD}33` }}>
        <p className="font-serif text-base text-center mb-7 leading-relaxed" style={{ color: CREAM }}>{message}</p>
        <div className="h-px mb-6" style={{ background: `${GOLD}22` }} />
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={onConfirm}
            className="text-xs font-bold uppercase tracking-[0.28em] transition-opacity hover:opacity-70 bg-transparent border-0 outline-none"
            style={{ color: GOLD }}
          >— Aceptar</button>
          <button
            onClick={onCancel}
            className="text-xs uppercase tracking-[0.28em] transition-opacity hover:opacity-70 bg-transparent border-0 outline-none"
            style={{ color: `${CREAM}50` }}
          >Cancelar</button>
        </div>
      </div>
    </div>
  );
}

function Avatar({ name, size = 9 }: { name: string; size?: number }) {
  const initials = name.trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
  return (
    <div
      className="rounded-full flex-shrink-0 flex items-center justify-center font-semibold"
      style={{ width: size * 4, height: size * 4, fontSize: size * 1.6, background: `${GOLD}22`, color: GOLD }}
    >
      {initials || "?"}
    </div>
  );
}

function compressImage(file: File, maxSize = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width > height) { height = Math.round((height * maxSize) / width); width = maxSize; }
          else { width = Math.round((width * maxSize) / height); height = maxSize; }
        }
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

type RecuerdoItem = {
  id: number;
  nombreAutor: string;
  mensaje: string;
  fotoUrl?: string | null;
  tiempoTranscurrido: string;
};

function PostCard({ recuerdo, personaId }: { recuerdo: RecuerdoItem; personaId?: number }) {
  const likeKey = `like_recuerdo_${recuerdo.id}`;
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(() => localStorage.getItem(likeKey) === "1");
  const [editing, setEditing] = useState(false);
  const [editMsg, setEditMsg] = useState(recuerdo.mensaje);
  const [currentMsg, setCurrentMsg] = useState(recuerdo.mensaje);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isLong = currentMsg.length > 180;
  const displayText = isLong && !expanded ? currentMsg.slice(0, 180) + "…" : currentMsg;

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
      await fetch(`/api/recuerdos/${recuerdo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: editMsg.trim() }),
      });
      setCurrentMsg(editMsg.trim());
      setEditing(false);
      if (personaId !== undefined) {
        queryClient.invalidateQueries({ queryKey: getListRecuerdosQueryKey({ personaId, limit: 50 }) });
      }
    } catch {
      toast({ title: "No se pudo editar el recuerdo", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/recuerdos/${recuerdo.id}`, { method: "DELETE" });
      if (personaId !== undefined) {
        queryClient.invalidateQueries({ queryKey: getListRecuerdosQueryKey({ personaId, limit: 50 }) });
      }
    } catch {
      toast({ title: "No se pudo eliminar el recuerdo", variant: "destructive" });
      setDeleting(false);
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{ background: CARD_BG, border: `1px solid ${WARM_BORDER}`, opacity: deleting ? 0.4 : 1 }}
    >
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <Avatar name={recuerdo.nombreAutor} />
        <div className="min-w-0">
          <p className="font-semibold text-sm leading-tight truncate" style={{ color: ESPRESSO }}>{recuerdo.nombreAutor}</p>
          <p className="text-xs" style={{ color: `${ESPRESSO}45` }}>{recuerdo.tiempoTranscurrido}</p>
        </div>
      </div>

      {recuerdo.fotoUrl && (
        <div className="relative overflow-hidden">
          <img
            src={recuerdo.fotoUrl}
            alt={`Recuerdo de ${recuerdo.nombreAutor}`}
            className="w-full object-cover"
            style={{ maxHeight: 420 }}
          />
          <div className="absolute bottom-3 right-3">
            <CandleFlame size="sm" outerColor={GOLD} innerColor="#e8c060" glowColor="rgba(201,148,58,0.35)" />
          </div>
        </div>
      )}

      <div className={`px-5 py-4 ${!recuerdo.fotoUrl ? "flex items-start gap-3" : ""}`}>
        <div className="flex-1 min-w-0">
          {editing ? (
            <textarea
              autoFocus
              value={editMsg}
              onChange={(e) => setEditMsg(e.target.value)}
              rows={4}
              maxLength={600}
              className="w-full rounded-xl px-3 py-2 text-sm resize-none focus:outline-none"
              style={{ border: `2px solid ${GOLD}66`, background: CREAM, color: ESPRESSO }}
            />
          ) : (
            <p className="text-sm leading-relaxed" style={{ color: `${ESPRESSO}80` }}>
              {displayText}
              {isLong && (
                <button onClick={() => setExpanded(!expanded)} className="ml-1 font-semibold hover:underline text-xs" style={{ color: GOLD }}>
                  {expanded ? "ver menos" : "ver más"}
                </button>
              )}
            </p>
          )}
        </div>
        {!recuerdo.fotoUrl && (
          <div className="flex-shrink-0 self-center ml-2">
            <CandleFlame size="sm" outerColor={GOLD} innerColor="#e8c060" glowColor="rgba(201,148,58,0.35)" />
          </div>
        )}
      </div>

      <div className="px-5 pb-4 flex items-center gap-4 pt-3" style={{ borderTop: `1px solid ${ESPRESSO}08` }}>
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
            <button
              onClick={toggleLike}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors"
              style={{ color: liked ? "#e91e63" : `${ESPRESSO}30` }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs transition-colors" style={{ color: `${ESPRESSO}40` }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Editar
            </button>
            <button onClick={() => setConfirmOpen(true)} disabled={deleting} className="flex items-center gap-1.5 text-xs transition-colors ml-auto" style={{ color: `${ESPRESSO}30` }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
              </svg>
              Eliminar
            </button>
          </>
        )}
      </div>
      {confirmOpen && (
        <ConfirmDialog
          message="¿Eliminar este recuerdo?"
          onConfirm={() => { setConfirmOpen(false); handleDelete(); }}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}

function RecuerdosCarousel({ recuerdos, personaId }: { recuerdos: RecuerdoItem[]; personaId?: number }) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(recuerdos.length - 1, c + 1));

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  const safeCurrent = Math.min(current, recuerdos.length - 1);

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${safeCurrent * 100}%)` }}>
          {recuerdos.map((r) => (
            <div key={r.id} className="flex-shrink-0 w-full">
              <PostCard recuerdo={r} personaId={personaId} />
            </div>
          ))}
        </div>
      </div>

      {recuerdos.length > 1 && (
        <>
          {safeCurrent > 0 && (
            <button
              onClick={prev}
              className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 rounded-full items-center justify-center transition-all z-10"
              style={{ background: CARD_BG, border: `1px solid ${WARM_BORDER}`, boxShadow: "0 2px 8px rgba(26,15,7,0.12)", color: `${ESPRESSO}60` }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}
          {safeCurrent < recuerdos.length - 1 && (
            <button
              onClick={next}
              className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 rounded-full items-center justify-center transition-all z-10"
              style={{ background: CARD_BG, border: `1px solid ${WARM_BORDER}`, boxShadow: "0 2px 8px rgba(26,15,7,0.12)", color: `${ESPRESSO}60` }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          )}
          <div className="flex justify-center gap-2 mt-4">
            {recuerdos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="transition-all duration-300 rounded-full"
                style={{ width: i === safeCurrent ? 22 : 7, height: 7, background: i === safeCurrent ? GOLD : `${ESPRESSO}18` }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function NewPostForm({ personaId, personaNombre, onPosted }: { personaId: number; personaNombre: string; onPosted: () => void }) {
  const [open, setOpen] = useState(false);
  const [nombreAutor, setNombreAutor] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoData, setFotoData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const createRecuerdo = useCreateRecuerdo();
  const queryClient = useQueryClient();

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    try {
      const compressed = await compressImage(file);
      setFotoPreview(compressed);
      setFotoData(compressed);
    } catch {
      toast({ title: "No se pudo cargar la imagen", variant: "destructive" });
    }
  }, [toast]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const canSubmit = nombreAutor.trim().length > 0 && mensaje.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      await createRecuerdo.mutateAsync({
        data: { personaId, nombreAutor: nombreAutor.trim(), persona: personaNombre, mensaje: mensaje.trim(), fotoUrl: fotoData ?? null },
      });
      queryClient.invalidateQueries({ queryKey: getListRecuerdosQueryKey({ personaId, limit: 50 }) });
      setNombreAutor("");
      setMensaje("");
      setFotoPreview(null);
      setFotoData(null);
      setOpen(false);
      onPosted();
    } catch {
      toast({ title: "No se pudo publicar el recuerdo", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2.5 py-4 text-xs uppercase tracking-[0.28em] transition-opacity hover:opacity-70 bg-transparent border-0 outline-none"
          style={{ color: GOLD }}
        >
          — COMPARTIR RECUERDO
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="flex-1 text-center text-xs font-bold tracking-widest uppercase" style={{ color: GOLD }}>
              Compartir un recuerdo
            </p>
            <button onClick={() => setOpen(false)} style={{ color: `${CREAM}40` }} className="hover:opacity-80 transition-opacity">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 1l12 12M13 1L1 13"/></svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              autoFocus
              value={nombreAutor}
              onChange={(e) => setNombreAutor(e.target.value)}
              className={inputClass}
              style={{ background: "#2a1a0e", borderColor: `${GOLD}44`, color: CREAM }}
              placeholder="Tu nombre"
              maxLength={80}
            />

            <div
              className="relative rounded-xl overflow-hidden transition-colors cursor-pointer"
              style={{ minHeight: fotoPreview ? undefined : 72, border: `2px solid ${GOLD}33` }}
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
            >
              {fotoPreview ? (
                <div className="relative">
                  <img src={fotoPreview} alt="preview" className="w-full object-cover rounded-xl" style={{ maxHeight: 260 }} />
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFotoPreview(null); setFotoData(null); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: `${ESPRESSO}cc` }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2"><path d="M1 1l8 8M9 1L1 9"/></svg>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1.5 py-4" style={{ color: `${CREAM}35` }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                  <span className="text-xs">Añadir una foto <span style={{ color: `${CREAM}25` }}>(opcional)</span></span>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
            </div>

            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={3}
              className={inputClass + " resize-none"}
              style={{ background: "#2a1a0e", borderColor: `${GOLD}44`, color: CREAM }}
              placeholder="Comparte un recuerdo especial…"
              maxLength={600}
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs" style={{ color: `${CREAM}30` }}>{mensaje.length}/600</span>
              <button
                type="submit"
                disabled={!canSubmit || loading}
                className="text-xs uppercase tracking-[0.28em] transition-opacity hover:opacity-70 bg-transparent border-0 outline-none"
                style={{ color: GOLD, opacity: (!canSubmit || loading) ? 0.3 : 1 }}
              >
                {loading ? "Publicando…" : "— Publicar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function Recuerdos() {
  const { data: personas } = useListPersonas();
  const persona = personas?.[0];
  const personaId = persona?.id ?? 1;
  const personaNombre = persona?.nombre ?? NOMBRES_CORTOS;

  const { data: recuerdosData, isLoading: loadingRecuerdos } = useListRecuerdos(
    { personaId, limit: 50 },
    { query: { queryKey: getListRecuerdosQueryKey({ personaId, limit: 50 }) } }
  );
  const [, forceUpdate] = useState(0);
  const recuerdos = (recuerdosData?.data ?? []) as RecuerdoItem[];

  return (
    <div className="min-h-screen" style={{ background: ESPRESSO, color: CREAM }}>
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-xl mx-auto">

          <div className="text-center mb-10">
            <h1 className="font-serif text-4xl mb-3" style={{ color: CREAM }}>Un recuerdo es una alegría que aún perdura</h1>
            <p className="max-w-sm mx-auto text-sm leading-relaxed" style={{ color: `${CREAM}70` }}>
              Comparte una foto, una historia o un instante especial. Cada recuerdo es una luz que nunca se apaga.
            </p>
          </div>

          <NewPostForm personaId={personaId} personaNombre={personaNombre} onPosted={() => forceUpdate((n) => n + 1)} />

          {loadingRecuerdos ? (
            <div className="space-y-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl p-5 space-y-3" style={{ border: `1px solid ${GOLD}22` }}>
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" style={{ background: `${CREAM}10` }} />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3.5 w-32" style={{ background: `${CREAM}10` }} />
                      <Skeleton className="h-3 w-20" style={{ background: `${CREAM}10` }} />
                    </div>
                  </div>
                  <Skeleton className="h-48 w-full rounded-xl" style={{ background: `${CREAM}10` }} />
                  <Skeleton className="h-10 w-full" style={{ background: `${CREAM}10` }} />
                </div>
              ))}
            </div>
          ) : recuerdos.length > 0 ? (
            <RecuerdosCarousel recuerdos={recuerdos} personaId={personaId} />
          ) : (
            <div className="text-center py-20">
              <CandleFlame size="md" className="mx-auto mb-5 opacity-40" outerColor={GOLD} innerColor="#e8c060" glowColor="rgba(201,148,58,0.35)" />
              <p className="text-sm" style={{ color: `${CREAM}50` }}>Sé el primero en compartir un recuerdo.</p>
            </div>
          )}
        </div>
      </div>

      <footer className="py-10 px-4 text-center" style={{ borderTop: `2px solid ${GOLD}33`, background: "#0f0804" }}>
        <p className="font-serif text-sm tracking-widest uppercase mb-1" style={{ color: CREAM }}>En Tu Memoria</p>
        <p className="text-xs font-light" style={{ color: `${CREAM}45` }}>Siempre estarás en nuestros corazones</p>
      </footer>
    </div>
  );
}
