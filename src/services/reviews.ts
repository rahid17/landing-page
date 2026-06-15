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
  serverTimestamp,
} from "firebase/firestore";
import type { Review } from "@/types";

const COLLECTION = "reviews";

export async function getReviews(): Promise<Review[]> {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Review);
}

export async function createReview(
  data: Omit<Review, "id" | "createdAt">
): Promise<Review> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return {
    id: docRef.id,
    ...data,
    createdAt: new Date().toISOString(),
  } as Review;
}

export async function updateReview(
  id: string,
  data: Partial<Review>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteReview(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
