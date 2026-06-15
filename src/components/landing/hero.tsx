"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useLandingContent } from "@/hooks/use-landing-content";
import { useProducts } from "@/hooks/use-products";
import { logEvent } from "@/services/analytics";
import { formatPrice } from "@/lib/utils";
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
  const price = product?.discountPrice ?? product?.price ?? 250;

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

      {/* Logo - top left */}
      {hero?.logo && (
        <div className="absolute top-4 sm:top-6 left-4 sm:left-8 z-20">
          <img
            src={hero.logo}
            alt="Logo"
            className="h-8 sm:h-10 md:h-12 w-auto object-contain"
          />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center gap-6 px-4 pt-16 pb-20">
        {heroImage ? (
          <img
            src={heroImage}
            alt={hero?.title ?? "Premium Organic Mehendi"}
            className="w-48 h-48 sm:w-60 sm:h-60 md:w-80 md:h-80 rounded-3xl object-cover shadow-2xl border-4 border-white/20"
          />
        ) : (
          <div className="w-48 h-48 sm:w-60 sm:h-60 md:w-80 md:h-80 rounded-3xl bg-white/10 backdrop-blur-sm border-4 border-white/20 shadow-2xl flex items-center justify-center overflow-hidden">
            <div className="text-center p-4">
              <Leaf className="w-16 h-16 sm:w-20 sm:h-20 text-green-300 mx-auto mb-2" />
              <div className="w-12 h-24 sm:w-16 sm:h-32 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full mx-auto shadow-lg transform rotate-12" />
            </div>
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center max-w-3xl leading-tight">
          {hero?.title ?? "Premium Organic Mehendi"}
        </h1>

        <div className="text-4xl sm:text-5xl font-bold text-amber-400">
          {formatPrice(price)}
        </div>

        <Button
          onClick={handleCTA}
          size="lg"
          className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-semibold text-lg px-10 py-7 rounded-full shadow-xl shadow-amber-500/25 transition-all hover:scale-105"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          {hero?.ctaText ?? "Order Now"}
        </Button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
          <div className="w-1.5 h-3 rounded-full bg-white/50 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
