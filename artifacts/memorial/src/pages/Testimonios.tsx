import { useState } from "react";
import { useListTestimonios, useCreateTestimonio, getListTestimoniosQueryKey } from "@/hooks/use-supabase-data";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import CandleFlame from "@/components/CandleFlame";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type TestimonioForm = { nombreAutor: string; texto: string };

export default function Testimonios() {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: testimonios, isLoading } = useListTestimonios({ limit: 30 });
  const createTestimonio = useCreateTestimonio();

  const form = useForm<TestimonioForm>({
    defaultValues: { nombreAutor: "", texto: "" },
  });

  const onSubmit = async (data: TestimonioForm) => {
    await createTestimonio.mutateAsync(
      { data: { nombreAutor: data.nombreAutor, texto: data.texto } },
      {
        onSuccess: () => {
          form.reset();
          setShowForm(false);
          queryClient.invalidateQueries({ queryKey: getListTestimoniosQueryKey({ limit: 30 }) });
          toast({ title: "Testimonio compartido", description: "Gracias por tus palabras." });
        },
        onError: () => {
          toast({ title: "Error", description: "No se pudo guardar el testimonio.", variant: "destructive" });
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
            <p className="text-amber-400/70 text-xs font-medium tracking-widest uppercase mb-3">Palabras del corazon</p>
            <h1 className="font-serif text-5xl text-amber-100 mb-4">Testimonios</h1>
            <p className="text-amber-200/60 max-w-md mx-auto leading-relaxed mb-8">
              Las palabras de quienes los amaron son el puente entre el ayer y el siempre.
            </p>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-md transition-colors shadow-lg shadow-amber-900/30"
              data-testid="button-dejar-testimonio"
            >
              {showForm ? "Cancelar" : "Dejar un testimonio"}
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-card border border-amber-900/30 rounded-xl p-6 mb-10 fade-in-up">
              <h2 className="font-serif text-xl text-amber-200 mb-6">Comparte tu testimonio</h2>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs text-amber-200/60 mb-1 uppercase tracking-wide" htmlFor="autor-testimonio">
                    Tu nombre
                  </label>
                  <input
                    id="autor-testimonio"
                    {...form.register("nombreAutor", { required: true })}
                    className="w-full bg-background border border-amber-900/30 rounded-md px-3 py-2 text-amber-100 text-sm focus:outline-none focus:border-amber-600/50 placeholder:text-amber-200/25"
                    placeholder="Tu nombre"
                    data-testid="input-autor-testimonio"
                  />
                </div>
                <div>
                  <label className="block text-xs text-amber-200/60 mb-1 uppercase tracking-wide" htmlFor="texto-testimonio">
                    Tu testimonio
                  </label>
                  <textarea
                    id="texto-testimonio"
                    {...form.register("texto", { required: true })}
                    rows={6}
                    className="w-full bg-background border border-amber-900/30 rounded-md px-3 py-2 text-amber-100 text-sm focus:outline-none focus:border-amber-600/50 placeholder:text-amber-200/25 resize-none"
                    placeholder="Comparte desde el corazon lo que sientes, lo que recuerdas, lo que quieres que todos sepan..."
                    data-testid="input-texto-testimonio"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={createTestimonio.isPending}
                    className="flex-1 py-3 bg-amber-800/50 hover:bg-amber-700/60 border border-amber-700/40 text-amber-200 font-medium rounded-md transition-colors disabled:opacity-60"
                    data-testid="button-submit-testimonio"
                  >
                    {createTestimonio.isPending ? "Guardando..." : "Guardar testimonio"}
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

          {/* Testimonials */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-40 rounded-xl bg-amber-900/20" />
              ))}
            </div>
          ) : testimonios && testimonios.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {testimonios.map((t, i) => (
                <div
                  key={t.id}
                  className="bg-card border border-amber-900/25 rounded-xl p-6 hover:border-amber-700/35 transition-colors fade-in-up"
                  style={{ animationDelay: `${i * 0.07}s` }}
                  data-testid={`card-testimonio-${t.id}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-amber-800/40 border border-amber-700/20 flex items-center justify-center font-serif font-bold text-amber-300 text-lg">
                      {t.inicial}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-200">{t.nombreAutor}</p>
                      <p className="text-xs text-amber-200/40">{t.tiempoTranscurrido}</p>
                    </div>
                  </div>
                  <blockquote className="text-amber-200/80 text-sm leading-relaxed italic border-l-2 border-amber-700/40 pl-4">
                    {t.texto}
                  </blockquote>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <CandleFlame size="md" className="mx-auto mb-6 opacity-40" />
              <p className="text-amber-200/50">Aun no hay testimonios. Se el primero en compartir.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
