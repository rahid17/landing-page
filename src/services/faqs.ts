import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import type { FAQ } from "@/types";

const COLLECTION = "faqs";

export async function getFAQs(): Promise<FAQ[]> {
  const q = query(collection(db, COLLECTION), orderBy("order", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as FAQ);
}

export async function createFAQ(
  data: Omit<FAQ, "id">
): Promise<FAQ> {
  const docRef = await addDoc(collection(db, COLLECTION), data);
  return { id: docRef.id, ...data } as FAQ;
}

export async function updateFAQ(
  id: string,
  data: Partial<FAQ>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteFAQ(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
