import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase, type Vela, type Persona, type Recuerdo } from "@/lib/supabase";

function timeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "ahora";
  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays < 7) return `hace ${diffDays}d`;
  return past.toLocaleDateString("es");
}

// List personas
export function useListPersonas() {
  return useQuery({
    queryKey: ["personas"],
    queryFn: async () => {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");
      
      const { data, error } = await supabase
        .from("personas")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map((p: Persona) => ({
        id: p.id,
        nombre: p.nombre,
        fechaNacimiento: p.fecha_nacimiento,
        fechaFallecimiento: p.fecha_fallecimiento,
        biografia: p.biografia,
        fotoPrincipal: p.foto_principal,
        createdAt: p.created_at,
      }));
    },
  });
}

// List velas
export function useListVelas(params?: { personaId?: number; limit?: number }) {
  return useQuery({
    queryKey: ["velas", params],
    queryFn: async () => {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");
      
      let query = supabase
        .from("velas")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(params?.limit || 50);
      
      if (params?.personaId) {
        query = query.eq("persona_id", params.personaId);
      }
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        data: (data || []).map((v: Vela) => ({
          id: v.id,
          personaId: v.persona_id,
          nombreRecordado: v.nombre_recordado,
          nombreAutor: v.nombre_autor,
          mensaje: v.mensaje,
          colorId: v.color_id,
          createdAt: v.created_at,
          tiempoTranscurrido: timeAgo(v.created_at),
        })),
        total: count || 0,
      };
    },
  });
}

// Create vela
export function useCreateVela() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: {
      data: {
        personaId?: number;
        nombreRecordado: string;
        nombreAutor: string;
        mensaje: string;
        colorId?: string;
      };
    }) => {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");
      
      const { data, error } = await supabase
        .from("velas")
        .insert({
          persona_id: input.data.personaId || null,
          nombre_recordado: input.data.nombreRecordado,
          nombre_autor: input.data.nombreAutor,
          mensaje: input.data.mensaje,
          color_id: input.data.colorId || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        personaId: data.persona_id,
        nombreRecordado: data.nombre_recordado,
        nombreAutor: data.nombre_autor,
        mensaje: data.mensaje,
        colorId: data.color_id,
        createdAt: data.created_at,
        tiempoTranscurrido: timeAgo(data.created_at),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["velas"] });
    },
  });
}

// List recuerdos
export function useListRecuerdos(params?: { personaId?: number; limit?: number }) {
  return useQuery({
    queryKey: ["recuerdos", params],
    queryFn: async () => {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");
      
      let query = supabase
        .from("recuerdos")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(params?.limit || 50);
      
      if (params?.personaId) {
        query = query.eq("persona_id", params.personaId);
      }
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        data: (data || []).map((r: Recuerdo) => ({
          id: r.id,
          personaId: r.persona_id,
          nombreAutor: r.nombre_autor,
          persona: r.persona,
          mensaje: r.mensaje,
          fotoUrl: r.foto_url,
          createdAt: r.created_at,
          tiempoTranscurrido: timeAgo(r.created_at),
        })),
        total: count || 0,
      };
    },
  });
}

// Create recuerdo
export function useCreateRecuerdo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: {
      data: {
        personaId?: number;
        nombreAutor: string;
        persona?: string;
        mensaje: string;
        fotoUrl?: string;
      };
    }) => {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");
      
      const { data, error } = await supabase
        .from("recuerdos")
        .insert({
          persona_id: input.data.personaId || null,
          nombre_autor: input.data.nombreAutor,
          persona: input.data.persona || null,
          mensaje: input.data.mensaje,
          foto_url: input.data.fotoUrl || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        personaId: data.persona_id,
        nombreAutor: data.nombre_autor,
        persona: data.persona,
        mensaje: data.mensaje,
        fotoUrl: data.foto_url,
        createdAt: data.created_at,
        tiempoTranscurrido: timeAgo(data.created_at),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recuerdos"] });
    },
  });
}

// Get single persona
export function useGetPersona(id: number) {
  return useQuery({
    queryKey: ["persona", id],
    queryFn: async () => {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");
      
      const { data, error } = await supabase
        .from("personas")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        nombre: data.nombre,
        fechaNacimiento: data.fecha_nacimiento,
        fechaFallecimiento: data.fecha_fallecimiento,
        biografia: data.biografia,
        fotoPrincipal: data.foto_principal,
        createdAt: data.created_at,
      };
    },
    enabled: !!id,
  });
}

// List testimonios
export function useListTestimonios(params?: { limit?: number }) {
  return useQuery({
    queryKey: ["testimonios", params],
    queryFn: async () => {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");
      
      const { data, error } = await supabase
        .from("testimonios")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(params?.limit || 30);
      
      if (error) throw error;
      
      return (data || []).map((t) => ({
        id: t.id,
        nombreAutor: t.nombre_autor,
        texto: t.texto,
        createdAt: t.created_at,
        tiempoTranscurrido: timeAgo(t.created_at),
        inicial: t.nombre_autor?.charAt(0)?.toUpperCase() || "?",
      }));
    },
  });
}

// Create testimonio
export function useCreateTestimonio() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: {
      data: {
        nombreAutor: string;
        texto: string;
      };
    }) => {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");
      
      const { data, error } = await supabase
        .from("testimonios")
        .insert({
          nombre_autor: input.data.nombreAutor,
          texto: input.data.texto,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        nombreAutor: data.nombre_autor,
        texto: data.texto,
        createdAt: data.created_at,
        tiempoTranscurrido: timeAgo(data.created_at),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonios"] });
    },
  });
}

// Query key helpers for invalidation
export const getListVelasQueryKey = (params?: { personaId?: number; limit?: number }) => 
  ["velas", params] as const;

export const getListRecuerdosQueryKey = (params?: { personaId?: number; limit?: number }) => 
  ["recuerdos", params] as const;

export const getListTestimoniosQueryKey = (params?: { limit?: number }) => 
  ["testimonios", params] as const;

export const getGetPersonaQueryKey = (id: number) => 
  ["persona", id] as const;
