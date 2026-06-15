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
  code: string;
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

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
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
  photos: string[];
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
  subtitle?: string;
  ctaText: string;
  image?: string;
  badgeText?: string;
  deliveryInfo?: string;
}

export interface SectionHeadings {
  heading?: string;
  subheading?: string;
}

export interface FooterContactItem {
  icon: string;
  text: string;
  url?: string;
}

export interface LandingContent {
  id: string;
  hero: HeroContent;
  benefits: Benefit[];
  benefitsSection: SectionHeadings;
  features: string[];
  featuresSection: SectionHeadings;
  whyChooseUs: string;
  whyChooseUsSection: SectionHeadings;
  gallerySection: SectionHeadings;
  reviewsSection: SectionHeadings;
  faqSection: SectionHeadings;
  orderSection: SectionHeadings;
  footerContent: string;
  footer: {
    brandName?: string;
    tagline?: string;
    phone?: string;
    email?: string;
    address?: string;
    copyright?: string;
    contactItems?: FooterContactItem[];
  };
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
