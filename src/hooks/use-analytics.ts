"use client";
import { useState, useEffect, useCallback } from "react";
import { getAnalyticsSummary, type AnalyticsSummary } from "@/services/analytics";

export function useAnalytics() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAnalyticsSummary();
      setSummary(data);
    } catch {
      // silently fail for analytics
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { summary, loading };
}
