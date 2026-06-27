import { Link } from "wouter";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import CandleFlame from "@/components/CandleFlame";

const ESPRESSO = "#1a0f07";
const GOLD = "#c9943a";
const CREAM = "#f5f0e8";

type PersonaHomenaje = {
  nombre: string;
  foto: string | null;
  historia: string;
};

const PERSONAS_HOMENAJE: PersonaHomenaje[] = [
  { 
    nombre: "Ana Soledad Lizarazo Calderón",   
    foto: "/foto-ana.jpg",
    historia: "Ana Soledad fue una mujer extraordinaria cuya luz iluminaba cada rincón donde estuviera presente. Su sonrisa cálida y su corazón generoso dejaron una huella imborrable en todos quienes tuvieron el privilegio de conocerla. Dedicó su vida a cuidar de los suyos con amor incondicional, enseñando con su ejemplo que la verdadera riqueza está en los pequeños gestos de bondad. Su sabiduría, transmitida en cada palabra y consejo, sigue guiando a quienes la amaron. Aunque ya no esté físicamente, su espíritu permanece vivo en cada recuerdo, en cada lección de vida que nos dejó, y en el amor infinito que sembró en nuestros corazones."
  },
  { 
    nombre: "Pablo Esteban Aguirre Camargo",   
    foto: "/foto-pablo.jpg",
    historia: "Pablo Esteban fue un joven lleno de sueños y esperanzas, cuya alegría contagiosa iluminaba la vida de todos a su alrededor. Su espíritu aventurero y su curiosidad por el mundo lo llevaron a descubrir la belleza en los detalles más simples de la vida. Con su risa sincera y su corazón noble, tejió lazos de amistad que perdurarán por siempre. Aunque su tiempo entre nosotros fue breve, el impacto de su presencia fue inmenso. Nos enseñó a vivir cada momento con intensidad, a valorar las pequeñas alegrías y a amar sin reservas. Su memoria vive en cada amanecer que él tanto disfrutaba contemplar."
  },
  { 
    nombre: "Carlos Alberto Camargo Munevar",  
    foto: "/foto-carlos.jpg",
    historia: "Carlos Alberto fue un hombre de principios inquebrantables y amor infinito por su familia. Su dedicación como esposo, padre y abuelo fue el pilar que sostuvo a quienes lo rodeaban. Trabajador incansable, demostró que con esfuerzo y honestidad se construyen los cimientos de una vida plena. Su voz serena y sus consejos sabios fueron faro en momentos de tormenta. Amante de las tradiciones, nos enseñó el valor de las raíces y la importancia de mantener unidos los lazos familiares. Hoy, su legado de amor, integridad y fortaleza continúa inspirando a las generaciones que le siguen. Descansa en paz, querido Carlos."
  },
];

function initials(nombre: string) {
  return nombre.split(" ").filter((_, i) => i < 2).map((p) => p[0]).join("").toUpperCase();
}

function HistoriaModal({ persona, onClose }: { persona: PersonaHomenaje; onClose: () => void }) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-8 sm:p-10"
        style={{ background: CREAM, border: `2px solid ${GOLD}44` }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:opacity-70"
          style={{ background: `${ESPRESSO}15`, color: ESPRESSO }}
          aria-label="Cerrar"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 1l12 12M13 1L1 13"/>
          </svg>
        </button>
        
        <h3 className="font-serif text-2xl sm:text-3xl text-center mb-6" style={{ color: ESPRESSO }}>
          {persona.nombre}
        </h3>
        
        <div className="h-px mb-6" style={{ background: `linear-gradient(90deg,transparent 0%,${GOLD}66 50%,transparent 100%)` }} />
        
        <p className="text-sm sm:text-base leading-relaxed text-center" style={{ color: `${ESPRESSO}88`, lineHeight: 1.9 }}>
          {persona.historia}
        </p>
        
        <div className="flex justify-center mt-8">
          <CandleFlame size="md" outerColor={GOLD} innerColor="#e8c060" glowColor="rgba(201,148,58,0.35)" />
        </div>
        
        <p className="text-xs italic text-center mt-4" style={{ color: `${ESPRESSO}50` }}>
          "Siempre en nuestros corazones"
        </p>
      </div>
    </div>
  );
}

