import { supabase } from "@/lib/supabase";
import type { Order, OrderItem, OrderStatus, DashboardStats } from "@/types";

function toOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    orderNumber: row.order_number as string,
    items: (row.items as OrderItem[]) ?? [],
    subtotal: row.subtotal as number,
    deliveryCharge: row.delivery_charge as number,
    total: row.total as number,
    customerName: row.customer_name as string,
    phone: row.phone as string,
    address: row.address as string,
    districtId: row.district_id as string,
    districtName: row.district_name as string,
    paymentMethod: row.payment_method as Order["paymentMethod"],
    transactionId: row.transaction_id as string | undefined,
    status: row.status as OrderStatus,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toOrder);
}

export async function getOrder(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return toOrder(data);
}

export async function getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toOrder);
}

export async function createOrder(
  data: Omit<Order, "id" | "orderNumber" | "status" | "createdAt" | "updatedAt">
): Promise<Order> {
  const orderNumber = `KT-${Date.now()}-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`;
  const { data: inserted, error } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      items: data.items,
      subtotal: data.subtotal,
      delivery_charge: data.deliveryCharge,
      total: data.total,
      customer_name: data.customerName,
      phone: data.phone,
      address: data.address,
      district_id: data.districtId,
      district_name: data.districtName,
      payment_method: data.paymentMethod,
      transaction_id: data.transactionId ?? null,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return toOrder(inserted);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteOrder(id: string): Promise<void> {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw error;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const orders = await getOrders();
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const confirmedOrders = orders.filter((o) => o.status === "confirmed").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const totalRevenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + o.total, 0);
  const recentOrders = orders.slice(0, 10);

  return {
    totalOrders,
    pendingOrders,
    confirmedOrders,
    deliveredOrders,
    totalRevenue,
    recentOrders,
  };
}
