import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | null | undefined): string {
  if (price == null || isNaN(price)) return "৳ 0";
  return `৳ ${price.toLocaleString("en-BD")}`;
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KT-${timestamp}-${random}`;
}

export function getBangladeshPhonePattern(): RegExp {
  return /^01[3-9]\d{8}$/;
}
