import { useState } from "react";
import { useListRecuerdos, useCreateRecuerdo, getListRecuerdosQueryKey, useListPersonas } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import CandleFlame from "@/components/CandleFlame";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type RecuerdoForm = { nombreAutor: string; persona: string; mensaje: string; personaId?: number };

export default function Recuerdos() {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recuerdosData, isLoading } = useListRecuerdos({ limit: 30 });
  const { data: personas } = useListPersonas();
  const createRecuerdo = useCreateRecuerdo();

  const form = useForm<RecuerdoForm>({
    defaultValues: { nombreAutor: "", persona: "", mensaje: "", personaId: undefined },
  });

  const onSubmit = async (data: RecuerdoForm) => {
    await createRecuerdo.mutateAsync(
      {
        data: {
          personaId: data.personaId || null,
          nombreAutor: data.nombreAutor,
          persona: data.persona || null,
          mensaje: data.mensaje,
        },
      },
      {
        onSuccess: () => {
          form.reset();
          setShowForm(false);
          queryClient.invalidateQueries({ queryKey: getListRecuerdosQueryKey({ limit: 30 }) });
          toast({ title: "Recuerdo guardado", description: "Gracias por compartir este recuerdo." });
        },
        onError: () => {
          toast({ title: "Error", description: "No se pudo guardar el recuerdo.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-amber-400/70 text-xs font-medium tracking-widest uppercase mb-3">Historias que perduran</p>
            <h1 className="font-serif text-5xl text-amber-100 mb-4">Recuerdos</h1>
            <p className="text-amber-200/60 max-w-md mx-auto leading-relaxed mb-8">
              Cada historia, cada momento compartido, es un tesoro que los mantiene vivos en nuestros corazones.
            </p>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-md transition-colors shadow-lg shadow-amber-900/30"
              data-testid="button-compartir-recuerdo"
            >
              {showForm ? "Cancelar" : "Compartir un recuerdo"}
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-card border border-amber-900/30 rounded-xl p-6 mb-10 fade-in-up">
              <h2 className="font-serif text-xl text-amber-200 mb-6">Tu recuerdo</h2>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-amber-200/60 mb-1 uppercase tracking-wide" htmlFor="autor-recuerdo">
                      Tu nombre
                    </label>
                    <input
                      id="autor-recuerdo"
                      {...form.register("nombreAutor", { required: true })}
                      className="w-full bg-background border border-amber-900/30 rounded-md px-3 py-2 text-amber-100 text-sm focus:outline-none focus:border-amber-600/50 placeholder:text-amber-200/25"
                      placeholder="Tu nombre"
                      data-testid="input-autor-recuerdo"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-amber-200/60 mb-1 uppercase tracking-wide" htmlFor="persona-recuerdo">
                      Sobre quien es este recuerdo
                    </label>
                    {personas && personas.length > 0 ? (
                      <select
                        id="persona-recuerdo"
                        {...form.register("personaId", { valueAsNumber: true })}
                        className="w-full bg-background border border-amber-900/30 rounded-md px-3 py-2 text-amber-100 text-sm focus:outline-none focus:border-amber-600/50"
                        data-testid="select-persona-recuerdo"
                        onChange={(e) => {
                          const selected = personas.find((p) => p.id === Number(e.target.value));
                          if (selected) form.setValue("persona", selected.nombre);
                          form.setValue("personaId", Number(e.target.value) || undefined);
                        }}
                      >
                        <option value="">Seleccionar persona</option>
                        {personas.map((p) => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id="persona-recuerdo"
                        {...form.register("persona")}
                        className="w-full bg-background border border-amber-900/30 rounded-md px-3 py-2 text-amber-100 text-sm focus:outline-none focus:border-amber-600/50 placeholder:text-amber-200/25"
                        placeholder="Nombre de la persona"
                        data-testid="input-persona-recuerdo"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-amber-200/60 mb-1 uppercase tracking-wide" htmlFor="mensaje-recuerdo">
                    Tu recuerdo
                  </label>
                  <textarea
                    id="mensaje-recuerdo"
                    {...form.register("mensaje", { required: true })}
                    rows={6}
                    className="w-full bg-background border border-amber-900/30 rounded-md px-3 py-2 text-amber-100 text-sm focus:outline-none focus:border-amber-600/50 placeholder:text-amber-200/25 resize-none"
                    placeholder="Comparte ese momento especial, esa historia que quieres que todos recuerden..."
                    data-testid="input-mensaje-recuerdo"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={createRecuerdo.isPending}
                    className="flex-1 py-3 bg-amber-800/50 hover:bg-amber-700/60 border border-amber-700/40 text-amber-200 font-medium rounded-md transition-colors disabled:opacity-60"
                    data-testid="button-submit-recuerdo"
                  >
                    {createRecuerdo.isPending ? "Guardando..." : "Guardar recuerdo"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 border border-amber-900/30 text-amber-200/60 rounded-md transition-colors hover:text-amber-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Memories list */}
          {isLoading ? (
            <div className="space-y-5">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-36 rounded-xl bg-amber-900/20" />
              ))}
            </div>
          ) : recuerdosData && recuerdosData.data.length > 0 ? (
            <div className="space-y-5">
              {recuerdosData.data.map((recuerdo, i) => (
                <div
                  key={recuerdo.id}
                  className="bg-card border border-amber-900/25 rounded-xl p-6 hover:border-amber-700/35 transition-colors fade-in-up"
                  style={{ animationDelay: `${i * 0.07}s` }}
                  data-testid={`card-recuerdo-${recuerdo.id}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-amber-800/40 border border-amber-700/20 flex items-center justify-center font-serif font-bold text-amber-300 text-lg flex-shrink-0">
                      {recuerdo.nombreAutor.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-sm font-semibold text-amber-200">{recuerdo.nombreAutor}</span>
                        {recuerdo.persona && (
                          <>
                            <span className="text-amber-200/30 text-xs">sobre</span>
                            <span className="text-amber-400 text-xs font-medium">{recuerdo.persona}</span>
                          </>
                        )}
                        <span className="ml-auto text-xs text-amber-200/35">{recuerdo.tiempoTranscurrido}</span>
                      </div>
                      <p className="text-amber-200/80 text-sm leading-relaxed">{recuerdo.mensaje}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <CandleFlame size="md" className="mx-auto mb-6 opacity-40" />
              <p className="text-amber-200/50">Aun no hay recuerdos compartidos. Se el primero.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
