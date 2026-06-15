import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import type { District } from "@/types";

const COLLECTION = "districts";

export async function getDistricts(): Promise<District[]> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as District);
}

export async function getActiveDistricts(): Promise<District[]> {
  const q = query(collection(db, COLLECTION), where("active", "==", true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as District);
}

export async function createDistrict(
  data: Omit<District, "id" | "createdAt" | "updatedAt">
): Promise<District> {
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
  } as District;
}

export async function updateDistrict(
  id: string,
  data: Partial<District>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDistrict(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function toggleDistrictActive(
  id: string,
  active: boolean
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    active,
    updatedAt: serverTimestamp(),
  });
}
