import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const orderFormSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().min(1, "Minimum quantity is 1").max(100, "Maximum quantity is 100"),
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "Invalid Bangladesh phone number"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  districtId: z.string().min(1, "District is required"),
  paymentMethod: z.enum(["cod", "bkash", "nagad"]),
  transactionId: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  discountPrice: z.number().positive().optional(),
  images: z.array(z.string()).min(1, "At least one image is required"),
  gallery: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  benefits: z
    .array(z.object({ title: z.string(), description: z.string(), icon: z.string() }))
    .optional(),
  stockStatus: z.enum(["in_stock", "out_of_stock"]),
  active: z.boolean(),
});

export const districtSchema = z.object({
  name: z.string().min(2, "District name is required"),
  deliveryCharge: z.number().min(0, "Delivery charge must be 0 or more"),
  active: z.boolean(),
});

export const paymentSettingsSchema = z.object({
  cod: z.object({
    enabled: z.boolean(),
  }),
  bkash: z.object({
    enabled: z.boolean(),
    number: z.string().optional(),
    instructions: z.string().optional(),
  }),
  nagad: z.object({
    enabled: z.boolean(),
    number: z.string().optional(),
    instructions: z.string().optional(),
  }),
});

export const reviewSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  photoURL: z.string().optional(),
  text: z.string().min(5, "Review text must be at least 5 characters"),
  rating: z.number().min(1).max(5),
});

export const faqSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  answer: z.string().min(5, "Answer must be at least 5 characters"),
  order: z.number().min(0),
});

export const heroContentSchema = z.object({
  title: z.string().min(2, "Title is required"),
  subtitle: z.string().min(2, "Subtitle is required"),
  ctaText: z.string().min(2, "CTA text is required"),
});

export const landingContentSchema = z.object({
  hero: heroContentSchema,
  benefits: z
    .array(z.object({ title: z.string(), description: z.string(), icon: z.string() }))
    .optional(),
  features: z.array(z.string()).optional(),
  whyChooseUs: z.string().optional(),
  footerContent: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type OrderFormData = z.infer<typeof orderFormSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type DistrictFormData = z.infer<typeof districtSchema>;
export type PaymentSettingsFormData = z.infer<typeof paymentSettingsSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type FAQFormData = z.infer<typeof faqSchema>;
export type LandingContentFormData = z.infer<typeof landingContentSchema>;
