import { supabase } from "@/lib/supabase";
import type { Review } from "@/types";

function toReview(row: Record<string, unknown>): Review {
  return {
    id: row.id as string,
    customerName: row.customer_name as string,
    photoURL: (row.photo_url || row.photoURL) as string | undefined,
    text: row.text as string,
    rating: row.rating as number,
    createdAt: row.created_at as string,
  };
}

export async function getReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toReview);
}

export async function createReview(
  data: Omit<Review, "id" | "createdAt">
): Promise<Review> {
  const { data: inserted, error } = await supabase
    .from("reviews")
    .insert({
      customer_name: data.customerName,
      photo_url: data.photoURL ?? null,
      text: data.text,
      rating: data.rating,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return toReview(inserted);
}

export async function updateReview(
  id: string,
  data: Partial<Review>
): Promise<void> {
  const updates: Record<string, unknown> = {};
  if (data.customerName !== undefined) updates.customer_name = data.customerName;
  if (data.photoURL !== undefined) updates.photo_url = data.photoURL;
  if (data.text !== undefined) updates.text = data.text;
  if (data.rating !== undefined) updates.rating = data.rating;

  const { error } = await supabase
    .from("reviews")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
