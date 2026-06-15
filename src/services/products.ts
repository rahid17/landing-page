import { supabase } from "@/lib/supabase";
import type { Product } from "@/types";

function toProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: row.description as string,
    price: row.price as number,
    discountPrice: row.discount_price as number | undefined,
    images: row.images as string[],
    gallery: row.gallery as string[] | undefined,
    features: row.features as string[] | undefined,
    benefits: row.benefits as Product["benefits"] | undefined,
    stockStatus: row.stock_status as "in_stock" | "out_of_stock",
    active: row.active as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toSnakeProduct(data: Partial<Product>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (data.name !== undefined) result.name = data.name;
  if (data.slug !== undefined) result.slug = data.slug;
  if (data.description !== undefined) result.description = data.description;
  if (data.price !== undefined) result.price = data.price;
  if (data.discountPrice !== undefined) result.discount_price = data.discountPrice;
  if (data.images !== undefined) result.images = data.images;
  if (data.gallery !== undefined) result.gallery = data.gallery;
  if (data.features !== undefined) result.features = data.features;
  if (data.benefits !== undefined) result.benefits = data.benefits;
  if (data.stockStatus !== undefined) result.stock_status = data.stockStatus;
  if (data.active !== undefined) result.active = data.active;
  return result;
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toProduct);
}

export async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return toProduct(data);
}

export async function getActiveProduct(): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? toProduct(data) : null;
}

export async function createProduct(
  data: Omit<Product, "id" | "createdAt" | "updatedAt">
): Promise<Product> {
  const { data: inserted, error } = await supabase
    .from("products")
    .insert({
      ...toSnakeProduct(data),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return toProduct(inserted);
}

export async function updateProduct(
  id: string,
  data: Partial<Product>
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ ...toSnakeProduct(data), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function toggleProductActive(
  id: string,
  active: boolean
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
