"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLandingContent } from "@/hooks/use-landing-content";
import { logEvent } from "@/services/analytics";
import { Leaf, Phone, MapPin, Mail, ArrowRight } from "lucide-react";

function scrollToOrder() {
  document.getElementById("order-section")?.scrollIntoView({ behavior: "smooth" });
}

export function Footer() {
  const { content } = useLandingContent();

  const brandName = content?.footer?.brandName || "KTalk";
  const tagline = content?.footer?.tagline || "Premium organic mehendi made from 100% natural henna leaves. Safe for your skin, beautiful for your occasions.";
  const phone = content?.footer?.phone || "+880 1XXX-XXXXXX";
  const email = content?.footer?.email || "hello@ktalk.com.bd";
  const address = content?.footer?.address || "Dhaka, Bangladesh";
  const copyright = content?.footer?.copyright || "\u00a9 2026 KTalk. All rights reserved.";

  const handleCTA = () => {
    logEvent("cta_click");
    scrollToOrder();
  };

  return (
    <footer className="bg-green-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-amber-950" />
              </div>
              <span className="text-xl font-bold">{brandName}</span>
            </div>
            <p className="text-green-200/80 leading-relaxed mb-6">
              {tagline}
            </p>
            <Button
              onClick={handleCTA}
              className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-semibold"
            >
              Order Now
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Home", href: "#" },
                { label: "Order Now", href: "#order-section" },
                { label: "FAQ", href: "#faq" },
                { label: "Contact", href: "#contact" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-green-200/80 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div id="contact">
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <span className="text-green-200/80 text-sm">
                  {phone}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <span className="text-green-200/80 text-sm">
                  {email}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <span className="text-green-200/80 text-sm">
                  {address}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {content?.footerContent && (
          <div className="mt-8 text-center text-green-200/60 text-sm">
            {content.footerContent}
          </div>
        )}
      </div>

      <Separator className="bg-green-700/50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-green-300/80">
          <p>{copyright}</p>
          <p>Made with love in Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
