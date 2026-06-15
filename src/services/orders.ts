import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";
import type { Order, OrderStatus, DashboardStats } from "@/types";

const COLLECTION = "orders";

export async function getOrders(): Promise<Order[]> {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
}

export async function getOrder(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
}

export async function getOrdersByStatus(
  status: OrderStatus
): Promise<Order[]> {
  const q = query(
    collection(db, COLLECTION),
    where("status", "==", status),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
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
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    orderNumber,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return {
    id: docRef.id,
    ...data,
    orderNumber,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as Order;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteOrder(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  const orders = snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Order
  );

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

  const recentOrders = orders
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 10);

  return {
    totalOrders: orders.length,
    pendingOrders,
    confirmedOrders,
    deliveredOrders,
    totalRevenue,
    recentOrders,
  };
}
