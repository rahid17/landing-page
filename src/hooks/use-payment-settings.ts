"use client";
import { useState, useEffect, useCallback } from "react";
import { getPaymentSettings } from "@/services/payments";
import type { PaymentSettings } from "@/types";

export function usePaymentSettings() {
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPaymentSettings();
      setPaymentSettings(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load payment settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { paymentSettings, loading, error, refresh };
}
