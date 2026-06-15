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
  limit,
} from "firebase/firestore";
import type { Product } from "@/types";

const COLLECTION = "products";

export async function getProducts(): Promise<Product[]> {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
}

export async function getActiveProduct(): Promise<Product | null> {
  const q = query(
    collection(db, COLLECTION),
    where("active", "==", true),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() } as Product;
}

export async function createProduct(
  data: Omit<Product, "id" | "createdAt" | "updatedAt">
): Promise<Product> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return {
    id: docRef.id,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as Product;
}

export async function updateProduct(
  id: string,
  data: Partial<Product>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function toggleProductActive(
  id: string,
  active: boolean
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    active,
    updatedAt: serverTimestamp(),
  });
}
