"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useLandingContent } from "@/hooks/use-landing-content";
import { useProducts } from "@/hooks/use-products";
import { logEvent } from "@/services/analytics";
import { ShoppingCart, Leaf } from "lucide-react";

function scrollToOrder() {
  document.getElementById("order-section")?.scrollIntoView({ behavior: "smooth" });
}

export function HeroSection() {
  const { content } = useLandingContent();
  const { products } = useProducts();
  const sectionRef = useRef<HTMLElement>(null);

  const hero = content?.hero;
  const product = products?.[0];
  const heroImage = hero?.image ?? product?.images?.[0];

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100", "translate-y-0");
          entry.target.classList.remove("opacity-0", "translate-y-4");
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleCTA = () => {
    logEvent("cta_click");
    scrollToOrder();
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-700 overflow-hidden opacity-0 translate-y-4 transition-all duration-700"
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-green-400 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-amber-400 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {heroImage ? (
          <img
            src={heroImage}
            alt={hero?.title ?? "Premium Organic Mehendi"}
            className="w-64 h-64 sm:w-80 sm:h-80 rounded-3xl object-cover shadow-2xl border-4 border-white/20"
          />
        ) : (
          <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-3xl bg-white/10 backdrop-blur-sm border-4 border-white/20 shadow-2xl flex items-center justify-center overflow-hidden">
            <div className="text-center p-8">
              <Leaf className="w-20 h-20 text-green-300 mx-auto mb-4" />
              <div className="w-16 h-32 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full mx-auto shadow-lg transform rotate-12" />
              <div className="mt-4 h-1 w-24 bg-amber-400/50 rounded-full mx-auto" />
            </div>
          </div>
        )}

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white text-center">
          {hero?.title ?? "Premium Organic Mehendi"}
        </h1>

        <Button
          onClick={handleCTA}
          size="lg"
          className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-semibold text-lg px-10 py-7 rounded-full shadow-xl shadow-amber-500/25 transition-all hover:scale-105"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          {hero?.ctaText ?? "Order Now"}
        </Button>
      </div>
    </section>
  );
}
