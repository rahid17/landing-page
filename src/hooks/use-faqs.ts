"use client";
import { useState, useEffect, useCallback } from "react";
import { getFAQs } from "@/services/faqs";
import type { FAQ } from "@/types";

export function useFAQs() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFAQs();
      setFaqs(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { faqs, loading, error, refresh };
}
