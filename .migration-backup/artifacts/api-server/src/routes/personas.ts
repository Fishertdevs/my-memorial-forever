import { Router } from "express";
import { db } from "@workspace/db";
import { personasTable, velasTable, recuerdosTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { CreatePersonaBody, GetPersonaParams } from "@workspace/api-zod";

const router = Router();

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffMonths / 12);

  if (diffSecs < 60) return "hace un momento";
  if (diffMins < 60) return `hace ${diffMins} minuto${diffMins !== 1 ? "s" : ""}`;
  if (diffHours < 24) return `hace ${diffHours} hora${diffHours !== 1 ? "s" : ""}`;
  if (diffDays < 30) return `hace ${diffDays} día${diffDays !== 1 ? "s" : ""}`;
  if (diffMonths < 12) return `hace ${diffMonths} mes${diffMonths !== 1 ? "es" : ""}`;
  return `hace ${diffYears} año${diffYears !== 1 ? "s" : ""}`;
}

router.get("/personas", async (req, res) => {
  const personas = await db.select().from(personasTable).orderBy(desc(personasTable.createdAt));

  const result = await Promise.all(
    personas.map(async (p) => {
      const [velaCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(velasTable)
        .where(eq(velasTable.personaId, p.id));
      const [recuerdoCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(recuerdosTable)
        .where(eq(recuerdosTable.personaId, p.id));

      return {
        id: p.id,
        nombre: p.nombre,
        fechaNacimiento: p.fechaNacimiento,
        fechaFallecimiento: p.fechaFallecimiento,
        biografia: p.biografia,
        fotoPrincipal: p.fotoPrincipal,
        totalVelas: velaCount.count,
        totalRecuerdos: recuerdoCount.count,
        createdAt: p.createdAt.toISOString(),
      };
    })
  );

  res.json(result);
});

router.post("/personas", async (req, res) => {
  const parsed = CreatePersonaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos", details: parsed.error.issues });
    return;
  }

  const [created] = await db
    .insert(personasTable)
    .values({
      nombre: parsed.data.nombre,
      fechaNacimiento: parsed.data.fechaNacimiento ?? null,
      fechaFallecimiento: parsed.data.fechaFallecimiento ?? null,
      biografia: parsed.data.biografia ?? null,
      fotoPrincipal: parsed.data.fotoPrincipal ?? null,
    })
    .returning();

  res.status(201).json({
    id: created.id,
    nombre: created.nombre,
    fechaNacimiento: created.fechaNacimiento,
    fechaFallecimiento: created.fechaFallecimiento,
    biografia: created.biografia,
    fotoPrincipal: created.fotoPrincipal,
    totalVelas: 0,
    totalRecuerdos: 0,
    createdAt: created.createdAt.toISOString(),
  });
});

router.get("/personas/:id", async (req, res) => {
  const parsed = GetPersonaParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }

  const [persona] = await db
    .select()
    .from(personasTable)
    .where(eq(personasTable.id, parsed.data.id));

  if (!persona) {
    res.status(404).json({ error: "Persona no encontrada" });
    return;
  }

  const [velaCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(velasTable)
    .where(eq(velasTable.personaId, persona.id));
  const [recuerdoCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(recuerdosTable)
    .where(eq(recuerdosTable.personaId, persona.id));

  res.json({
    id: persona.id,
    nombre: persona.nombre,
    fechaNacimiento: persona.fechaNacimiento,
    fechaFallecimiento: persona.fechaFallecimiento,
    biografia: persona.biografia,
    fotoPrincipal: persona.fotoPrincipal,
    totalVelas: velaCount.count,
    totalRecuerdos: recuerdoCount.count,
    createdAt: persona.createdAt.toISOString(),
  });
});

export { timeAgo };
export default router;
