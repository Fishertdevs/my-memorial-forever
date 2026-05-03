import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import CandleFlame from "@/components/CandleFlame";

/* ─────────────────── HERO ─────────────────── */
const PERSONAS_HOMENAJE: { nombre: string; foto: string | null }[] = [
  { nombre: "Ana Soledad Lizarazo Calderón", foto: null },
  { nombre: "Pablo Esteban Aguirre Camargo", foto: null },
  { nombre: "Carlos Alberto Camargo Munevar", foto: null },
];

function initials(nombre: string) {
  return nombre
    .split(" ")
    .filter((_, i) => i < 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function PersonaCard({
  nombre,
  foto,
  delay,
}: {
  nombre: string;
  foto: string | null;
  delay: number;
}) {
  return (
    <div
      className="flex flex-col items-center text-center hero-enter-1"
      style={{ animationDelay: `${delay}s`, flex: "1 1 0", minWidth: 0 }}
    >
      <h2
        className="font-serif leading-snug mb-5"
        style={{ fontSize: "clamp(1rem, 2vw, 1.45rem)", color: "#0d0d0d", minHeight: "3.5em", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {nombre}
      </h2>

      <div
        style={{
          width: "100%",
          maxWidth: 200,
          aspectRatio: "3/4",
          borderRadius: "2.2rem 0.7rem 2.2rem 0.7rem",
          overflow: "hidden",
          boxShadow: "0 0 0 3px #fff, 0 0 0 5px #0d0d0d",
          background: "#f3f0eb",
          position: "relative",
        }}
      >
        {foto ? (
          <img
            src={foto}
            alt={nombre}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div
            className="flex items-center justify-center w-full h-full font-serif"
            style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "#d1c9bb", userSelect: "none" }}
          >
            {initials(nombre)}
          </div>
        )}
      </div>

      <div className="mt-6 mb-1">
        <CandleFlame size="sm" />
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="bg-white" style={{ borderBottom: "1px solid #e5e7eb" }}>
      <div
        className="max-w-5xl mx-auto flex flex-col items-center px-6"
        style={{ paddingTop: "4.5rem", paddingBottom: "4rem" }}
      >
        <span
          className="block mb-10 text-xs uppercase tracking-[0.32em]"
          style={{ color: "#f97316" }}
        >
          En conmemoración a
        </span>

        <div className="flex flex-row items-start justify-center gap-8 sm:gap-14 w-full">
          {PERSONAS_HOMENAJE.map(({ nombre, foto }, i) => (
            <PersonaCard key={nombre} nombre={nombre} foto={foto} delay={i * 0.15} />
          ))}
        </div>

        <p
          className="mt-10 text-xs italic text-center"
          style={{ color: "rgba(0,0,0,0.28)", maxWidth: 360, lineHeight: 1.85 }}
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
