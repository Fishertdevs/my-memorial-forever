import { pgTable, serial, text, timestamp, integer, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const personasTable = pgTable("personas", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  fechaNacimiento: varchar("fecha_nacimiento", { length: 20 }),
  fechaFallecimiento: varchar("fecha_fallecimiento", { length: 20 }),
  biografia: text("biografia"),
  fotoPrincipal: text("foto_principal"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPersonaSchema = createInsertSchema(personasTable).omit({ id: true, createdAt: true });
export type InsertPersona = z.infer<typeof insertPersonaSchema>;
export type Persona = typeof personasTable.$inferSelect;

export const velasTable = pgTable("velas", {
  id: serial("id").primaryKey(),
  personaId: integer("persona_id").references(() => personasTable.id),
  nombreRecordado: text("nombre_recordado").notNull(),
  nombreAutor: text("nombre_autor").notNull(),
  mensaje: text("mensaje").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVelaSchema = createInsertSchema(velasTable).omit({ id: true, createdAt: true });
export type InsertVela = z.infer<typeof insertVelaSchema>;
export type Vela = typeof velasTable.$inferSelect;

export const recuerdosTable = pgTable("recuerdos", {
  id: serial("id").primaryKey(),
  personaId: integer("persona_id").references(() => personasTable.id),
  nombreAutor: text("nombre_autor").notNull(),
  persona: text("persona"),
  mensaje: text("mensaje").notNull(),
  fotoUrl: text("foto_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRecuerdoSchema = createInsertSchema(recuerdosTable).omit({ id: true, createdAt: true });
export type InsertRecuerdo = z.infer<typeof insertRecuerdoSchema>;
export type Recuerdo = typeof recuerdosTable.$inferSelect;

export const testimoniosTable = pgTable("testimonios", {
  id: serial("id").primaryKey(),
  nombreAutor: text("nombre_autor").notNull(),
  texto: text("texto").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTestimonioSchema = createInsertSchema(testimoniosTable).omit({ id: true, createdAt: true });
export type InsertTestimonio = z.infer<typeof insertTestimonioSchema>;
export type Testimonio = typeof testimoniosTable.$inferSelect;
