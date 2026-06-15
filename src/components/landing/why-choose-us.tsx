"use client";

import { useEffect, useRef } from "react";
import { useLandingContent } from "@/hooks/use-landing-content";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Leaf } from "lucide-react";

const defaultText = `At KTalk, we believe in the purity of tradition. Our mehendi is sourced from the finest organic henna farms, ensuring that every cone delivers a rich, dark, and long-lasting stain without any harmful chemicals.

We carefully process our henna leaves to preserve their natural dye content, giving you the deepest color possible. Whether it's for a wedding, Eid celebration, or any special occasion, KTalk Mehendi is your trusted companion for beautiful and safe body art.

Our commitment to quality means no PPD, no ammonia, and no synthetic dyes — just pure, natural mehendi that's gentle on your skin and kind to the environment.`;

export function WhyChooseUsSection() {
  const { content, loading } = useLandingContent();
  const sectionRef = useRef<HTMLElement>(null);

  const whyChooseUsText = content?.whyChooseUs || defaultText;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target
            .querySelectorAll(".animate-on-scroll")
            .forEach((c) => c.classList.add("animate-visible"));
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="why-choose-us" className="py-16 md:py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: "radial-gradient(circle, #15803d 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-on-scroll opacity-0 -translate-x-4 transition-all duration-700 [&.animate-visible]:opacity-100 [&.animate-visible]:translate-x-0">
            <div className="relative">
              <div className="w-full aspect-[4/3] rounded-3xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border border-green-200 dark:border-green-800 flex items-center justify-center overflow-hidden">
                <div className="text-center p-8">
                  <Leaf className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                  <div className="flex gap-3 justify-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-10 h-28 bg-gradient-to-b from-amber-300 to-amber-600 rounded-full shadow-md"
                        style={{ transform: `rotate(${(i - 2) * 6}deg)` }}
                      />
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-center gap-2 text-sm text-green-700 dark:text-green-300">
                    <CheckCircle className="w-4 h-4" />
                    <span>100% Natural Ingredients</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-3 -right-3 w-full h-full rounded-3xl bg-primary/10 -z-10" />
            </div>
          </div>

          <div className="animate-on-scroll opacity-0 translate-x-4 transition-all duration-700 delay-200 [&.animate-visible]:opacity-100 [&.animate-visible]:translate-x-0">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              The KTalk Difference
            </h2>

            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                {whyChooseUsText.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Chemical Free
              </div>
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Dermatologically Tested
              </div>
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Premium Quality
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
