import { useState } from "react";
import { Link } from "wouter";
import { useListPersonas } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import heroImage from "@assets/image_1777782921821.png";

/* ─────── Helpers ─────── */
function formatDateEs(raw?: string): string {
  if (!raw) return "";
  try {
    const [y, m, d] = raw.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  } catch { return raw; }
}

/* ─────────────────── HERO ─────────────────── */
function HeroSection({
  persona,
}: {
  persona: {
    id: number;
    nombre: string;
    fechaNacimiento?: string;
    fechaFallecimiento?: string;
    biografia?: string;
    fotoPrincipal?: string;
    totalVelas?: number;
    totalRecuerdos?: number;
  };
}) {
  return (
    <section className="relative overflow-hidden" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Split background */}
      <div className="absolute inset-0 pointer-events-none bg-white" aria-hidden />

      <div className="relative max-w-7xl mx-auto flex" style={{ minHeight: "calc(100vh - 64px)" }}>

        {/* LEFT */}
        <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-20" style={{ width: "55%", minHeight: "calc(100vh - 64px)", background: "#fff" }}>
          <div style={{ maxWidth: 540 }}>
            <h1
              className="hero-enter-2 font-serif leading-[0.9] mb-5"
              style={{ fontSize: "clamp(2.4rem, 4.2vw, 4.4rem)", color: "#0d0d0d" }}
            >
              {persona.nombre}
            </h1>
            <p className="hero-enter-3 text-sm tracking-wide mb-6" style={{ color: "rgba(0,0,0,0.38)" }}>
              {formatDateEs(persona.fechaNacimiento)}
              {persona.fechaNacimiento && persona.fechaFallecimiento && " — "}
              {formatDateEs(persona.fechaFallecimiento)}
            </p>
            <div className="hero-enter-5 mb-8 flex items-center gap-4">
              <div className="w-10 h-0.5 rounded-full" style={{ background: "#f97316" }} />
              <Link
                href={`/personas/${persona.id}`}
                className="hero-enter-6 inline-flex items-center text-sm font-semibold transition-colors hover:opacity-75"
                style={{ color: "#f97316" }}
              >
                Recuérdalo aquí
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="hidden lg:flex items-center justify-center py-14 pr-12" style={{ width: "45%", background: "#fff" }}>
          <div className="relative" style={{ width: "100%", maxWidth: 400 }}>
            <div
              className="relative overflow-hidden"
              style={{
                width: "100%",
                aspectRatio: "3/4",
                borderRadius: "2.4rem 1.3rem 2.2rem 1.5rem",
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 24px 50px rgba(0,0,0,0.10)",
                backgroundImage: `url(${heroImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── HOME ─────────────────── */
export default function Home() {
  const { data: personas } = useListPersonas();
  const persona = personas?.[0]
    ? {
        ...personas[0],
        fechaNacimiento: personas[0].fechaNacimiento ?? undefined,
        fechaFallecimiento: personas[0].fechaFallecimiento ?? undefined,
        biografia: personas[0].biografia ?? undefined,
        fotoPrincipal: personas[0].fotoPrincipal ?? undefined,
      }
    : undefined;
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      {persona && <HeroSection persona={persona} />}

      {/* CTA */}
      <section className="py-24 px-4 text-center" style={{ background: "#0d0d0d" }}>
        <CandleFlame size="lg" className="mx-auto mb-6" />
        <h2 className="font-serif text-4xl text-white mb-3">Siempre en nuestro corazón</h2>
        <p className="text-white/40 mb-10 max-w-md mx-auto leading-relaxed">
          Cada recuerdo compartido es una forma de mantener viva su luz para siempre.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/velas"
              className="inline-flex items-center justify-center px-8 py-3.5 font-semibold rounded-xl transition-all duration-200"
              style={{ background: "#f97316", color: "#fff", boxShadow: "none" }}
            >
              Enciende tu velita
            </Link>
          <Link
            href="/recuerdos"
            className="inline-flex items-center justify-center px-8 py-3.5 font-semibold rounded-xl transition-all duration-200"
            style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.15)" }}
          >
            Ver recuerdos
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 text-center" style={{ background: "#ffffff", borderTop: "3px solid #f97316" }}>
        <p className="font-serif text-black/80 text-sm tracking-widest uppercase mb-1">En Tu Memoria</p>
        <p className="text-black/40 text-xs font-light">Siempre estarás en nuestros corazones</p>
      </footer>
    </div>
  );
}
