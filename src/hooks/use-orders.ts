"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { getOrders, getDashboardStats, getOrdersByStatus } from "@/services/orders";
import type { Order, DashboardStats, OrderStatus } from "@/types";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersData, statsData] = await Promise.all([
        getOrders(),
        getDashboardStats(),
      ]);
      setOrders(ordersData);
      setStats(statsData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { orders, stats, loading, error, refresh };
}

export function useOrdersByStatus(status: OrderStatus) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrdersByStatus(status);
      setOrders(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { orders, loading, error, refresh };
}
