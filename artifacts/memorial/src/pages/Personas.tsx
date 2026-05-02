import { Link } from "wouter";
import { useListPersonas } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import CandleFlame from "@/components/CandleFlame";
import { Skeleton } from "@/components/ui/skeleton";

export default function Personas() {
  const { data: personas, isLoading } = useListPersonas();

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-orange-500 font-bold tracking-widest uppercase mb-3">Nuestros seres queridos</p>
            <h1 className="font-serif text-5xl text-black mb-4">En Memoria</h1>
            <p className="text-black/50 max-w-md mx-auto leading-relaxed">
              Cada vida es una historia que merece ser recordada. Aquí honramos a quienes amamos.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
                  <Skeleton className="h-52 w-full bg-gray-100" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-5 w-3/4 bg-gray-100" />
                    <Skeleton className="h-4 w-1/2 bg-gray-100" />
                    <Skeleton className="h-14 w-full bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : personas && personas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {personas.map((persona, i) => (
                <Link key={persona.id} href={`/personas/${persona.id}`} className="group block">
                  <div
                    className="border border-gray-100 rounded-2xl overflow-hidden hover:border-orange-200 hover:shadow-lg hover:shadow-orange-50 transition-all duration-300 fade-in-up"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="relative h-52 bg-gray-50 flex items-center justify-center overflow-hidden">
                      {persona.fotoPrincipal ? (
                        <img src={persona.fotoPrincipal} alt={persona.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-orange-200 flex items-center justify-center font-serif text-3xl text-orange-400">
                          {persona.nombre.charAt(0)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-3 right-3"><CandleFlame size="sm" /></div>
                    </div>
                    <div className="p-6 bg-white">
                      <h2 className="font-serif text-xl text-black mb-1 group-hover:text-orange-500 transition-colors">{persona.nombre}</h2>
                      {persona.fechaNacimiento && persona.fechaFallecimiento && (
                        <p className="text-orange-400 text-xs mb-3 tracking-wide font-medium">{persona.fechaNacimiento} — {persona.fechaFallecimiento}</p>
                      )}
                      {persona.biografia && (
                        <p className="text-black/50 text-sm leading-relaxed line-clamp-3 mb-4">{persona.biografia}</p>
                      )}
                      <div className="flex gap-4 text-xs text-black/35 pt-3 border-t border-gray-100">
                        <span>{persona.totalVelas} velitas</span>
                        <span>·</span>
                        <span>{persona.totalRecuerdos} recuerdos</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <CandleFlame size="lg" className="mx-auto mb-6 opacity-40" />
              <p className="text-black/40 text-lg">Aún no hay perfiles en el memorial.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
