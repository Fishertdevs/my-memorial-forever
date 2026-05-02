import { Router } from "express";
import { db } from "@workspace/db";
import { velasTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { CreateVelaBody, ListVelasQueryParams } from "@workspace/api-zod";
import { timeAgo } from "./personas";

const router = Router();

router.get("/velas", async (req, res) => {
  const parsed = ListVelasQueryParams.safeParse({
    personaId: req.query.personaId ? Number(req.query.personaId) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : 20,
    offset: req.query.offset ? Number(req.query.offset) : 0,
  });

  if (!parsed.success) {
    res.status(400).json({ error: "Parámetros inválidos" });
    return;
  }

  const { personaId, limit = 20, offset = 0 } = parsed.data;

  let query = db.select().from(velasTable).orderBy(desc(velasTable.createdAt)).$dynamic();
  if (personaId) {
    query = query.where(eq(velasTable.personaId, personaId));
  }

  const velas = await query.limit(limit).offset(offset);

  let countQuery = db.select({ count: sql<number>`count(*)::int` }).from(velasTable).$dynamic();
  if (personaId) {
    countQuery = countQuery.where(eq(velasTable.personaId, personaId));
  }
  const [{ count }] = await countQuery;

  res.json({
    data: velas.map((v) => ({
      id: v.id,
      personaId: v.personaId,
      nombreRecordado: v.nombreRecordado,
      nombreAutor: v.nombreAutor,
      mensaje: v.mensaje,
      createdAt: v.createdAt.toISOString(),
      tiempoTranscurrido: timeAgo(v.createdAt),
    })),
    total: count,
  });
});

router.post("/velas", async (req, res) => {
  const parsed = CreateVelaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos", details: parsed.error.issues });
    return;
  }

  const [created] = await db
    .insert(velasTable)
    .values({
      personaId: parsed.data.personaId ?? null,
      nombreRecordado: parsed.data.nombreRecordado,
      nombreAutor: parsed.data.nombreAutor,
      mensaje: parsed.data.mensaje,
    })
    .returning();

  res.status(201).json({
    id: created.id,
    personaId: created.personaId,
    nombreRecordado: created.nombreRecordado,
    nombreAutor: created.nombreAutor,
    mensaje: created.mensaje,
    createdAt: created.createdAt.toISOString(),
    tiempoTranscurrido: timeAgo(created.createdAt),
  });
});

export default router;
