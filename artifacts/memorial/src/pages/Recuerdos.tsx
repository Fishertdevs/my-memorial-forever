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

const NOMBRES_HOMENAJE = [
  "Ana Soledad Lizarazo Calderón",
  "Pablo Esteban Aguirre Camargo",
  "Carlos Alberto Camargo Munevar",
];
const NOMBRES_CORTOS = "Ana Soledad, Pablo Esteban y Carlos Alberto";

const inputClass =
  "w-full bg-white border-2 border-gray-100 focus:border-orange-400 rounded-xl px-4 py-3 text-black text-sm focus:outline-none transition-colors placeholder:text-black/25";

function Avatar({ name, size = 9 }: { name: string; size?: number }) {
  const initials = name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div
      className="rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-orange-600 bg-orange-100"
      style={{ width: size * 4, height: size * 4, fontSize: size * 1.6 }}
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
        canvas.width = width;
        canvas.height = height;
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

function PostCard({
  recuerdo,
  personaId,
}: {
  recuerdo: {
    id: number;
    nombreAutor: string;
    mensaje: string;
    fotoUrl?: string | null;
    tiempoTranscurrido: string;
  };
  personaId?: number;
}) {
  const likeKey = `like_recuerdo_${recuerdo.id}`;
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(() => localStorage.getItem(likeKey) === "1");
  const [editing, setEditing] = useState(false);
  const [editMsg, setEditMsg] = useState(recuerdo.mensaje);
  const [currentMsg, setCurrentMsg] = useState(recuerdo.mensaje);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Eliminar este recuerdo?")) return;
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
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-orange-200 hover:shadow-md hover:shadow-orange-50 transition-all duration-300 fade-in-up"
      style={{ opacity: deleting ? 0.4 : 1 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <Avatar name={recuerdo.nombreAutor} />
        <div className="min-w-0">
          <p className="font-semibold text-sm text-black leading-tight truncate">
            {recuerdo.nombreAutor}
          </p>
          <p className="text-xs text-black/35">{recuerdo.tiempoTranscurrido}</p>
        </div>
        <div className="ml-auto flex-shrink-0">
          <CandleFlame size="sm" />
        </div>
      </div>

      {/* Photo */}
      {recuerdo.fotoUrl && (
        <div className="overflow-hidden" style={{ maxHeight: 420 }}>
          <img
            src={recuerdo.fotoUrl}
            alt={`Recuerdo de ${recuerdo.nombreAutor}`}
            className="w-full object-cover"
            style={{ maxHeight: 420 }}
          />
        </div>
      )}

      {/* Caption */}
      <div className="px-5 py-4">
        {editing ? (
          <textarea
            autoFocus
            value={editMsg}
            onChange={(e) => setEditMsg(e.target.value)}
            rows={4}
            maxLength={600}
            className="w-full border-2 border-orange-300 rounded-xl px-3 py-2 text-sm text-black resize-none focus:outline-none focus:border-orange-500"
          />
        ) : (
          <p className="text-black/70 text-sm leading-relaxed">
            {displayText}
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="ml-1 text-orange-500 font-semibold hover:underline text-xs"
              >
                {expanded ? "ver menos" : "ver más"}
              </button>
            )}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-4 flex items-center gap-4 border-t border-gray-50 pt-3">
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
              className="flex items-center gap-1.5 text-xs font-medium transition-colors"
              style={{ color: liked ? "#e91e63" : "#9ca3af" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Me gusta
            </button>
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-xs text-black/35 hover:text-orange-500 transition-colors"
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
              className="flex items-center gap-1.5 text-xs text-black/35 hover:text-red-500 transition-colors ml-auto disabled:opacity-40"
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
  );
}

function NewPostForm({
  personaId,
  personaNombre,
  onPosted,
}: {
  personaId: number;
  personaNombre: string;
  onPosted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
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
        data: {
          personaId,
          nombreAutor: nombreAutor.trim(),
          persona: personaNombre,
          mensaje: mensaje.trim(),
          fotoUrl: fotoData ?? null,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListRecuerdosQueryKey({ personaId, limit: 50 }) });
      setNombreAutor("");
      setMensaje("");
      setFotoPreview(null);
      setFotoData(null);
      setDone(true);
      onPosted();
    } catch {
      toast({ title: "No se pudo publicar el recuerdo", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setDone(false); setNombreAutor(""); setMensaje(""); setFotoPreview(null); setFotoData(null); setOpen(false); };

  return (
    <div className="mb-8">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl border-2 border-orange-200 text-orange-500 font-semibold text-sm hover:bg-orange-50 hover:border-orange-400 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          COMPARTIR RECUERDO
        </button>
      ) : done ? (
        <div className="border-2 border-orange-200 bg-orange-50 rounded-2xl p-6 text-center">
          <svg className="mx-auto mb-3 text-orange-400" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 6L9 17l-5-5"/></svg>
          <p className="font-serif text-lg text-black mb-1">Recuerdo publicado</p>
          <p className="text-black/45 text-sm mb-4">Gracias por compartir este momento.</p>
          <button onClick={reset} className="text-orange-500 text-sm font-semibold hover:underline">
            Compartir otro recuerdo
          </button>
        </div>
      ) : (
        <div className="border-2 border-orange-200 rounded-2xl p-5 bg-orange-50/30">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "#f97316" }}>
              Compartir un recuerdo
            </p>
            <button onClick={() => setOpen(false)} className="text-black/30 hover:text-black/60 transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 1l12 12M13 1L1 13"/></svg>
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

            <div
              className="relative rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-colors cursor-pointer overflow-hidden"
              style={{ minHeight: fotoPreview ? undefined : 72 }}
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
            >
              {fotoPreview ? (
                <div className="relative">
                  <img src={fotoPreview} alt="preview" className="w-full object-cover rounded-xl" style={{ maxHeight: 260 }} />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFotoPreview(null); setFotoData(null); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2"><path d="M1 1l8 8M9 1L1 9"/></svg>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1.5 py-4 text-black/30">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                  <span className="text-xs">Añadir una foto <span className="text-black/20">(opcional)</span></span>
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
              placeholder={`Comparte un recuerdo especial de ${personaNombre}…`}
              maxLength={600}
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-black/25">{mensaje.length}/600</span>
              <button
                type="submit"
                disabled={!canSubmit || loading}
                className="px-7 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-30 text-white"
                style={{ background: canSubmit ? "#f97316" : "#f3f4f6", color: canSubmit ? "white" : "#9ca3af" }}
              >
                {loading ? "Publicando…" : "Publicar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function Recuerdos() {
  const { data: personas, isLoading: loadingPersonas } = useListPersonas();
  const persona = personas?.[0];
  const personaNombre = persona?.nombre ?? NOMBRES_CORTOS;

  const { data: recuerdosData, isLoading: loadingRecuerdos } = useListRecuerdos(
    { personaId: persona?.id, limit: 50 },
    { query: { enabled: !!persona?.id, queryKey: getListRecuerdosQueryKey({ personaId: persona?.id, limit: 50 }) } }
  );
  const [, forceUpdate] = useState(0);

  const recuerdos = recuerdosData?.data ?? [];

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#f97316" }}>
              {persona ? `En memoria de ${persona.nombre}` : `En memoria de ${NOMBRES_CORTOS}`}
            </p>
            <h1 className="font-serif text-4xl text-black mb-3">Sus recuerdos</h1>
            <p className="text-black/45 max-w-sm mx-auto text-sm leading-relaxed">
              Comparte una foto, una historia o un momento que atesoras con ellos.
              Cada recuerdo mantiene su luz viva.
            </p>
          </div>

          {/* New post form */}
          {loadingPersonas ? (
            <div className="border-2 border-gray-100 rounded-2xl p-5 mb-8">
              <Skeleton className="h-10 w-full mb-3 bg-gray-100" />
              <Skeleton className="h-20 w-full bg-gray-100" />
            </div>
          ) : persona ? (
            <NewPostForm
              personaId={persona.id}
              personaNombre={personaNombre}
              onPosted={() => forceUpdate((n) => n + 1)}
            />
          ) : null}

          {/* Feed */}
          {loadingRecuerdos ? (
            <div className="space-y-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-100 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full bg-gray-100" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3.5 w-32 bg-gray-100" />
                      <Skeleton className="h-3 w-20 bg-gray-100" />
                    </div>
                  </div>
                  <Skeleton className="h-48 w-full bg-gray-100 rounded-xl" />
                  <Skeleton className="h-10 w-full bg-gray-100" />
                </div>
              ))}
            </div>
          ) : recuerdos.length > 0 ? (
            <div className="space-y-5">
              {recuerdos.map((r) => (
                <PostCard key={r.id} recuerdo={r} personaId={persona?.id} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <CandleFlame size="md" className="mx-auto mb-5 opacity-40" />
              <p className="text-black/35 text-sm">Sé el primero en compartir un recuerdo.</p>
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
