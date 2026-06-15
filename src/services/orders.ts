import { supabase } from "@/lib/supabase";
import type { Order, OrderStatus, DashboardStats } from "@/types";

function toOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    orderNumber: row.order_number as string,
    productId: row.product_id as string,
    productName: row.product_name as string,
    quantity: row.quantity as number,
    price: row.price as number,
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

function toSnakeOrder(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (data.orderNumber !== undefined) result.order_number = data.orderNumber;
  if (data.productId !== undefined) result.product_id = data.productId;
  if (data.productName !== undefined) result.product_name = data.productName;
  if (data.quantity !== undefined) result.quantity = data.quantity;
  if (data.price !== undefined) result.price = data.price;
  if (data.subtotal !== undefined) result.subtotal = data.subtotal;
  if (data.deliveryCharge !== undefined) result.delivery_charge = data.deliveryCharge;
  if (data.total !== undefined) result.total = data.total;
  if (data.customerName !== undefined) result.customer_name = data.customerName;
  if (data.phone !== undefined) result.phone = data.phone;
  if (data.address !== undefined) result.address = data.address;
  if (data.districtId !== undefined) result.district_id = data.districtId;
  if (data.districtName !== undefined) result.district_name = data.districtName;
  if (data.paymentMethod !== undefined) result.payment_method = data.paymentMethod;
  if (data.transactionId !== undefined) result.transaction_id = data.transactionId;
  if (data.status !== undefined) result.status = data.status;
  return result;
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

export async function getOrdersByStatus(
  status: OrderStatus
): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toOrder);
}

export async function createOrder(
  data: Omit<
    Order,
    "id" | "orderNumber" | "status" | "createdAt" | "updatedAt"
  >
): Promise<Order> {
  const orderNumber = `KT-${Date.now()}-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`;
  const { data: inserted, error } = await supabase
    .from("orders")
    .insert({
      ...toSnakeOrder(data as unknown as Record<string, unknown>),
      order_number: orderNumber,
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
  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const orders = (data ?? []).map(toOrder);

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const confirmedOrders = orders.filter(
    (o) => o.status === "confirmed"
  ).length;
  const deliveredOrders = orders.filter(
    (o) => o.status === "delivered"
  ).length;
  const totalRevenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + o.total, 0);

  const recentOrders = orders.slice(0, 10);

  return {
    totalOrders: orders.length,
    pendingOrders,
    confirmedOrders,
    deliveredOrders,
    totalRevenue,
    recentOrders,
  };
}
