import { supabase } from "@/lib/supabase";
import type { PaymentSettings } from "@/types";

const defaultPaymentSettings: PaymentSettings = {
  id: "main",
  cod: { enabled: true },
  bkash: { enabled: false, number: "" },
  nagad: { enabled: false, number: "" },
  updatedAt: "",
};

function toPaymentSettings(row: Record<string, unknown>): PaymentSettings {
  return {
    id: row.id as string,
    cod: row.cod as PaymentSettings["cod"],
    bkash: row.bkash as PaymentSettings["bkash"],
    nagad: row.nagad as PaymentSettings["nagad"],
    updatedAt: row.updated_at as string,
  };
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const { data, error } = await supabase
    .from("payment_settings")
    .select("*")
    .eq("id", "main")
    .maybeSingle();
  if (error) throw error;
  if (!data) return { ...defaultPaymentSettings };
  return toPaymentSettings(data);
}

export async function updatePaymentSettings(
  data: Partial<PaymentSettings>
): Promise<void> {
  const updates: Record<string, unknown> = { ...data };
  delete updates.id;
  updates.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("payment_settings")
    .upsert({ id: "main", ...updates });
  if (error) throw error;
}
