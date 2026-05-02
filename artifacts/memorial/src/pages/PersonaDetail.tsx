import { useParams, Link } from "wouter";
import { useState } from "react";
import {
  useGetPersona,
  useListVelas,
  useListRecuerdos,
  getGetPersonaQueryKey,
  getListVelasQueryKey,
  getListRecuerdosQueryKey,
  useCreateVela,
  useCreateRecuerdo,
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
          toast({ title: "Vela encendida", description: "Tu vela brilla en su memoria." });
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
          toast({ title: "Recuerdo guardado", description: "Gracias por compartir este recuerdo." });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 px-4 max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-64 w-full rounded-xl bg-amber-900/20" />
          <Skeleton className="h-8 w-64 bg-amber-900/20" />
          <Skeleton className="h-24 w-full bg-amber-900/20" />
        </div>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-24 text-center px-4">
          <p className="text-amber-200/60 text-xl mt-20">Persona no encontrada.</p>
          <Link href="/personas" className="mt-6 inline-block text-amber-400 hover:underline">Volver al memorial</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-20">
        {/* Hero banner */}
        <div className="relative h-64 sm:h-80 bg-gradient-to-b from-amber-900/40 via-stone-900/80 to-background flex items-end">
          <div
            className="absolute inset-0 opacity-20"
            style={{ background: "radial-gradient(ellipse at center, hsl(35,75%,50%) 0%, transparent 70%)" }}
          />
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-8 flex items-end gap-6 w-full">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-amber-800/40 border-2 border-amber-600/30 flex items-center justify-center font-serif text-5xl text-amber-300 shadow-xl flex-shrink-0">
              {persona.fotoPrincipal ? (
                <img src={persona.fotoPrincipal} alt={persona.nombre} className="w-full h-full object-cover rounded-full" />
              ) : (
                persona.nombre.charAt(0)
              )}
            </div>
            <div className="flex-1">
              <h1 className="font-serif text-3xl sm:text-4xl text-amber-100 mb-1" data-testid="text-persona-nombre">
                {persona.nombre}
              </h1>
              {persona.fechaNacimiento && persona.fechaFallecimiento && (
                <p className="text-amber-400/60 text-sm tracking-wide">
                  {persona.fechaNacimiento} — {persona.fechaFallecimiento}
                </p>
              )}
              <div className="flex gap-4 mt-2 text-xs text-amber-200/40">
                <span>{persona.totalVelas} velas</span>
                <span>·</span>
                <span>{persona.totalRecuerdos} recuerdos</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <CandleFlame size="md" />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          {/* Bio */}
          {persona.biografia && (
            <div className="bg-card border border-amber-900/30 rounded-xl p-6 mb-10">
              <h2 className="font-serif text-lg text-amber-300 mb-3">Biografia</h2>
              <p className="text-amber-200/75 leading-relaxed">{persona.biografia}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-amber-900/30 mb-8">
            {(["recuerdos", "velas"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-amber-500 text-amber-300"
                    : "border-transparent text-amber-200/50 hover:text-amber-200"
                }`}
                data-testid={`tab-${tab}`}
              >
                {tab === "recuerdos" ? "Recuerdos" : "Velas encendidas"}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "velas" && (
            <div className="space-y-6">
              {/* Candle lighting form */}
              {velaSubmitted ? (
                <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-8 text-center">
                  <CandleFlame size="md" className="mx-auto mb-4" />
                  <h3 className="font-serif text-xl text-amber-200 mb-2">Tu vela esta encendida</h3>
                  <p className="text-amber-200/60 text-sm mb-4">Gracias por honrar su memoria.</p>
                  <button
                    onClick={() => setVelaSubmitted(false)}
                    className="text-amber-400 text-sm hover:underline"
                  >
                    Encender otra vela
                  </button>
                </div>
              ) : (
                <div className="bg-card border border-amber-900/30 rounded-xl p-6">
                  <h3 className="font-serif text-xl text-amber-200 mb-5">Encender una vela</h3>
                  <form onSubmit={velaForm.handleSubmit(onSubmitVela)} className="space-y-4">
                    <div>
                      <label className="block text-sm text-amber-200/70 mb-1" htmlFor="vela-autor">Tu nombre</label>
                      <input
                        id="vela-autor"
                        {...velaForm.register("nombreAutor", { required: true })}
                        className="w-full bg-background border border-amber-900/30 rounded-md px-3 py-2 text-amber-100 text-sm focus:outline-none focus:border-amber-600/50 placeholder:text-amber-200/30"
                        placeholder="Tu nombre"
                        data-testid="input-vela-autor"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-amber-200/70 mb-1" htmlFor="vela-mensaje">Tu mensaje</label>
                      <textarea
                        id="vela-mensaje"
                        {...velaForm.register("mensaje", { required: true })}
                        rows={4}
                        className="w-full bg-background border border-amber-900/30 rounded-md px-3 py-2 text-amber-100 text-sm focus:outline-none focus:border-amber-600/50 placeholder:text-amber-200/30 resize-none"
                        placeholder="Escribe un mensaje desde el corazon..."
                        data-testid="input-vela-mensaje"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={createVela.isPending}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-md transition-colors disabled:opacity-60"
                      data-testid="button-submit-vela"
                    >
                      {createVela.isPending ? "Encendiendo..." : "Encender vela"}
                    </button>
                  </form>
                </div>
              )}

              {/* Velas list */}
              {velasData && velasData.data.length > 0 && (
                <div className="space-y-4">
                  {velasData.data.map((vela) => (
                    <div key={vela.id} className="bg-card border border-amber-900/25 rounded-xl p-5 flex gap-4" data-testid={`card-vela-${vela.id}`}>
                      <CandleFlame size="sm" className="flex-shrink-0" />
                      <div>
                        <p className="text-amber-200/90 text-sm leading-relaxed mb-2">{vela.mensaje}</p>
                        <div className="flex gap-3 text-xs text-amber-200/40">
                          <span>{vela.nombreAutor}</span>
                          <span>·</span>
                          <span>{vela.tiempoTranscurrido}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "recuerdos" && (
            <div className="space-y-6">
              {/* Share memory form */}
              <div className="bg-card border border-amber-900/30 rounded-xl p-6">
                <h3 className="font-serif text-xl text-amber-200 mb-5">Compartir un recuerdo</h3>
                <form onSubmit={recuerdoForm.handleSubmit(onSubmitRecuerdo)} className="space-y-4">
                  <div>
                    <label className="block text-sm text-amber-200/70 mb-1" htmlFor="recuerdo-autor">Tu nombre</label>
                    <input
                      id="recuerdo-autor"
                      {...recuerdoForm.register("nombreAutor", { required: true })}
                      className="w-full bg-background border border-amber-900/30 rounded-md px-3 py-2 text-amber-100 text-sm focus:outline-none focus:border-amber-600/50 placeholder:text-amber-200/30"
                      placeholder="Tu nombre"
                      data-testid="input-recuerdo-autor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-amber-200/70 mb-1" htmlFor="recuerdo-mensaje">Tu recuerdo</label>
                    <textarea
                      id="recuerdo-mensaje"
                      {...recuerdoForm.register("mensaje", { required: true })}
                      rows={5}
                      className="w-full bg-background border border-amber-900/30 rounded-md px-3 py-2 text-amber-100 text-sm focus:outline-none focus:border-amber-600/50 placeholder:text-amber-200/30 resize-none"
                      placeholder="Comparte un recuerdo especial..."
                      data-testid="input-recuerdo-mensaje"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={createRecuerdo.isPending}
                    className="w-full py-3 bg-amber-800/50 hover:bg-amber-700/60 border border-amber-700/40 text-amber-200 font-medium rounded-md transition-colors disabled:opacity-60"
                    data-testid="button-submit-recuerdo"
                  >
                    {createRecuerdo.isPending ? "Guardando..." : "Guardar recuerdo"}
                  </button>
                </form>
              </div>

              {/* Memories list */}
              {recuerdosData && recuerdosData.data.length > 0 ? (
                <div className="space-y-4">
                  {recuerdosData.data.map((recuerdo) => (
                    <div key={recuerdo.id} className="bg-card border border-amber-900/25 rounded-xl p-6" data-testid={`card-recuerdo-${recuerdo.id}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-full bg-amber-800/40 flex items-center justify-center font-serif font-bold text-amber-300">
                          {recuerdo.nombreAutor.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-amber-200">{recuerdo.nombreAutor}</p>
                          <p className="text-xs text-amber-200/40">{recuerdo.tiempoTranscurrido}</p>
                        </div>
                      </div>
                      <p className="text-amber-200/80 text-sm leading-relaxed">{recuerdo.mensaje}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-amber-200/40">
                  <p>Aun no hay recuerdos compartidos. Se el primero.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
