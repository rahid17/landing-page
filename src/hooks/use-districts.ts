"use client";
import { useState, useEffect, useCallback } from "react";
import { getDistricts, getActiveDistricts } from "@/services/districts";
import type { District } from "@/types";

export function useDistricts() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [activeDistricts, setActiveDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [all, active] = await Promise.all([
        getDistricts(),
        getActiveDistricts(),
      ]);
      setDistricts(all);
      setActiveDistricts(active);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load districts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { districts, activeDistricts, loading, error, refresh };
}
