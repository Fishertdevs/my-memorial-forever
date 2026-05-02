import { useState } from "react";
import { useListVelas, useCreateVela, getListVelasQueryKey, useListPersonas } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import CandleFlame from "@/components/CandleFlame";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type VelaForm = { nombreRecordado: string; nombreAutor: string; mensaje: string; personaId?: number };

export default function Velas() {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: velasData, isLoading } = useListVelas({ limit: 30 });
  const { data: personas } = useListPersonas();
  const createVela = useCreateVela();

  const form = useForm<VelaForm>({
    defaultValues: { nombreRecordado: "", nombreAutor: "", mensaje: "", personaId: undefined },
  });

  const onSubmit = async (data: VelaForm) => {
    await createVela.mutateAsync(
      {
        data: {
          personaId: data.personaId || null,
          nombreRecordado: data.nombreRecordado,
          nombreAutor: data.nombreAutor,
          mensaje: data.mensaje,
        },
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          form.reset();
          queryClient.invalidateQueries({ queryKey: getListVelasQueryKey({ limit: 30 }) });
          toast({ title: "Vela encendida", description: "Tu luz brilla en su memoria." });
        },
        onError: () => {
          toast({ title: "Error", description: "No se pudo encender la vela. Intenta de nuevo.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-14">
            <div className="flex justify-center mb-6">
              <CandleFlame size="lg" />
            </div>
            <p className="text-amber-400/70 text-xs font-medium tracking-widest uppercase mb-3">Un gesto de amor</p>
            <h1 className="font-serif text-5xl text-amber-100 mb-4">Velas encendidas</h1>
            <p className="text-amber-200/60 max-w-md mx-auto leading-relaxed">
              Cada llama es una oracion, un recuerdo, una promesa de que nunca seran olvidados.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Form */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-amber-900/30 rounded-xl p-6 sticky top-24">
                {submitted ? (
                  <div className="text-center py-8">
                    <CandleFlame size="md" className="mx-auto mb-5" />
                    <h3 className="font-serif text-xl text-amber-200 mb-2">Tu vela esta encendida</h3>
                    <p className="text-amber-200/60 text-sm mb-6 leading-relaxed">
                      Gracias por honrar su memoria con esta luz.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-2 border border-amber-700/40 text-amber-300 rounded-md text-sm hover:bg-amber-900/20 transition-colors"
                      data-testid="button-encender-otra"
                    >
                      Encender otra vela
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="font-serif text-xl text-amber-200 mb-6">Encender una vela</h2>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div>
                        <label className="block text-xs text-amber-200/60 mb-1 uppercase tracking-wide" htmlFor="nombre-recordado">
                          En memoria de
                        </label>
                        <input
                          id="nombre-recordado"
                          {...form.register("nombreRecordado", { required: true })}
                          className="w-full bg-background border border-amber-900/30 rounded-md px-3 py-2 text-amber-100 text-sm focus:outline-none focus:border-amber-600/50 placeholder:text-amber-200/25"
                          placeholder="Nombre de la persona"
                          data-testid="input-nombre-recordado"
                        />
                      </div>

                      {personas && personas.length > 0 && (
                        <div>
                          <label className="block text-xs text-amber-200/60 mb-1 uppercase tracking-wide" htmlFor="persona-select">
                            Vincular a perfil (opcional)
                          </label>
                          <select
                            id="persona-select"
                            {...form.register("personaId", { valueAsNumber: true })}
                            className="w-full bg-background border border-amber-900/30 rounded-md px-3 py-2 text-amber-100 text-sm focus:outline-none focus:border-amber-600/50"
                            data-testid="select-persona"
                          >
                            <option value="">Sin vincular</option>
                            {personas.map((p) => (
                              <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs text-amber-200/60 mb-1 uppercase tracking-wide" htmlFor="autor-vela">
                          Tu nombre
                        </label>
                        <input
                          id="autor-vela"
                          {...form.register("nombreAutor", { required: true })}
                          className="w-full bg-background border border-amber-900/30 rounded-md px-3 py-2 text-amber-100 text-sm focus:outline-none focus:border-amber-600/50 placeholder:text-amber-200/25"
                          placeholder="Tu nombre"
                          data-testid="input-autor-vela"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-amber-200/60 mb-1 uppercase tracking-wide" htmlFor="mensaje-vela">
                          Mensaje
                        </label>
                        <textarea
                          id="mensaje-vela"
                          {...form.register("mensaje", { required: true })}
                          rows={5}
                          className="w-full bg-background border border-amber-900/30 rounded-md px-3 py-2 text-amber-100 text-sm focus:outline-none focus:border-amber-600/50 placeholder:text-amber-200/25 resize-none"
                          placeholder="Escribe desde el corazon..."
                          data-testid="input-mensaje-vela"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={createVela.isPending}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-md transition-colors disabled:opacity-60 shadow-lg shadow-amber-900/30"
                        data-testid="button-submit-vela"
                      >
                        {createVela.isPending ? "Encendiendo..." : "Encender vela"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* Candles grid */}
            <div className="lg:col-span-2">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-40 rounded-xl bg-amber-900/20" />
                  ))}
                </div>
              ) : velasData && velasData.data.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-amber-200/50 text-sm">{velasData.total} velas encendidas</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {velasData.data.map((vela, i) => (
                      <div
                        key={vela.id}
                        className="bg-card border border-amber-900/25 rounded-xl p-5 flex gap-4 hover:border-amber-700/35 transition-colors fade-in-up"
                        style={{ animationDelay: `${i * 0.06}s` }}
                        data-testid={`card-vela-${vela.id}`}
                      >
                        <div className="flex-shrink-0">
                          <CandleFlame size="sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-xs font-medium text-amber-400 mb-1">
                            Por {vela.nombreRecordado}
                          </p>
                          <p className="text-amber-200/80 text-sm leading-relaxed line-clamp-3 mb-3">
                            {vela.mensaje}
                          </p>
                          <div className="flex justify-between text-xs text-amber-200/35">
                            <span>{vela.nombreAutor}</span>
                            <span>{vela.tiempoTranscurrido}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-24 text-amber-200/40">
                  <CandleFlame size="lg" className="mx-auto mb-6 opacity-40" />
                  <p>Se el primero en encender una vela.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
