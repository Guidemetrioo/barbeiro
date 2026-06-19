import { createClient } from "@supabase/supabase-js";

let supabaseInstance: any = null;

export function getSupabase() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co";
    
    let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    if (!supabaseKey || supabaseKey.includes("placeholder")) {
      supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    }
    
    if (!supabaseKey || supabaseKey.includes("placeholder") || supabaseUrl.includes("your-project")) {
      console.log("ℹ️ Supabase não configurado ou contendo credenciais padrão. Rodando no modo local (Mock).");
      supabaseInstance = {
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: new Error("Mock mode") }),
              single: () => Promise.resolve({ data: null, error: new Error("Mock mode") })
            }),
            in: () => ({
              gte: () => ({
                lte: () => Promise.resolve({ data: null, error: new Error("Mock mode") })
              })
            })
          }),
          insert: () => Promise.resolve({ error: new Error("Mock mode") }),
          update: () => ({
            eq: () => Promise.resolve({ error: new Error("Mock mode") })
          }),
          upsert: () => Promise.resolve({ error: new Error("Mock mode") })
        })
      };
    } else {
      supabaseInstance = createClient(supabaseUrl, supabaseKey);
    }
  }
  return supabaseInstance;
}
