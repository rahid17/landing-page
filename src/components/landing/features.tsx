"use client";

import { useEffect, useRef } from "react";
import { useLandingContent } from "@/hooks/use-landing-content";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle } from "lucide-react";

const fallbackFeatures = [
  "100% Natural Ingredients",
  "Easy to Apply",
  "Dark & Rich Stain",
  "No Chemicals",
  "Suitable for All Skin Types",
  "Long Lasting Results",
];

export function FeaturesSection() {
  const { content, loading } = useLandingContent();
  const sectionRef = useRef<HTMLElement>(null);

  const features = content?.features?.length ? content.features : fallbackFeatures;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.querySelectorAll(".feature-item").forEach((item, i) => {
            setTimeout(() => {
              item.classList.add("opacity-100", "translate-y-0");
              item.classList.remove("opacity-0", "translate-y-4");
            }, i * 80);
          });
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [features]);

  return (
    <section ref={sectionRef} id="features" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {content?.featuresSection?.heading || "What Makes Our Mehendi Special"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {content?.featuresSection?.subheading ||
              "Every cone of KTalk Mehendi is packed with features that ensure the best experience"}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature}
                className="feature-item flex items-center gap-3 bg-secondary/50 rounded-xl px-5 py-4 border border-border/50 hover:border-primary/20 hover:bg-secondary transition-all duration-300 opacity-0 translate-y-4"
              >
                <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                <span className="text-foreground font-medium">{feature}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
