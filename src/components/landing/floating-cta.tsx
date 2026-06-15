"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLandingContent } from "@/hooks/use-landing-content";
import { logEvent } from "@/services/analytics";
import { ShoppingCart } from "lucide-react";

function scrollToOrder() {
  document.getElementById("order-section")?.scrollIntoView({ behavior: "smooth" });
}

export function FloatingCTA() {
  const { content } = useLandingContent();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    const el = document.getElementById("order-section");
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const handleClick = () => {
    logEvent("cta_click");
    scrollToOrder();
  };

  const ctaText = content?.hero?.ctaText || "Order Now";

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 md:hidden transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <Button
        onClick={handleClick}
        size="lg"
        className="rounded-full px-6 py-6 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 animate-pulse hover:animate-none"
      >
        <ShoppingCart className="w-5 h-5 mr-2" />
        {ctaText}
      </Button>
    </div>
  );
}
