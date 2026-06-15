import { supabase } from "@/lib/supabase";
import type { AnalyticsEvent } from "@/types";

export type AnalyticsSummary = {
  totalVisitors: number;
  ctaClicks: number;
  ordersCount: number;
  conversionRate: number;
};

function toAnalyticsEvent(row: Record<string, unknown>): AnalyticsEvent {
  return {
    type: row.type as AnalyticsEvent["type"],
    timestamp: row.created_at as string,
    metadata: row.metadata as Record<string, unknown> | undefined,
  };
}

export async function logEvent(
  type: "page_view" | "cta_click" | "order",
  metadata?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase.from("analytics").insert({
    type,
    metadata: metadata ?? null,
    created_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function getAnalytics(
  startDate: Date,
  endDate: Date
): Promise<AnalyticsEvent[]> {
  const { data, error } = await supabase
    .from("analytics")
    .select("*")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toAnalyticsEvent);
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const events = await getAnalytics(thirtyDaysAgo, now);

  const totalVisitors = events.filter((e) => e.type === "page_view").length;
  const ctaClicks = events.filter((e) => e.type === "cta_click").length;
  const ordersCount = events.filter((e) => e.type === "order").length;
  const conversionRate =
    totalVisitors > 0 ? (ordersCount / totalVisitors) * 100 : 0;

  return { totalVisitors, ctaClicks, ordersCount, conversionRate };
}
