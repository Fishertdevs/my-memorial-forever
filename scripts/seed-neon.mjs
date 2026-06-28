import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pg = require(path.resolve(__dirname, "../node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/index.js"));
const { Client } = pg;

const url = process.env.NEON_DATABASE_URL;
if (!url) { console.error("NEON_DATABASE_URL not set"); process.exit(1); }

const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();
console.log("Conectado a Neon ✓");

await client.query(`
  CREATE TABLE IF NOT EXISTS personas (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    fecha_nacimiento VARCHAR(20),
    fecha_fallecimiento VARCHAR(20),
    biografia TEXT,
    foto_principal TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
  );
  CREATE TABLE IF NOT EXISTS velas (
    id SERIAL PRIMARY KEY,
    persona_id INTEGER REFERENCES personas(id),
    nombre_recordado TEXT NOT NULL,
    nombre_autor TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    color_id VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
  );
  CREATE TABLE IF NOT EXISTS recuerdos (
    id SERIAL PRIMARY KEY,
    persona_id INTEGER REFERENCES personas(id),
    nombre_autor TEXT NOT NULL,
    persona TEXT,
    mensaje TEXT NOT NULL,
    foto_url TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
  );
  CREATE TABLE IF NOT EXISTS testimonios (
    id SERIAL PRIMARY KEY,
    nombre_autor TEXT NOT NULL,
    texto TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
  );
`);

const { rows: existing } = await client.query("SELECT COUNT(*) FROM personas");
console.log("Personas existentes:", existing[0].count);

if (parseInt(existing[0].count) === 0) {
  const { rows: personas } = await client.query(`
    INSERT INTO personas (nombre, fecha_nacimiento, fecha_fallecimiento, biografia, foto_principal) VALUES
    ('Ana Soledad Lizarazo Calderón','1948-03-12','2024-01-15',
     'Ana Soledad fue una mujer extraordinaria cuya luz iluminaba cada rincón donde estuviera presente. Su sonrisa cálida y su corazón generoso dejaron una huella imborrable en todos quienes tuvieron el privilegio de conocerla. Dedicó su vida a cuidar de los suyos con amor incondicional, enseñando con su ejemplo que la verdadera riqueza está en los pequeños gestos de bondad.',
     '/foto-ana.jpg'),
    ('Pablo Esteban Aguirre Camargo','1998-07-24','2023-11-08',
     'Pablo Esteban era una llama viva de energía, creatividad y amor por la vida. Su risa contagiosa y su espíritu aventurero llenaron de alegría cada espacio que habitó. Soñador incansable, dejó en quienes lo conocieron la certeza de que la vida debe vivirse con pasión y sin miedo.',
     '/foto-pablo.jpg'),
    ('Carlos Alberto Camargo Munevar','1955-11-03','2024-03-22',
     'Carlos Alberto fue un hombre de principios sólidos y corazón noble. Su sabiduría, adquirida con el paso de los años, fue siempre un faro de guía para su familia y amigos. Con paciencia y dedicación, construyó un legado de amor y respeto que pervivirá en la memoria de todos quienes lo amaron.',
     '/foto-carlos.jpg')
    RETURNING id, nombre
  `);
  console.log("Personas insertadas:", personas.map(p => p.nombre).join(", "));

  for (const p of personas) {
    await client.query(`
      INSERT INTO velas (persona_id, nombre_recordado, nombre_autor, mensaje, color_id) VALUES
      ($1,$2,'La Familia','Con todo nuestro amor, siempre en nuestros corazones.','amber'),
      ($1,$2,'Un amigo cercano','Tu recuerdo ilumina nuestros días.','rose'),
      ($1,$2,'Con cariño','Que tu alma descanse en paz eterna.','blue')
    `, [p.id, p.nombre]);
    await client.query(`
      INSERT INTO recuerdos (persona_id, nombre_autor, persona, mensaje) VALUES
      ($1,'La Familia',$2,'Cada día que pasa, tu presencia se siente más. Gracias por todo lo que nos diste.'),
      ($1,'Un amigo',$2,'Fuiste una luz en nuestras vidas. Te recordaremos siempre con una sonrisa.')
    `, [p.id, p.nombre]);
  }
  console.log("✓ Seed de Neon completado");
} else {
  console.log("Ya tiene datos — sin cambios");
}

await client.end();
