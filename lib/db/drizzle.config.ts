import { defineConfig } from "drizzle-kit";
import path from "path";

// Use non-pooling URL for migrations (better for schema changes)
const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("POSTGRES_URL or DATABASE_URL must be set. Ensure the database is provisioned.");
}

// Append sslmode if not present for Supabase compatibility
const urlWithSsl = connectionString.includes('sslmode=') 
  ? connectionString 
  : `${connectionString}${connectionString.includes('?') ? '&' : '?'}sslmode=require`;

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: urlWithSsl,
    ssl: { rejectUnauthorized: false },
  },
});
