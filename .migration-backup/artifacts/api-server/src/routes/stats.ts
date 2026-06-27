import { Router } from "express";
import { db } from "@workspace/db";
import { personasTable, velasTable, recuerdosTable, testimoniosTable } from "@workspace/db";
import { desc, sql, gte } from "drizzle-orm";
import { timeAgo } from "./personas";

const router = Router();

router.get("/stats", async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    [{ totalPersonas }],
    [{ totalVelas }],
    [{ totalRecuerdos }],
    [{ totalTestimonios }],
    [{ velasHoy }],
    recuerdosRecientes,
    velasRecientes,
  ] = await Promise.all([
    db.select({ totalPersonas: sql<number>`count(*)::int` }).from(personasTable),
    db.select({ totalVelas: sql<number>`count(*)::int` }).from(velasTable),
    db.select({ totalRecuerdos: sql<number>`count(*)::int` }).from(recuerdosTable),
    db.select({ totalTestimonios: sql<number>`count(*)::int` }).from(testimoniosTable),
    db
      .select({ velasHoy: sql<number>`count(*)::int` })
      .from(velasTable)
      .where(gte(velasTable.createdAt, today)),
    db.select().from(recuerdosTable).orderBy(desc(recuerdosTable.createdAt)).limit(5),
    db.select().from(velasTable).orderBy(desc(velasTable.createdAt)).limit(5),
  ]);

  res.json({
    totalPersonas,
    totalVelas,
    totalRecuerdos,
    totalTestimonios,
    velasHoy,
    recuerdosRecientes: recuerdosRecientes.map((r) => ({
      id: r.id,
      personaId: r.personaId,
      nombreAutor: r.nombreAutor,
      persona: r.persona,
      mensaje: r.mensaje,
      fotoUrl: r.fotoUrl,
      createdAt: r.createdAt.toISOString(),
      tiempoTranscurrido: timeAgo(r.createdAt),
    })),
    velasRecientes: velasRecientes.map((v) => ({
      id: v.id,
      personaId: v.personaId,
      nombreRecordado: v.nombreRecordado,
      nombreAutor: v.nombreAutor,
      mensaje: v.mensaje,
      createdAt: v.createdAt.toISOString(),
      tiempoTranscurrido: timeAgo(v.createdAt),
    })),
  });
});

export default router;
