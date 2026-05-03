import { Link } from "wouter";
import { useListPersonas } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import CandleFlame from "@/components/CandleFlame";
import personaImg from "@assets/image_1777785665151.png";

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
  };
}) {
  return (
    <section className="bg-white" style={{ borderBottom: "1px solid #0d0d0d" }}>
      <div className="max-w-5xl mx-auto flex items-stretch" style={{ minHeight: 440 }}>
        {/* Text — centered vertically, centered horizontally */}
        <div className="flex flex-col justify-center items-center text-center px-8 sm:px-12 lg:px-16 flex-1" style={{ paddingTop: "5rem", paddingBottom: "3rem" }}>
          <span
            className="block mb-6 text-xs uppercase tracking-[0.28em]"
            style={{ color: "#f97316" }}
          >
            En conmemoración a
          </span>

          <h1
            className="font-serif leading-[1.05] mb-5"
            style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)", color: "#0d0d0d" }}
          >
            {persona.nombre}
          </h1>

          <div className="mb-5" style={{ width: 36, height: 2, background: "#f97316", borderRadius: 1 }} />

          {(persona.fechaNacimiento || persona.fechaFallecimiento) && (
            <p
              className="text-sm mb-4"
              style={{ color: "rgba(0,0,0,0.35)", letterSpacing: "0.04em" }}
            >
              {formatDateEs(persona.fechaNacimiento)}
              {persona.fechaNacimiento && persona.fechaFallecimiento && <span style={{ margin: "0 0.5em" }}>—</span>}
              {formatDateEs(persona.fechaFallecimiento)}
            </p>
          )}

          <p
            className="text-xs italic"
            style={{ color: "rgba(0,0,0,0.28)", maxWidth: 300, lineHeight: 1.8 }}
          >
            "Que su alma descanse en la paz del Señor y su luz brille eternamente."
          </p>
        </div>

        {/* Image + candle — right */}
        <div
          className="hidden sm:flex items-end justify-center flex-shrink-0 gap-4"
          style={{ width: 360, paddingTop: "5rem", paddingBottom: "2.5rem", paddingRight: "2.5rem", paddingLeft: "0.5rem" }}
        >
          {/* Candle beside the image */}
          <div className="flex-shrink-0 mb-2">
            <CandleFlame size="md" />
          </div>

          <img
            src={personaImg}
            alt={persona.nombre}
            style={{
              display: "block",
              width: 240,
              height: 290,
              objectFit: "cover",
              borderRadius: "2.5rem 0.8rem 2.5rem 0.8rem",
              boxShadow: "0 0 0 3px #fff, 0 0 0 5px #0d0d0d",
            }}
          />
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
