import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import type { AnalyticsEvent } from "@/types";

export type AnalyticsSummary = {
  totalVisitors: number;
  ctaClicks: number;
  ordersCount: number;
  conversionRate: number;
};

const COLLECTION = "analytics";

export async function logEvent(
  type: "page_view" | "cta_click" | "order",
  metadata?: Record<string, unknown>
): Promise<void> {
  await addDoc(collection(db, COLLECTION), {
    type,
    timestamp: serverTimestamp(),
    metadata: metadata ?? null,
  });
}

export async function getAnalytics(
  startDate: Date,
  endDate: Date
): Promise<AnalyticsEvent[]> {
  const q = query(
    collection(db, COLLECTION),
    where("timestamp", ">=", startDate),
    where("timestamp", "<=", endDate),
    orderBy("timestamp", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data()) as AnalyticsEvent[];
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  const events = snapshot.docs.map((d) => d.data()) as AnalyticsEvent[];

  const totalVisitors = events.filter((e) => e.type === "page_view").length;
  const ctaClicks = events.filter((e) => e.type === "cta_click").length;
  const ordersCount = events.filter((e) => e.type === "order").length;
  const conversionRate =
    totalVisitors > 0 ? (ordersCount / totalVisitors) * 100 : 0;

  return { totalVisitors, ctaClicks, ordersCount, conversionRate };
}
