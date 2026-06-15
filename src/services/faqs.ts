import { supabase } from "@/lib/supabase";
import type { FAQ } from "@/types";

export async function getFAQs(): Promise<FAQ[]> {
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .order("order");
  if (error) throw error;
  return (data ?? []) as FAQ[];
}

export async function createFAQ(
  data: Omit<FAQ, "id">
): Promise<FAQ> {
  const { data: inserted, error } = await supabase
    .from("faqs")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return inserted as FAQ;
}

export async function updateFAQ(
  id: string,
  data: Partial<FAQ>
): Promise<void> {
  const { error } = await supabase
    .from("faqs")
    .update(data)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteFAQ(id: string): Promise<void> {
  const { error } = await supabase
    .from("faqs")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
