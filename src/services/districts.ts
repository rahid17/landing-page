import { supabase } from "@/lib/supabase";
import type { District } from "@/types";

function toDistrict(row: Record<string, unknown>): District {
  return {
    id: row.id as string,
    name: row.name as string,
    deliveryCharge: row.delivery_charge as number,
    active: row.active as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getDistricts(): Promise<District[]> {
  const { data, error } = await supabase
    .from("districts")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data ?? []).map(toDistrict);
}

export async function getActiveDistricts(): Promise<District[]> {
  const { data, error } = await supabase
    .from("districts")
    .select("*")
    .eq("active", true)
    .order("name");
  if (error) throw error;
  return (data ?? []).map(toDistrict);
}

export async function createDistrict(
  data: Omit<District, "id" | "createdAt" | "updatedAt">
): Promise<District> {
  const { data: inserted, error } = await supabase
    .from("districts")
    .insert({
      name: data.name,
      delivery_charge: data.deliveryCharge,
      active: data.active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return toDistrict(inserted);
}

export async function updateDistrict(
  id: string,
  data: Partial<District>
): Promise<void> {
  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.deliveryCharge !== undefined) updates.delivery_charge = data.deliveryCharge;
  if (data.active !== undefined) updates.active = data.active;
  updates.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("districts")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteDistrict(id: string): Promise<void> {
  const { error } = await supabase
    .from("districts")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function toggleDistrictActive(
  id: string,
  active: boolean
): Promise<void> {
  const { error } = await supabase
    .from("districts")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
