import { Router } from "express";
import { db } from "@workspace/db";
import { recuerdosTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { CreateRecuerdoBody, ListRecuerdosQueryParams } from "@workspace/api-zod";
import { timeAgo } from "./personas";

const router = Router();

router.get("/recuerdos", async (req, res) => {
  const parsed = ListRecuerdosQueryParams.safeParse({
    personaId: req.query.personaId ? Number(req.query.personaId) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : 20,
    offset: req.query.offset ? Number(req.query.offset) : 0,
  });

  if (!parsed.success) {
    res.status(400).json({ error: "Parámetros inválidos" });
    return;
  }

  const { personaId, limit = 20, offset = 0 } = parsed.data;

  let query = db.select().from(recuerdosTable).orderBy(desc(recuerdosTable.createdAt)).$dynamic();
  if (personaId) {
    query = query.where(eq(recuerdosTable.personaId, personaId));
  }

  const recuerdos = await query.limit(limit).offset(offset);

  let countQuery = db.select({ count: sql<number>`count(*)::int` }).from(recuerdosTable).$dynamic();
  if (personaId) {
    countQuery = countQuery.where(eq(recuerdosTable.personaId, personaId));
  }
  const [{ count }] = await countQuery;

  res.json({
    data: recuerdos.map((r) => ({
      id: r.id,
      personaId: r.personaId,
      nombreAutor: r.nombreAutor,
      persona: r.persona,
      mensaje: r.mensaje,
      fotoUrl: r.fotoUrl,
      createdAt: r.createdAt.toISOString(),
      tiempoTranscurrido: timeAgo(r.createdAt),
    })),
    total: count,
  });
});

router.post("/recuerdos", async (req, res) => {
  const parsed = CreateRecuerdoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos", details: parsed.error.issues });
    return;
  }

  const [created] = await db
    .insert(recuerdosTable)
    .values({
      personaId: parsed.data.personaId ?? null,
      nombreAutor: parsed.data.nombreAutor,
      persona: parsed.data.persona ?? null,
      mensaje: parsed.data.mensaje,
      fotoUrl: parsed.data.fotoUrl ?? null,
    })
    .returning();

  res.status(201).json({
    id: created.id,
    personaId: created.personaId,
    nombreAutor: created.nombreAutor,
    persona: created.persona,
    mensaje: created.mensaje,
    fotoUrl: created.fotoUrl,
    createdAt: created.createdAt.toISOString(),
    tiempoTranscurrido: timeAgo(created.createdAt),
  });
});

export default router;