function PhotoWithCandle({ nombre, foto, maxW = 200, onClick }: { nombre: string; foto: string | null; maxW?: number; onClick?: () => void }) {
  return (
    <div className="flex flex-row items-end justify-center gap-3">
      <button
        type="button"
        onClick={onClick}
        className="transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{
          width: maxW,
          aspectRatio: "3/4",
          borderRadius: "2.2rem 0.7rem 2.2rem 0.7rem",
          overflow: "hidden",
          boxShadow: `0 0 0 3px ${ESPRESSO}, 0 0 0 5px ${GOLD}44`,
          background: "#2a1a0e",
          flexShrink: 0,
          cursor: onClick ? "pointer" : "default",
          border: "none",
          padding: 0,
        }}
        aria-label={`Ver historia de ${nombre}`}
      >
        {foto ? (
          <img src={foto} alt={nombre} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
        ) : (
          <div className="flex items-center justify-center w-full h-full font-serif" style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", color: `${GOLD}66`, userSelect: "none" }}>
            {initials(nombre)}
          </div>
        )}
      </button>
      <div className="flex-shrink-0 pb-3">
        <CandleFlame size="sm" outerColor={GOLD} innerColor="#e8c060" glowColor="rgba(201,148,58,0.35)" />
      </div>
    </div>
  );
}

