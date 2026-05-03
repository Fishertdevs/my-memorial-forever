import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import CandleFlame from "@/components/CandleFlame";

/* ─────────────────── HERO ─────────────────── */
const PERSONAS_HOMENAJE = [
  "Ana Soledad Lizarazo Calderón",
  "Pablo Esteban Aguirre Camargo",
  "Carlos Alberto Camargo Munevar",
];

function HeroSection() {
  return (
    <section className="bg-white" style={{ borderBottom: "1px solid #e5e7eb" }}>
      <div
        className="max-w-4xl mx-auto flex flex-col items-center text-center px-6"
        style={{ paddingTop: "5rem", paddingBottom: "4.5rem" }}
      >
        <span
          className="block mb-8 text-xs uppercase tracking-[0.32em]"
          style={{ color: "#f97316" }}
        >
          En conmemoración a
        </span>

        <div className="flex flex-col items-center gap-0 w-full max-w-2xl">
          {PERSONAS_HOMENAJE.map((nombre, i) => (
            <div key={nombre} className="flex flex-col items-center w-full">
              <h1
                className="font-serif leading-snug hero-enter-1"
                style={{
                  fontSize: "clamp(1.55rem, 3.5vw, 2.55rem)",
                  color: "#0d0d0d",
                  animationDelay: `${i * 0.18}s`,
                }}
              >
                {nombre}
              </h1>
              {i < PERSONAS_HOMENAJE.length - 1 && (
                <div
                  className="my-4"
                  style={{ width: 28, height: 1.5, background: "#f97316", borderRadius: 1, opacity: 0.55 }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 mb-8" style={{ width: 48, height: 2, background: "#f97316", borderRadius: 1 }} />

        <div className="flex items-end justify-center gap-10 sm:gap-16">
          {PERSONAS_HOMENAJE.map((nombre) => (
            <div key={nombre} className="flex flex-col items-center gap-1">
              <CandleFlame size="sm" />
            </div>
          ))}
        </div>

        <p
          className="mt-8 text-xs italic"
          style={{ color: "rgba(0,0,0,0.28)", maxWidth: 340, lineHeight: 1.85 }}
        >
          "Que sus almas descansen en la paz del Señor y su luz brille eternamente."
        </p>
      </div>
    </section>
  );
}

/* ─────────────────── HOME ─────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      <HeroSection />

      {/* Homenaje */}
      <section className="py-24 px-4 text-center" style={{ background: "#ffffff" }}>
        <p className="text-black/50 max-w-2xl mx-auto leading-relaxed">
          Hoy y siempre, su luz permanece con nosotros, iluminando los momentos que compartimos, las risas que aún resuenan en el alma y el amor inmenso que dejó sembrado en cada corazón.
          Aunque el tiempo avance, su presencia sigue siendo abrigo, guía y ternura; un recuerdo eterno que nos invita a vivir con gratitud, a amar con profundidad y a honrar su legado con cada gesto de cariño.
          Porque quienes amamos de verdad no se van del todo: viven en las palabras que nos enseñaron, en los valores que sembraron, en la forma en que miramos el mundo y elegimos ser mejores personas cada día.
          Su memoria es un faro que no se apaga, una voz suave que nos acompaña en cada paso del camino, recordándonos que el amor verdadero trasciende el tiempo y permanece para siempre en el corazón de quienes tuvieron la dicha de conocerle.
          <span className="block mt-5 text-xs uppercase tracking-[0.28em]" style={{ color: "#f97316" }}>
            — Eclesiastés 3:1
          </span>
        </p>
      </section>

      <div className="px-4">
        <div className="max-w-5xl mx-auto h-px" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(249,115,22,0.55) 50%, transparent 100%)" }} />
      </div>

      {/* CTA */}
      <section className="py-24 px-4 text-center" style={{ background: "#0d0d0d" }}>
        <h2 className="font-serif text-4xl text-white mb-3">Siempre en nuestro corazón</h2>
        <p className="text-white/40 mb-10 max-w-md mx-auto leading-relaxed">
          Cada recuerdo compartido es una forma de mantener viva su luz para siempre.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
          <Link
            href="/velas"
            className="text-xs uppercase tracking-[0.28em] transition-opacity duration-200 hover:opacity-70"
            style={{ color: "#f97316" }}
          >
            — Enciende tu velita
          </Link>
          <span className="hidden sm:block w-px h-4 bg-white/20" />
          <Link
            href="/recuerdos"
            className="text-xs uppercase tracking-[0.28em] transition-opacity duration-200 hover:opacity-70"
            style={{ color: "#f97316" }}
          >
            — Ver recuerdos
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
