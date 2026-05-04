import { Link } from "wouter";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import CandleFlame from "@/components/CandleFlame";

const ESPRESSO = "#1a0f07";
const GOLD = "#c9943a";
const CREAM = "#f5f0e8";
const CARD_BG = "#faf7f2";

const PERSONAS_HOMENAJE: { nombre: string; foto: string | null }[] = [
  { nombre: "Ana Soledad Lizarazo Calderón", foto: null },
  { nombre: "Pablo Esteban Aguirre Camargo", foto: null },
  { nombre: "Carlos Alberto Camargo Munevar", foto: null },
];

function initials(nombre: string) {
  return nombre.split(" ").filter((_, i) => i < 2).map((p) => p[0]).join("").toUpperCase();
}

function PhotoWithCandle({ nombre, foto, maxW = 200 }: { nombre: string; foto: string | null; maxW?: number }) {
  return (
    <div className="flex flex-row items-end justify-center gap-3">
      <div
        style={{
          width: maxW,
          aspectRatio: "3/4",
          borderRadius: "2.2rem 0.7rem 2.2rem 0.7rem",
          overflow: "hidden",
          boxShadow: `0 0 0 3px ${ESPRESSO}, 0 0 0 5px ${GOLD}44`,
          background: "#2a1a0e",
          flexShrink: 0,
        }}
      >
        {foto ? (
          <img src={foto} alt={nombre} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div
            className="flex items-center justify-center w-full h-full font-serif"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: `${GOLD}66`, userSelect: "none" }}
          >
            {initials(nombre)}
          </div>
        )}
      </div>
      <div className="flex-shrink-0 pb-3">
        <CandleFlame size="sm" outerColor={GOLD} innerColor="#e8c060" glowColor="rgba(201,148,58,0.35)" />
      </div>
    </div>
  );
}

function PersonaCard({ nombre, foto, delay }: { nombre: string; foto: string | null; delay: number }) {
  return (
    <div
      className="flex flex-col items-center text-center hero-enter-1"
      style={{ animationDelay: `${delay}s`, flex: "1 1 0", minWidth: 0 }}
    >
      <h2
        className="font-serif leading-snug mb-5"
        style={{ fontSize: "clamp(1rem, 2vw, 1.45rem)", color: CREAM, minHeight: "3.5em", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {nombre}
      </h2>
      <PhotoWithCandle nombre={nombre} foto={foto} />
    </div>
  );
}

function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const total = PERSONAS_HOMENAJE.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % total);
      setAnimKey((k) => k + 1);
    }, 3500);
    return () => clearInterval(timer);
  }, [total]);

  const { nombre, foto } = PERSONAS_HOMENAJE[current];

  return (
    <div className="flex flex-col items-center w-full">
      <div key={animKey} className="flex flex-col items-center text-center w-full hero-enter-1" style={{ animationDelay: "0s" }}>
        <h2
          className="font-serif leading-snug mb-6"
          style={{ fontSize: "clamp(1.3rem, 6vw, 1.9rem)", color: CREAM, minHeight: "2.8em", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {nombre}
        </h2>
        <PhotoWithCandle nombre={nombre} foto={foto} maxW={190} />
      </div>
      <div className="flex gap-2 mt-8">
        {PERSONAS_HOMENAJE.map((_, i) => (
          <div
            key={i}
            style={{ width: i === current ? 20 : 7, height: 7, borderRadius: 4, background: i === current ? GOLD : `${GOLD}44`, transition: "width 0.35s ease, background 0.35s ease" }}
          />
        ))}
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section style={{ background: ESPRESSO, borderBottom: `1px solid rgba(201,148,58,0.18)` }}>
      <div className="max-w-5xl mx-auto flex flex-col items-center px-6" style={{ paddingTop: "4.5rem", paddingBottom: "4rem" }}>
        <span className="block mb-10 text-xs uppercase tracking-[0.32em]" style={{ color: GOLD }}>
          En conmemoración a
        </span>

        <div className="sm:hidden w-full flex flex-col items-center">
          <HeroCarousel />
        </div>

        <div className="hidden sm:flex flex-row items-start justify-center gap-8 sm:gap-14 w-full">
          {PERSONAS_HOMENAJE.map(({ nombre, foto }, i) => (
            <PersonaCard key={nombre} nombre={nombre} foto={foto} delay={i * 0.15} />
          ))}
        </div>

        <p
          className="mt-10 text-xs italic text-center"
          style={{ color: `${CREAM}66`, maxWidth: 360, lineHeight: 1.85 }}
        >
          "Que sus almas descansen en la paz del Señor y su luz brille eternamente."
        </p>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: CREAM, color: ESPRESSO }}>
      <Navbar />

      <HeroSection />

      {/* Homenaje */}
      <section className="py-24 px-4 text-center" style={{ background: CREAM }}>
        <p style={{ color: `${ESPRESSO}88`, maxWidth: 680 }} className="mx-auto leading-relaxed text-sm">
          Hoy y siempre, su luz permanece con nosotros, iluminando los momentos que compartimos, las risas que aún resuenan en el alma y el amor inmenso que dejó sembrado en cada corazón.
          Aunque el tiempo avance, su presencia sigue siendo abrigo, guía y ternura; un recuerdo eterno que nos invita a vivir con gratitud, a amar con profundidad y a honrar su legado con cada gesto de cariño.
          Porque quienes amamos de verdad no se van del todo: viven en las palabras que nos enseñaron, en los valores que sembraron, en la forma en que miramos el mundo y elegimos ser mejores personas cada día.
          Su memoria es un faro que no se apaga, una voz suave que nos acompaña en cada paso del camino, recordándonos que el amor verdadero trasciende el tiempo y permanece para siempre en el corazón de quienes tuvieron la dicha de conocerle.
          <span className="block mt-5 text-xs uppercase tracking-[0.28em]" style={{ color: GOLD }}>
            — Eclesiastés 3:1
          </span>
        </p>
      </section>

      <div className="px-4">
        <div className="max-w-5xl mx-auto h-px" style={{ background: `linear-gradient(90deg, transparent 0%, ${GOLD}66 50%, transparent 100%)` }} />
      </div>

      {/* CTA */}
      <section className="py-24 px-4 text-center" style={{ background: ESPRESSO }}>
        <h2 className="font-serif text-4xl mb-3" style={{ color: CREAM }}>Siempre en nuestro corazón</h2>
        <p className="mb-10 max-w-md mx-auto leading-relaxed text-sm" style={{ color: `${CREAM}55` }}>
          Cada recuerdo compartido es una forma de mantener viva su luz para siempre.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
          <Link
            href="/personas"
            className="text-xs uppercase tracking-[0.28em] transition-opacity duration-200 hover:opacity-70"
            style={{ color: GOLD }}
          >
            — Enciende tu velita
          </Link>
          <span className="hidden sm:block w-px h-4" style={{ background: `${CREAM}22` }} />
          <Link
            href="/recuerdos"
            className="text-xs uppercase tracking-[0.28em] transition-opacity duration-200 hover:opacity-70"
            style={{ color: GOLD }}
          >
            — Ver recuerdos
          </Link>
        </div>
      </section>

      <footer className="py-10 px-4 text-center" style={{ background: ESPRESSO, borderTop: `2px solid ${GOLD}44` }}>
        <p className="font-serif text-sm tracking-widest uppercase mb-1" style={{ color: `${CREAM}99` }}>En Tu Memoria</p>
        <p className="text-xs font-light" style={{ color: `${CREAM}44` }}>Siempre estarás en nuestros corazones</p>
      </footer>
    </div>
  );
}
