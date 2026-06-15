"use client";
import { useState, useEffect, useCallback } from "react";
import { getLandingContent } from "@/services/landing-content";
import type { LandingContent } from "@/types";

export function useLandingContent() {
  const [content, setContent] = useState<LandingContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLandingContent();
      setContent(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load landing content");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { content, loading, error, refresh };
}
