import { Router } from "express";
import { db } from "@workspace/db";
import { testimoniosTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { CreateTestimonioBody, ListTestimoniosQueryParams } from "@workspace/api-zod";
import { timeAgo } from "./personas";

const router = Router();

router.get("/testimonios", async (req, res) => {
  const parsed = ListTestimoniosQueryParams.safeParse({
    limit: req.query.limit ? Number(req.query.limit) : 20,
    offset: req.query.offset ? Number(req.query.offset) : 0,
  });

  if (!parsed.success) {
    res.status(400).json({ error: "Parámetros inválidos" });
    return;
  }

  const { limit = 20, offset = 0 } = parsed.data;

  const testimonios = await db
    .select()
    .from(testimoniosTable)
    .orderBy(desc(testimoniosTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json(
    testimonios.map((t) => ({
      id: t.id,
      nombreAutor: t.nombreAutor,
      texto: t.texto,
      inicial: t.nombreAutor.charAt(0).toUpperCase(),
      createdAt: t.createdAt.toISOString(),
      tiempoTranscurrido: timeAgo(t.createdAt),
    }))
  );
});

router.post("/testimonios", async (req, res) => {
  const parsed = CreateTestimonioBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos", details: parsed.error.issues });
    return;
  }

  const [created] = await db
    .insert(testimoniosTable)
    .values({
      nombreAutor: parsed.data.nombreAutor,
      texto: parsed.data.texto,
    })
    .returning();

  res.status(201).json({
    id: created.id,
    nombreAutor: created.nombreAutor,
    texto: created.texto,
    inicial: created.nombreAutor.charAt(0).toUpperCase(),
    createdAt: created.createdAt.toISOString(),
    tiempoTranscurrido: timeAgo(created.createdAt),
  });
});

export default router;
