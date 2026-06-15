import { supabase } from "@/lib/supabase";

export async function uploadImage(
  file: File,
  path: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from("images")
    .upload(path, file, { upsert: true });
  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("images")
    .getPublicUrl(data.path);
  return urlData.publicUrl;
}
