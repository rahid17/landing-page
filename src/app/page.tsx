import { HeroSection } from "@/components/landing/hero";
import { BenefitsSection } from "@/components/landing/benefits";
import { WhyChooseUsSection } from "@/components/landing/why-choose-us";
import { FeaturesSection } from "@/components/landing/features";
import { GallerySection } from "@/components/landing/gallery";
import { ReviewsSection } from "@/components/landing/reviews";
import { FAQSection } from "@/components/landing/faq";
import { OrderSection } from "@/components/landing/order-section";
import { Footer } from "@/components/landing/footer";
import { FloatingCTA } from "@/components/landing/floating-cta";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <BenefitsSection />
      <WhyChooseUsSection />
      <FeaturesSection />
      <GallerySection />
      <ReviewsSection />
      <FAQSection />
      <OrderSection />
      <Footer />
      <FloatingCTA />
    </main>
  );
}
