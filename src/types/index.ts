export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cod" | "bkash" | "nagad";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  gallery?: string[];
  features?: string[];
  benefits?: Benefit[];
  stockStatus: "in_stock" | "out_of_stock";
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Benefit {
  title: string;
  description: string;
  icon: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  customerName: string;
  phone: string;
  address: string;
  districtId: string;
  districtName: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface District {
  id: string;
  name: string;
  deliveryCharge: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentOption {
  enabled: boolean;
  number?: string;
  instructions?: string;
}

export interface PaymentSettings {
  id: string;
  cod: PaymentOption;
  bkash: PaymentOption & { number: string };
  nagad: PaymentOption & { number: string };
  updatedAt: string;
}

export interface Review {
  id: string;
  customerName: string;
  photoURL?: string;
  text: string;
  rating: number;
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
}

export interface LandingContent {
  id: string;
  hero: HeroContent;
  benefits: Benefit[];
  features: string[];
  whyChooseUs: string;
  footerContent: string;
}

export interface AnalyticsEvent {
  type: "page_view" | "cta_click" | "order";
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
}

export type CollectionName =
  | "admins"
  | "products"
  | "orders"
  | "districts"
  | "payment_settings"
  | "reviews"
  | "faqs"
  | "landing_content"
  | "analytics";
