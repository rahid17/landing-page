"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { logEvent } from "@/services/analytics";
import { Leaf, Phone, MapPin, Mail, ArrowRight } from "lucide-react";

function scrollToOrder() {
  document.getElementById("order-section")?.scrollIntoView({ behavior: "smooth" });
}

export function Footer() {
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
              <span className="text-xl font-bold">KTalk</span>
            </div>
            <p className="text-green-200/80 leading-relaxed mb-6">
              Premium organic mehendi made from 100% natural henna leaves. Safe
              for your skin, beautiful for your occasions.
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
                  +880 1XXX-XXXXXX
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <span className="text-green-200/80 text-sm">
                  hello@ktalk.com.bd
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <span className="text-green-200/80 text-sm">
                  Dhaka, Bangladesh
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Separator className="bg-green-700/50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-green-300/80">
          <p>&copy; 2026 KTalk. All rights reserved.</p>
          <p>Made with love in Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
