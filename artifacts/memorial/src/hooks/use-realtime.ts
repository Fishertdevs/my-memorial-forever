import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

type TableName = "velas" | "recuerdos" | "testimonios" | "personas";

/**
 * Hook to subscribe to realtime changes on a Supabase table
 * and automatically invalidate the corresponding react-query cache
 */
export function useRealtimeSubscription(
  table: TableName,
  queryKeyPrefix: string[],
  enabled = true
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const supabase = getSupabase();
    if (!supabase) return;

    let channel: RealtimeChannel | null = null;

    try {
      channel = supabase
        .channel(`realtime-${table}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: table,
          },
          (payload) => {
            console.log(`[v0] Realtime ${table} change:`, payload.eventType);
            // Invalidate all queries that start with the prefix
            queryClient.invalidateQueries({
              predicate: (query) => {
                const key = query.queryKey;
                if (!Array.isArray(key)) return false;
                return queryKeyPrefix.every((prefix, index) => key[index] === prefix);
              },
            });
          }
        )
        .subscribe((status) => {
          console.log(`[v0] Realtime ${table} subscription status:`, status);
        });
    } catch (error) {
      console.warn(`[v0] Could not subscribe to ${table} realtime:`, error);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, queryClient, enabled, queryKeyPrefix.join(",")]);
}

/**
 * Hook to subscribe to multiple tables at once
 */
export function useRealtimeAll(enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const supabase = getSupabase();
    if (!supabase) {
      console.warn("[v0] Supabase not available, realtime disabled");
      return;
    }

    const channels: RealtimeChannel[] = [];
    const tables: TableName[] = ["velas", "recuerdos", "testimonios", "personas"];

    try {
      tables.forEach((table) => {
        const channel = supabase
          .channel(`realtime-all-${table}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: table,
            },
            (payload) => {
              console.log(`[v0] Realtime ${table} change:`, payload.eventType);
              // Invalidate all queries - simpler approach
              queryClient.invalidateQueries();
            }
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              console.log(`[v0] Subscribed to ${table} realtime`);
            }
          });

        channels.push(channel);
      });
    } catch (error) {
      console.warn("[v0] Could not subscribe to realtime:", error);
    }

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [queryClient, enabled]);
}
