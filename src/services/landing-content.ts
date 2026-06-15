import { supabase } from "@/lib/supabase";
import type { LandingContent } from "@/types";

const defaultLandingContent: LandingContent = {
  id: "main",
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
    copyright: "© 2026 Rahid. All rights reserved.",
    contactItems: [
      { icon: "Phone", text: "+880 1XXX-XXXXXX" },
      { icon: "Mail", text: "hello@ktalk.com.bd" },
      { icon: "MapPin", text: "Dhaka, Bangladesh" },
    ],
  },
};

function toLandingContent(row: Record<string, unknown>): LandingContent {
  const hero = (row.hero as Record<string, unknown>) ?? {};
  const footer = (row.footer as Record<string, unknown>) ?? {};

  return {
    id: row.id as string,
    hero: {
      title: (hero.title as string) ?? "",
      subtitle: (hero.subtitle as string) ?? "",
      ctaText: (hero.cta_text as string) ?? (hero.ctaText as string) ?? "",
      badgeText: (hero.badge_text as string) ?? (hero.badgeText as string) ?? "",
      deliveryInfo: (hero.delivery_info as string) ?? (hero.deliveryInfo as string) ?? "",
    },
    benefits: (row.benefits as LandingContent["benefits"]) ?? [],
    benefitsSection: (row.benefits_section as LandingContent["benefitsSection"]) ?? (row.benefitsSection as LandingContent["benefitsSection"]) ?? {},
    features: (row.features as string[]) ?? [],
    featuresSection: (row.features_section as LandingContent["featuresSection"]) ?? (row.featuresSection as LandingContent["featuresSection"]) ?? {},
    whyChooseUs: row.why_choose_us as string ?? row.whyChooseUs as string ?? "",
    whyChooseUsSection: (row.why_choose_us_section as LandingContent["whyChooseUsSection"]) ?? (row.whyChooseUsSection as LandingContent["whyChooseUsSection"]) ?? {},
    gallerySection: (row.gallery_section as LandingContent["gallerySection"]) ?? (row.gallerySection as LandingContent["gallerySection"]) ?? {},
    reviewsSection: (row.reviews_section as LandingContent["reviewsSection"]) ?? (row.reviewsSection as LandingContent["reviewsSection"]) ?? {},
    faqSection: (row.faq_section as LandingContent["faqSection"]) ?? (row.faqSection as LandingContent["faqSection"]) ?? {},
    orderSection: (row.order_section as LandingContent["orderSection"]) ?? (row.orderSection as LandingContent["orderSection"]) ?? {},
    footerContent: row.footer_content as string ?? row.footerContent as string ?? "",
    footer: {
      brandName: (footer.brand_name as string) ?? (footer.brandName as string) ?? "",
      tagline: (footer.tagline as string) ?? "",
      phone: (footer.phone as string) ?? "",
      email: (footer.email as string) ?? "",
      address: (footer.address as string) ?? "",
      copyright: (footer.copyright as string) ?? "",
    },
  };
}

function toSnakeLanding(data: Partial<LandingContent>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  if (data.hero !== undefined) {
    result.hero = {
      title: data.hero.title,
      subtitle: data.hero.subtitle,
      cta_text: data.hero.ctaText,
      badge_text: data.hero.badgeText,
      delivery_info: data.hero.deliveryInfo,
    };
  }
  if (data.benefits !== undefined) result.benefits = data.benefits;
  if (data.benefitsSection !== undefined) result.benefits_section = data.benefitsSection;
  if (data.features !== undefined) result.features = data.features;
  if (data.featuresSection !== undefined) result.features_section = data.featuresSection;
  if (data.whyChooseUs !== undefined) result.why_choose_us = data.whyChooseUs;
  if (data.whyChooseUsSection !== undefined) result.why_choose_us_section = data.whyChooseUsSection;
  if (data.gallerySection !== undefined) result.gallery_section = data.gallerySection;
  if (data.reviewsSection !== undefined) result.reviews_section = data.reviewsSection;
  if (data.faqSection !== undefined) result.faq_section = data.faqSection;
  if (data.orderSection !== undefined) result.order_section = data.orderSection;
  if (data.footerContent !== undefined) result.footer_content = data.footerContent;

  if (data.footer !== undefined) {
    result.footer = {
      brand_name: data.footer.brandName,
      tagline: data.footer.tagline,
      phone: data.footer.phone,
      email: data.footer.email,
      address: data.footer.address,
      copyright: data.footer.copyright,
    };
  }

  return result;
}

export async function getLandingContent(): Promise<LandingContent> {
  const { data, error } = await supabase
    .from("landing_content")
    .select("*")
    .eq("id", "main")
    .maybeSingle();
  if (error) throw error;
  if (!data) return { ...defaultLandingContent };
  return toLandingContent(data);
}

export async function updateLandingContent(
  data: Partial<LandingContent>
): Promise<void> {
  const { error } = await supabase
    .from("landing_content")
    .upsert({ id: "main", ...toSnakeLanding(data) });
  if (error) throw error;
}
