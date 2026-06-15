import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { LandingContent } from "@/types";

const COLLECTION = "landing_content";
const DOC_ID = "main";

const defaultLandingContent: LandingContent = {
  id: DOC_ID,
  hero: { title: "", subtitle: "", ctaText: "" },
  benefits: [],
  features: [],
  whyChooseUs: "",
  footerContent: "",
};

export async function getLandingContent(): Promise<LandingContent> {
  const snap = await getDoc(doc(db, COLLECTION, DOC_ID));
  if (!snap.exists()) return { ...defaultLandingContent };
  return { id: snap.id, ...snap.data() } as LandingContent;
}

export async function updateLandingContent(
  data: Partial<LandingContent>
): Promise<void> {
  await setDoc(doc(db, COLLECTION, DOC_ID), data, { merge: true });
}
