import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Get Supabase URL and anon key from environment variables
// Try multiple sources for compatibility
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  "";

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  "";

// Create a lazy-loaded Supabase client
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (_supabase) return _supabase;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[Supabase] Missing environment variables. Realtime features disabled.");
    return null;
  }
  
  _supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
  
  return _supabase;
}

// Export for backwards compatibility - may be null if env vars missing
export const supabase = getSupabase();

// Types for database tables
export type Persona = {
  id: number;
  nombre: string;
  fecha_nacimiento: string | null;
  fecha_fallecimiento: string | null;
  biografia: string | null;
  foto_principal: string | null;
  created_at: string;
};

export type Vela = {
  id: number;
  persona_id: number | null;
  nombre_recordado: string;
  nombre_autor: string;
  mensaje: string;
  color_id: string | null;
  created_at: string;
};

export type Recuerdo = {
  id: number;
  persona_id: number | null;
  nombre_autor: string;
  persona: string | null;
  mensaje: string;
  foto_url: string | null;
  created_at: string;
};

export type Testimonio = {
  id: number;
  nombre_autor: string;
  texto: string;
  created_at: string;
};
