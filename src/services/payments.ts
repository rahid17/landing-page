import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { PaymentSettings } from "@/types";

const COLLECTION = "payment_settings";
const DOC_ID = "main";

const defaultPaymentSettings: PaymentSettings = {
  id: DOC_ID,
  cod: { enabled: true },
  bkash: { enabled: false, number: "" },
  nagad: { enabled: false, number: "" },
  updatedAt: "",
};

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const snap = await getDoc(doc(db, COLLECTION, DOC_ID));
  if (!snap.exists()) return { ...defaultPaymentSettings };
  return { id: snap.id, ...snap.data() } as PaymentSettings;
}

export async function updatePaymentSettings(
  data: Partial<PaymentSettings>
): Promise<void> {
  await setDoc(
    doc(db, COLLECTION, DOC_ID),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}
