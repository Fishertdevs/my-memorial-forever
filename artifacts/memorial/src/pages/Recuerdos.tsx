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
}: {
  recuerdo: {
    id: number;
    nombreAutor: string;
    mensaje: string;
    fotoUrl?: string | null;
    tiempoTranscurrido: string;
  };
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = recuerdo.mensaje.length > 180;
  const displayText =
    isLong && !expanded ? recuerdo.mensaje.slice(0, 180) + "…" : recuerdo.mensaje;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-orange-200 hover:shadow-md hover:shadow-orange-50 transition-all duration-300 fade-in-up">
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
      toast({ title: "Recuerdo publicado ✓" });
      onPosted();
    } catch {
      toast({ title: "No se pudo publicar el recuerdo", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 mb-8 hover:border-orange-200 transition-colors">
      <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "#f97316" }}>
        Compartir un recuerdo
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={nombreAutor}
          onChange={(e) => setNombreAutor(e.target.value)}
          className={inputClass}
          placeholder="Tu nombre"
          maxLength={80}
        />

        {/* Photo drop zone */}
        <div
          className="relative rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-300 transition-colors cursor-pointer overflow-hidden"
          style={{ minHeight: fotoPreview ? undefined : 80 }}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
        >
          {fotoPreview ? (
            <div className="relative">
              <img src={fotoPreview} alt="preview" className="w-full object-cover rounded-xl" style={{ maxHeight: 280 }} />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFotoPreview(null); setFotoData(null); }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2"><path d="M1 1l8 8M9 1L1 9" /></svg>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5 py-5 text-black/30">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
              <span className="text-xs">Añadir una foto <span className="text-black/20">(opcional)</span></span>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
          />
        </div>

        <textarea
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          rows={3}
          className={inputClass + " resize-none"}
          placeholder={`Comparte un recuerdo especial de ${personaNombre}…`}
          maxLength={600}
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-black/25">{mensaje.length}/600</span>
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="px-7 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-30 text-white"
            style={{ background: canSubmit ? "#f97316" : "#f3f4f6", color: canSubmit ? "white" : "#9ca3af", boxShadow: canSubmit ? "0 4px 14px rgba(249,115,22,0.28)" : "none" }}
          >
            {loading ? "Publicando…" : "Publicar recuerdo"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Recuerdos() {
  const { data: personas, isLoading: loadingPersonas } = useListPersonas();
  const persona = personas?.[0];

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
              {persona ? `En memoria de ${persona.nombre}` : "Recuerdos"}
            </p>
            <h1 className="font-serif text-4xl text-black mb-3">Sus recuerdos</h1>
            <p className="text-black/45 max-w-sm mx-auto text-sm leading-relaxed">
              Comparte una foto, una historia o un momento que atesoras con él.
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
              personaNombre={persona.nombre}
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
                <PostCard key={r.id} recuerdo={r} />
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
