import { supabaseServer } from "./supabase-server";

export async function getBrandName(): Promise<string> {
  try {
    const { data } = await supabaseServer
      .from("landing_content")
      .select("footer")
      .eq("id", "main")
      .maybeSingle();

    if (data) {
      const footer = data.footer as Record<string, unknown> | undefined;
      const name = (footer?.brand_name as string) || (footer?.brandName as string);
      if (name) return name;
    }
  } catch {
    // Fallback silently
  }

  return "Organic Mehendi";
}
