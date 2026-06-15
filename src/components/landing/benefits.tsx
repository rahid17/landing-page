"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLandingContent } from "@/hooks/use-landing-content";
import type { Benefit } from "@/types";
import { Leaf, ShieldCheck, Sparkles, Heart } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Leaf,
  ShieldCheck,
  Sparkles,
  Heart,
  Shield: ShieldCheck,
};

const fallbackBenefits: Benefit[] = [
  {
    title: "100% Organic",
    description: "Made from pure natural henna leaves, no chemicals",
    icon: "Leaf",
  },
  {
    title: "Chemical Free",
    description: "No PPD, no ammonia, completely safe for your skin",
    icon: "ShieldCheck",
  },
  {
    title: "Long Lasting Color",
    description: "Rich dark stain that lasts up to 2 weeks",
    icon: "Sparkles",
  },
  {
    title: "Safe for Skin",
    description: "Dermatologically tested, suitable for all skin types",
    icon: "Heart",
  },
];

function BenefitCard({ benefit, index }: { benefit: Benefit; index: number }) {
  const Icon = iconMap[benefit.icon] ?? Leaf;

  return (
    <Card
      className="group border-border/60 hover:border-primary/30 hover:shadow-md transition-all duration-300 opacity-0 translate-y-4"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardContent className="p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        <h3 className="font-semibold text-lg text-foreground mb-2">
          {benefit.title}
        </h3>
        <p className="text-sm text-muted-foreground">{benefit.description}</p>
      </CardContent>
    </Card>
  );
}

function BenefitsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card rounded-xl border p-6 space-y-4">
          <Skeleton className="w-14 h-14 rounded-full mx-auto" />
          <Skeleton className="h-5 w-24 mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </div>
      ))}
    </div>
  );
}

export function BenefitsSection() {
  const { content, loading } = useLandingContent();
  const sectionRef = useRef<HTMLElement>(null);

  const benefits = content?.benefits?.length
    ? content.benefits
    : fallbackBenefits;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.querySelectorAll(".opacity-0").forEach((card, i) => {
            setTimeout(() => {
              card.classList.add("opacity-100", "translate-y-0");
              card.classList.remove("opacity-0", "translate-y-4");
            }, i * 100);
          });
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [benefits]);

  return (
    <section
      ref={sectionRef}
      id="benefits"
      className="py-16 md:py-24 bg-secondary"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose KTalk Mehendi?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the difference of truly organic mehendi, crafted with
            care for your special moments
          </p>
        </div>

        {loading ? (
          <BenefitsSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <BenefitCard key={benefit.title} benefit={benefit} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