function PersonaCard({ persona, delay, onSelect }: { persona: PersonaHomenaje; delay: number; onSelect: () => void }) {
  return (
    <div className="flex flex-col items-center text-center hero-enter-1" style={{ animationDelay: `${delay}s`, flex: "1 1 0", minWidth: 0 }}>
      <h2 className="font-serif leading-snug mb-5" style={{ fontSize: "clamp(1rem,2vw,1.45rem)", color: CREAM, minHeight: "3.5em", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {persona.nombre}
      </h2>
      <PhotoWithCandle nombre={persona.nombre} foto={persona.foto} onClick={onSelect} />
    </div>
  );
}

function HeroCarousel({ onSelectPersona }: { onSelectPersona: (persona: PersonaHomenaje) => void }) {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const total = PERSONAS_HOMENAJE.length;

  useEffect(() => {
    const t = setInterval(() => { setCurrent((c) => (c + 1) % total); setAnimKey((k) => k + 1); }, 3500);
    return () => clearInterval(t);
  }, [total]);

  const persona = PERSONAS_HOMENAJE[current];

  return (
    <div className="flex flex-col items-center w-full">
      <div key={animKey} className="flex flex-col items-center text-center w-full hero-enter-1" style={{ animationDelay: "0s" }}>
        <h2 className="font-serif leading-snug mb-6" style={{ fontSize: "clamp(1.3rem,6vw,1.9rem)", color: CREAM, minHeight: "2.8em", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {persona.nombre}
        </h2>
        <PhotoWithCandle nombre={persona.nombre} foto={persona.foto} maxW={190} onClick={() => onSelectPersona(persona)} />
      </div>
      <div className="flex gap-2 mt-8">
        {PERSONAS_HOMENAJE.map((_, i) => (
          <div key={i} style={{ width: i === current ? 20 : 7, height: 7, borderRadius: 4, background: i === current ? GOLD : `${GOLD}44`, transition: "width 0.35s ease" }} />
        ))}
      </div>
    </div>
  );
}

function HeroSection() {
  const [selectedPersona, setSelectedPersona] = useState<PersonaHomenaje | null>(null);

  return (
    <>
      <section style={{ background: ESPRESSO, borderBottom: `1px solid rgba(201,148,58,0.18)` }}>
        <div className="max-w-5xl mx-auto flex flex-col items-center px-6" style={{ paddingTop: "4.5rem", paddingBottom: "4rem" }}>
          <span className="block mb-10 text-xs uppercase tracking-[0.32em]" style={{ color: GOLD }}>En conmemoración a</span>
          <div className="sm:hidden w-full flex flex-col items-center">
            <HeroCarousel onSelectPersona={setSelectedPersona} />
          </div>
          <div className="hidden sm:flex flex-row items-start justify-center gap-8 sm:gap-14 w-full">
            {PERSONAS_HOMENAJE.map((persona, i) => (
              <PersonaCard key={persona.nombre} persona={persona} delay={i * 0.15} onSelect={() => setSelectedPersona(persona)} />
            ))}
          </div>
          <p className="mt-10 text-xs italic text-center" style={{ color: `${CREAM}66`, maxWidth: 360, lineHeight: 1.85 }}>
            "Que sus almas descansen en la paz del Señor y su luz brille eternamente."
          </p>
        </div>
      </section>
      {selectedPersona && (
        <HistoriaModal persona={selectedPersona} onClose={() => setSelectedPersona(null)} />
      )}
    </>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: CREAM, color: ESPRESSO }}>
      <Navbar />
      <HeroSection />

      <section className="py-24 px-4 text-center" style={{ background: CREAM }}>
        <p style={{ color: `${ESPRESSO}88`, maxWidth: 680 }} className="mx-auto leading-relaxed text-sm">
          Hoy y siempre, su luz permanece con nosotros, iluminando los momentos que compartimos, las risas que aún resuenan en el alma y el amor inmenso que dejó sembrado en cada corazón.
          Aunque el tiempo avance, su presencia sigue siendo abrigo, guía y ternura; un recuerdo eterno que nos invita a vivir con gratitud, a amar con profundidad y a honrar su legado con cada gesto de cariño.
          Porque quienes amamos de verdad no se van del todo: viven en las palabras que nos enseñaron, en los valores que sembraron, en la forma en que miramos el mundo y elegimos ser mejores personas cada día.
          Su memoria es un faro que no se apaga, una voz suave que nos acompaña en cada paso del camino, recordándonos que el amor verdadero trasciende el tiempo y permanece para siempre en el corazón de quienes tuvieron la dicha de conocerle.
          <span className="block mt-5 text-xs uppercase tracking-[0.28em]" style={{ color: GOLD }}>— Eclesiastés 3:1</span>
        </p>
      </section>

      <div className="px-4">
        <div className="max-w-5xl mx-auto h-px" style={{ background: `linear-gradient(90deg,transparent 0%,${GOLD}66 50%,transparent 100%)` }} />
      </div>

      <section className="py-24 px-4 text-center" style={{ background: ESPRESSO }}>
        <h2 className="font-serif text-4xl mb-3" style={{ color: CREAM }}>Siempre en nuestro corazón</h2>
        <p className="mb-10 max-w-md mx-auto leading-relaxed text-sm" style={{ color: `${CREAM}55` }}>
          Cada recuerdo compartido es una forma de mantener viva su luz para siempre.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
          <Link href="/personas" className="text-xs uppercase tracking-[0.28em] transition-opacity hover:opacity-70" style={{ color: GOLD }}>— Enciende tu velita</Link>
          <span className="hidden sm:block w-px h-4" style={{ background: `${CREAM}22` }} />
          <Link href="/galeria" className="text-xs uppercase tracking-[0.28em] transition-opacity hover:opacity-70" style={{ color: GOLD }}>— Ver galería</Link>
        </div>
      </section>

      <footer className="py-10 px-4 text-center" style={{ borderTop: `2px solid ${GOLD}33`, background: ESPRESSO }}>
        <p className="font-serif text-sm tracking-widest uppercase mb-1" style={{ color: CREAM }}>En Tu Memoria</p>
        <p className="text-xs font-light" style={{ color: `${CREAM}45` }}>Siempre estarás en nuestros corazones</p>
      </footer>
    </div>
  );
}
