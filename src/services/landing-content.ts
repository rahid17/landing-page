import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { LandingContent } from "@/types";

const COLLECTION = "landing_content";
const DOC_ID = "main";

const defaultLandingContent: LandingContent = {
  id: DOC_ID,
  hero: {
    title: "",
    subtitle: "",
    ctaText: "",
    badgeText: "100% Organic",
    deliveryInfo: "Free delivery in Dhaka | Cash on Delivery available",
  },
  benefits: [],
  benefitsSection: { heading: "Why Choose KTalk Mehendi?", subheading: "Experience the difference of truly organic mehendi" },
  features: [],
  featuresSection: { heading: "What Makes Our Mehendi Special", subheading: "Every cone of KTalk Mehendi is packed with features that ensure the best experience" },
  whyChooseUs: "",
  whyChooseUsSection: { heading: "The KTalk Difference", subheading: "" },
  gallerySection: { heading: "Product Gallery", subheading: "See the rich, dark stains our organic mehendi delivers" },
  reviewsSection: { heading: "What Our Customers Say", subheading: "Real reviews from real customers who love KTalk Mehendi" },
  faqSection: { heading: "Frequently Asked Questions", subheading: "Got questions? We've got answers" },
  orderSection: { heading: "Place Your Order", subheading: "Fill in your details below and we'll deliver fresh organic mehendi to your doorstep" },
  footerContent: "",
  footer: {
    brandName: "KTalk",
    tagline: "Premium organic mehendi made from 100% natural henna leaves.",
    phone: "+880 1XXX-XXXXXX",
    email: "hello@ktalk.com.bd",
    address: "Dhaka, Bangladesh",
    copyright: "© 2026 KTalk. All rights reserved.",
  },
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
