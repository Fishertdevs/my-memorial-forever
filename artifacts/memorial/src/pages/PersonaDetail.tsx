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

export default function PersonaDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [activeTab, setActiveTab] = useState<"recuerdos" | "velas">("recuerdos");
  const [velaSubmitted, setVelaSubmitted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: persona, isLoading } = useGetPersona(id, { query: { enabled: !!id, queryKey: getGetPersonaQueryKey(id) } });
  const { data: velasData } = useListVelas({ personaId: id, limit: 20 }, { query: { queryKey: getListVelasQueryKey({ personaId: id, limit: 20 }) } });
  const { data: recuerdosData } = useListRecuerdos({ personaId: id, limit: 20 }, { query: { queryKey: getListRecuerdosQueryKey({ personaId: id, limit: 20 }) } });

  const createVela = useCreateVela();
  const createRecuerdo = useCreateRecuerdo();
  const velaForm = useForm<VelaForm>({ defaultValues: { nombreAutor: "", mensaje: "" } });
  const recuerdoForm = useForm<RecuerdoForm>({ defaultValues: { nombreAutor: "", mensaje: "" } });

  const onSubmitVela = async (data: VelaForm) => {
    await createVela.mutateAsync(
      { data: { personaId: id, nombreRecordado: persona?.nombre ?? "", nombreAutor: data.nombreAutor, mensaje: data.mensaje } },
      { onSuccess: () => { setVelaSubmitted(true); velaForm.reset(); queryClient.invalidateQueries({ queryKey: getListVelasQueryKey({ personaId: id, limit: 20 }) }); toast({ title: "Vela encendida" }); } }
    );
  };

  const onSubmitRecuerdo = async (data: RecuerdoForm) => {
    await createRecuerdo.mutateAsync(
      { data: { personaId: id, nombreAutor: data.nombreAutor, persona: persona?.nombre, mensaje: data.mensaje } },
      { onSuccess: () => { recuerdoForm.reset(); queryClient.invalidateQueries({ queryKey: getListRecuerdosQueryKey({ personaId: id, limit: 20 }) }); toast({ title: "Recuerdo guardado" }); } }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white"><Navbar />
        <div className="pt-24 px-4 max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl bg-gray-100" />
          <Skeleton className="h-8 w-64 bg-gray-100" />
          <Skeleton className="h-24 w-full bg-gray-100" />
        </div>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="min-h-screen bg-white"><Navbar />
        <div className="pt-24 text-center px-4">
          <p className="text-black/50 text-xl mt-20">Persona no encontrada.</p>
          <Link href="/personas" className="mt-6 inline-block text-orange-500 hover:underline">Volver al memorial</Link>
        </div>
      </div>
    );
  }

  const inputClass = "w-full bg-white border-2 border-gray-100 focus:border-orange-400 rounded-xl px-4 py-3 text-black text-sm focus:outline-none transition-colors placeholder:text-black/25";

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <div className="pt-16">
        {/* Banner */}
        <div
          className="relative h-72 sm:h-96 overflow-hidden"
          style={{
            background: persona.fotoPrincipal
              ? undefined
              : "linear-gradient(135deg, #1a1a2e 0%, #16213e 45%, #0f3460 100%)",
          }}
        >
          {/* Background photo blur */}
          {persona.fotoPrincipal && (
            <>
              <img src={persona.fotoPrincipal} alt="" className="absolute inset-0 w-full h-full object-cover scale-110 blur-sm opacity-40" aria-hidden />
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 45%, rgba(15,52,96,0.85) 100%)" }} />
            </>
          )}
          {/* Ambient glow */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: 320, height: 320, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)",
              top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            }}
          />
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-4xl mx-auto px-6 pb-10 flex items-end gap-6 w-full">
              {/* Avatar */}
              <div
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl flex-shrink-0 overflow-hidden shadow-2xl"
                style={{ border: "3px solid rgba(249,115,22,0.5)" }}
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
                <p className="text-xs font-bold tracking-[0.28em] uppercase mb-2" style={{ color: "#f97316" }}>En tu memoria</p>
                <h1 className="font-serif text-3xl sm:text-4xl text-white mb-2 leading-tight">{persona.nombre}</h1>
                {(persona.fechaNacimiento || persona.fechaFallecimiento) && (
                  <p className="text-white/55 text-sm tracking-wide mb-2">
                    {formatDateEs(persona.fechaNacimiento)}
                    {persona.fechaNacimiento && persona.fechaFallecimiento && " — "}
                    {formatDateEs(persona.fechaFallecimiento)}
                  </p>
                )}
                <div className="flex gap-3 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                  <span>🕯 {persona.totalVelas} velitas</span>
                  <span>·</span>
                  <span>💬 {persona.totalRecuerdos} recuerdos</span>
                </div>
              </div>
              <div className="hidden sm:block mb-2">
                <CandleFlame size="md" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          {persona.biografia && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-10">
              <h2 className="font-serif text-lg text-black mb-3">Biografía</h2>
              <p className="text-black/60 leading-relaxed">{persona.biografia}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b-2 border-gray-100 mb-8">
            {(["recuerdos", "velas"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 -mb-0.5 ${activeTab === tab ? "border-orange-500 text-orange-500" : "border-transparent text-black/40 hover:text-black"}`}>
                {tab === "recuerdos" ? "Recuerdos" : "Velitas encendidas"}
              </button>
            ))}
          </div>

          {activeTab === "velas" && (
            <div className="space-y-5">
              {velaSubmitted ? (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-8 text-center">
                  <CandleFlame size="md" className="mx-auto mb-4" />
                  <h3 className="font-serif text-xl text-black mb-2">Tu velita está encendida</h3>
                  <p className="text-black/45 text-sm mb-4">Gracias por honrar su memoria.</p>
                  <button onClick={() => setVelaSubmitted(false)} className="text-orange-500 text-sm hover:underline font-semibold">Encender otra velita</button>
                </div>
              ) : (
                <div className="border-2 border-gray-100 rounded-2xl p-6">
                  <h3 className="font-serif text-xl text-black mb-5">Encender una velita</h3>
                  <form onSubmit={velaForm.handleSubmit(onSubmitVela)} className="space-y-4">
                    <input {...velaForm.register("nombreAutor", { required: true })} className={inputClass} placeholder="Tu nombre" />
                    <textarea {...velaForm.register("mensaje", { required: true })} rows={4} className={inputClass + " resize-none"} placeholder="Escribe un mensaje desde el corazón..." />
                    <button type="submit" disabled={createVela.isPending} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-sm">
                      {createVela.isPending ? "Encendiendo..." : "Encender velita"}
                    </button>
                  </form>
                </div>
              )}
              {velasData?.data.map((vela) => (
                <div key={vela.id} className="border border-gray-100 rounded-2xl p-5 flex gap-4 hover:border-orange-200 transition-colors">
                  <CandleFlame size="sm" className="flex-shrink-0 pt-0.5" />
                  <div>
                    <p className="text-black/75 text-sm leading-relaxed mb-2">{vela.mensaje}</p>
                    <div className="flex gap-3 text-xs text-black/35"><span>{vela.nombreAutor}</span><span>·</span><span>{vela.tiempoTranscurrido}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "recuerdos" && (
            <div className="space-y-5">
              <div className="border-2 border-gray-100 rounded-2xl p-6">
                <h3 className="font-serif text-xl text-black mb-5">Compartir un recuerdo</h3>
                <form onSubmit={recuerdoForm.handleSubmit(onSubmitRecuerdo)} className="space-y-4">
                  <input {...recuerdoForm.register("nombreAutor", { required: true })} className={inputClass} placeholder="Tu nombre" />
                  <textarea {...recuerdoForm.register("mensaje", { required: true })} rows={5} className={inputClass + " resize-none"} placeholder="Comparte un recuerdo especial..." />
                  <button type="submit" disabled={createRecuerdo.isPending} className="w-full py-3 bg-black hover:bg-black/80 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                    {createRecuerdo.isPending ? "Guardando..." : "Guardar recuerdo"}
                  </button>
                </form>
              </div>
              {recuerdosData?.data.length ? recuerdosData.data.map((r) => (
                <div key={r.id} className="border border-gray-100 rounded-2xl p-6 hover:border-orange-200 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center font-serif font-bold text-orange-500">{r.nombreAutor.charAt(0).toUpperCase()}</div>
                    <div>
                      <p className="text-sm font-semibold text-black">{r.nombreAutor}</p>
                      <p className="text-xs text-black/35">{r.tiempoTranscurrido}</p>
                    </div>
                  </div>
                  <p className="text-black/65 text-sm leading-relaxed">{r.mensaje}</p>
                </div>
              )) : (
                <div className="text-center py-12 text-black/35"><p>Sé el primero en compartir un recuerdo.</p></div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
