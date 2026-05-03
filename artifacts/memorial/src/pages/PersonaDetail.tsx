import { useParams, Link } from "wouter";
import { useState } from "react";

function formatDateEs(raw?: string | null): string {
  if (!raw) return "";
  try {
    const [y, m, d] = raw.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  } catch { return raw; }
}

import {
  useGetPersona, useListVelas, useListRecuerdos,
  getGetPersonaQueryKey, getListVelasQueryKey, getListRecuerdosQueryKey,
  useCreateVela, useCreateRecuerdo,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import CandleFlame from "@/components/CandleFlame";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

type VelaForm = { nombreAutor: string; mensaje: string };
type RecuerdoForm = { nombreAutor: string; mensaje: string };

const inputClass =
  "w-full bg-white border-2 border-gray-100 focus:border-orange-400 rounded-xl px-4 py-3 text-black text-sm focus:outline-none transition-colors placeholder:text-black/25";

export default function PersonaDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [activeTab, setActiveTab] = useState<"recuerdos" | "velas">("recuerdos");
  const [velaSubmitted, setVelaSubmitted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: persona, isLoading } = useGetPersona(id, {
    query: { enabled: !!id, queryKey: getGetPersonaQueryKey(id) },
  });
  const { data: velasData } = useListVelas(
    { personaId: id, limit: 20 },
    { query: { queryKey: getListVelasQueryKey({ personaId: id, limit: 20 }) } }
  );
  const { data: recuerdosData } = useListRecuerdos(
    { personaId: id, limit: 20 },
    { query: { queryKey: getListRecuerdosQueryKey({ personaId: id, limit: 20 }) } }
  );

  const createVela = useCreateVela();
  const createRecuerdo = useCreateRecuerdo();
  const velaForm = useForm<VelaForm>({ defaultValues: { nombreAutor: "", mensaje: "" } });
  const recuerdoForm = useForm<RecuerdoForm>({ defaultValues: { nombreAutor: "", mensaje: "" } });

  const onSubmitVela = async (data: VelaForm) => {
    await createVela.mutateAsync(
      { data: { personaId: id, nombreRecordado: persona?.nombre ?? "", nombreAutor: data.nombreAutor, mensaje: data.mensaje } },
      {
        onSuccess: () => {
          setVelaSubmitted(true);
          velaForm.reset();
          queryClient.invalidateQueries({ queryKey: getListVelasQueryKey({ personaId: id, limit: 20 }) });
          toast({ title: "Vela encendida" });
        },
      }
    );
  };

  const onSubmitRecuerdo = async (data: RecuerdoForm) => {
    await createRecuerdo.mutateAsync(
      { data: { personaId: id, nombreAutor: data.nombreAutor, persona: persona?.nombre, mensaje: data.mensaje } },
      {
        onSuccess: () => {
          recuerdoForm.reset();
          queryClient.invalidateQueries({ queryKey: getListRecuerdosQueryKey({ personaId: id, limit: 20 }) });
          toast({ title: "Recuerdo guardado" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 px-4 max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-72 w-full rounded-2xl bg-gray-100" />
          <Skeleton className="h-8 w-64 bg-gray-100" />
          <Skeleton className="h-24 w-full bg-gray-100" />
        </div>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 text-center px-4">
          <p className="text-black/50 text-xl mt-20">Persona no encontrada.</p>
          <Link href="/personas" className="mt-6 inline-block text-orange-500 hover:underline">
            Volver al memorial
          </Link>
        </div>
      </div>
    );
  }

  const velaCount = velasData?.total ?? persona.totalVelas ?? 0;
  const recuerdoCount = recuerdosData?.total ?? persona.totalRecuerdos ?? 0;

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <div className="pt-16">

        {/* ── Banner ── */}
        <div
          className="relative overflow-hidden"
          style={{
            minHeight: 320,
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 45%, #0f3460 100%)",
          }}
        >
          {persona.fotoPrincipal && (
            <>
              <img
                src={persona.fotoPrincipal}
                alt=""
                className="absolute inset-0 w-full h-full object-cover scale-110 blur-sm opacity-35"
                aria-hidden
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(135deg, rgba(26,26,46,0.95) 0%, rgba(22,33,62,0.88) 50%, rgba(15,52,96,0.85) 100%)" }}
              />
            </>
          )}

          {/* Orange glow */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: 360, height: 360, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)",
              top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            }}
          />

          {/* Back link */}
          <div className="absolute top-5 left-0 right-0 max-w-4xl mx-auto px-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-xs font-semibold transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M13 8H3M7 4l-4 4 4 4" /></svg>
              Inicio
            </Link>
          </div>

          <div className="absolute inset-0 flex items-end">
            <div className="max-w-4xl mx-auto px-6 pb-10 flex items-end gap-6 w-full">

              {/* Avatar */}
              <div
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl flex-shrink-0 overflow-hidden shadow-2xl"
                style={{ border: "3px solid rgba(249,115,22,0.55)" }}
              >
                {persona.fotoPrincipal ? (
                  <img src={persona.fotoPrincipal} alt={persona.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: "rgba(249,115,22,0.12)" }}>
                    <span className="font-serif text-4xl text-orange-400">{persona.nombre.charAt(0)}</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 pb-1">
                <p className="text-xs font-bold tracking-[0.28em] uppercase mb-2" style={{ color: "#f97316" }}>
                  En tu memoria
                </p>
                <h1 className="font-serif text-3xl sm:text-4xl text-white mb-2 leading-tight">
                  {persona.nombre}
                </h1>
                {(persona.fechaNacimiento || persona.fechaFallecimiento) && (
                  <p className="text-white/50 text-sm tracking-wide mb-3">
                    {formatDateEs(persona.fechaNacimiento)}
                    {persona.fechaNacimiento && persona.fechaFallecimiento && " — "}
                    {formatDateEs(persona.fechaFallecimiento)}
                  </p>
                )}
                <div className="flex gap-4 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                  <span className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 14c0 4-7 8-7 8S3 18 3 14a7 7 0 0114 0z"/><circle cx="10" cy="14" r="3"/></svg>
                    {velaCount} velitas
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                    {recuerdoCount} recuerdos
                  </span>
                </div>
              </div>

              <div className="hidden sm:block mb-2">
                <CandleFlame size="md" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

          {persona.biografia && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-10">
              <h2 className="font-serif text-lg text-black mb-3">Biografía</h2>
              <p className="text-black/60 leading-relaxed">{persona.biografia}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b-2 border-gray-100 mb-8">
            <button
              onClick={() => setActiveTab("recuerdos")}
              className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 -mb-0.5 flex items-center gap-2 ${
                activeTab === "recuerdos"
                  ? "border-orange-500 text-orange-500"
                  : "border-transparent text-black/40 hover:text-black"
              }`}
            >
              Recuerdos
              {recuerdoCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === "recuerdos" ? "bg-orange-100 text-orange-500" : "bg-gray-100 text-black/35"}`}>
                  {recuerdoCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("velas")}
              className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 -mb-0.5 flex items-center gap-2 ${
                activeTab === "velas"
                  ? "border-orange-500 text-orange-500"
                  : "border-transparent text-black/40 hover:text-black"
              }`}
            >
              Velitas encendidas
              {velaCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === "velas" ? "bg-orange-100 text-orange-500" : "bg-gray-100 text-black/35"}`}>
                  {velaCount}
                </span>
              )}
            </button>
          </div>

          {activeTab === "velas" && (
            <div className="text-center mb-10">
              <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#f97316" }}>
                Llama viva
              </p>
              <h2 className="font-serif text-3xl text-black">Velitas encendidas</h2>
              <p className="text-black/40 text-sm mt-2">
                {velaCount} personas han honrado su memoria
              </p>
            </div>
          )}

          {/* Velas tab */}
          {activeTab === "velas" && (
            <div className="space-y-5">
              {velaSubmitted ? (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-8 text-center">
                  <CandleFlame size="md" className="mx-auto mb-4" />
                  <h3 className="font-serif text-xl text-black mb-2">Tu velita está encendida</h3>
                  <p className="text-black/45 text-sm mb-4">Gracias por honrar su memoria.</p>
                  <button
                    onClick={() => setVelaSubmitted(false)}
                    className="text-orange-500 text-sm hover:underline font-semibold"
                  >
                    Encender otra velita
                  </button>
                </div>
              ) : (
                <div className="border-2 border-gray-100 rounded-2xl p-6">
                  <h3 className="font-serif text-xl text-black mb-5">Encender una velita</h3>
                  <form onSubmit={velaForm.handleSubmit(onSubmitVela)} className="space-y-4">
                    <input
                      {...velaForm.register("nombreAutor", { required: true })}
                      className={inputClass}
                      placeholder="Tu nombre"
                    />
                    <textarea
                      {...velaForm.register("mensaje", { required: true })}
                      rows={4}
                      className={inputClass + " resize-none"}
                      placeholder="Escribe un mensaje desde el corazón..."
                    />
                    <button
                      type="submit"
                      disabled={createVela.isPending}
                      className="w-full py-3 font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-sm text-white text-sm"
                      style={{ background: "#f97316" }}
                    >
                      {createVela.isPending ? "Encendiendo..." : "Encender velita"}
                    </button>
                  </form>
                </div>
              )}
              {velasData?.data.map((vela) => (
                <div
                  key={vela.id}
                  className="border border-gray-100 rounded-2xl p-5 flex gap-4 hover:border-orange-200 transition-colors"
                >
                  <CandleFlame size="sm" className="flex-shrink-0 pt-0.5" />
                  <div>
                    <p className="text-black/75 text-sm leading-relaxed mb-2">{vela.mensaje}</p>
                    <div className="flex gap-3 text-xs text-black/35">
                      <span>{vela.nombreAutor}</span>
                      <span>·</span>
                      <span>{vela.tiempoTranscurrido}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recuerdos tab */}
          {activeTab === "recuerdos" && (
            <div className="space-y-5">
              <div className="border-2 border-gray-100 rounded-2xl p-6">
                <h3 className="font-serif text-xl text-black mb-5">Compartir un recuerdo</h3>
                <form onSubmit={recuerdoForm.handleSubmit(onSubmitRecuerdo)} className="space-y-4">
                  <input
                    {...recuerdoForm.register("nombreAutor", { required: true })}
                    className={inputClass}
                    placeholder="Tu nombre"
                  />
                  <textarea
                    {...recuerdoForm.register("mensaje", { required: true })}
                    rows={5}
                    className={inputClass + " resize-none"}
                    placeholder="Comparte un recuerdo especial..."
                  />
                  <button
                    type="submit"
                    disabled={createRecuerdo.isPending}
                    className="w-full py-3 font-semibold rounded-xl transition-all disabled:opacity-50 text-white text-sm shadow-sm"
                    style={{ background: "#f97316", boxShadow: "0 4px 14px rgba(249,115,22,0.28)" }}
                  >
                    {createRecuerdo.isPending ? "Guardando..." : "Guardar recuerdo"}
                  </button>
                </form>
              </div>
              {recuerdosData?.data.length ? (
                recuerdosData.data.map((r) => (
                  <div
                    key={r.id}
                    className="border border-gray-100 rounded-2xl p-6 hover:border-orange-200 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center font-serif font-bold text-orange-500 text-sm">
                        {r.nombreAutor.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-black">{r.nombreAutor}</p>
                        <p className="text-xs text-black/35">{r.tiempoTranscurrido}</p>
                      </div>
                    </div>
                    <p className="text-black/65 text-sm leading-relaxed">{r.mensaje}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-black/30">
                  <svg className="mx-auto mb-4 opacity-30" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  <p>Sé el primero en compartir un recuerdo.</p>
                </div>
              )}
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
