"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLandingContent } from "@/hooks/use-landing-content";
import { useProducts } from "@/hooks/use-products";
import { logEvent } from "@/services/analytics";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, Truck, Leaf } from "lucide-react";

function scrollToOrder() {
  document.getElementById("order-section")?.scrollIntoView({ behavior: "smooth" });
}

export function HeroSection() {
  const { content } = useLandingContent();
  const { products } = useProducts();
  const sectionRef = useRef<HTMLElement>(null);

  const product = products?.[0];
  const hero = content?.hero;
  const price = product?.discountPrice ?? product?.price ?? 250;
  const productImage = product?.images?.[0];

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
      className="relative min-h-screen flex items-center bg-gradient-to-br from-green-900 via-green-800 to-green-700 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-green-400 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-amber-400 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center lg:justify-end order-2 lg:order-1 opacity-0 translate-y-4 transition-all duration-700">
            {productImage ? (
              <div className="relative">
                <img
                  src={productImage}
                  alt={product?.name ?? "KTalk Mehendi"}
                  className="w-72 h-72 sm:w-80 sm:h-80 rounded-3xl object-cover shadow-2xl border border-white/20"
                />
                <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-2xl bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 flex items-center justify-center">
                  <Leaf className="w-8 h-8 text-amber-400" />
                </div>
                <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-400/30" />
              </div>
            ) : (
              <div className="relative">
                <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden">
                  <div className="text-center p-8">
                    <Leaf className="w-20 h-20 text-green-300 mx-auto mb-4" />
                    <div className="w-16 h-32 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full mx-auto shadow-lg transform rotate-12" />
                    <div className="mt-4 h-1 w-24 bg-amber-400/50 rounded-full mx-auto" />
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-2xl bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 flex items-center justify-center">
                  <Leaf className="w-8 h-8 text-amber-400" />
                </div>
                <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-400/30" />
              </div>
            )}
          </div>

          <div className="text-center lg:text-left order-1 lg:order-2 opacity-0 translate-y-4 transition-all duration-700 delay-200">
            <Badge className="mb-6 bg-amber-500/20 text-amber-300 border-amber-400/30 px-4 py-1.5 text-sm">
              <Leaf className="w-3.5 h-3.5 mr-1.5" />
              {hero?.badgeText || "100% Organic"}
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {hero?.title ?? "Premium Organic Mehendi"}
            </h1>

            <p className="text-lg sm:text-xl text-green-100/90 mb-8 max-w-lg mx-auto lg:mx-0">
              {hero?.subtitle ??
                "Natural, safe, and long-lasting color for your special occasions"}
            </p>

            <div className="mb-8">
              <span className="text-5xl font-bold text-amber-400">
                {formatPrice(price)}
              </span>
            </div>

            <Button
              onClick={handleCTA}
              size="lg"
              className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-semibold text-lg px-10 py-7 rounded-full shadow-xl shadow-amber-500/25 transition-all hover:scale-105"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {hero?.ctaText ?? "Order Now"}
            </Button>

            <div className="mt-6 flex items-center justify-center lg:justify-start gap-2 text-green-200/80 text-sm">
              <Truck className="w-4 h-4" />
              <span>{hero?.deliveryInfo || "Free delivery in Dhaka | Cash on Delivery available"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
          <div className="w-1.5 h-3 rounded-full bg-white/50 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
