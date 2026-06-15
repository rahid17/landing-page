"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useLandingContent } from "@/hooks/use-landing-content";
import { updateLandingContent } from "@/services/landing-content";
import { landingContentSchema, type LandingContentFormData } from "@/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Layout,
  Type,
  Image,
  Star,
  HelpCircle,
  ShoppingCart,
  Phone,
  Mail,
  MapPin,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";

const defaultFormValues: LandingContentFormData = {
  hero: {
    title: "",
    subtitle: "",
    ctaText: "",
    badgeText: "",
    deliveryInfo: "",
  },
  benefits: [],
  benefitsSection: { heading: "", subheading: "" },
  features: [],
  featuresSection: { heading: "", subheading: "" },
  whyChooseUs: "",
  whyChooseUsSection: { heading: "", subheading: "" },
  gallerySection: { heading: "", subheading: "" },
  reviewsSection: { heading: "", subheading: "" },
  faqSection: { heading: "", subheading: "" },
  orderSection: { heading: "", subheading: "" },
  footerContent: "",
  footer: {
    brandName: "",
    tagline: "",
    phone: "",
    email: "",
    address: "",
    copyright: "",
    contactItems: [],
  },
};

export default function CMSPage() {
  const { content, loading, refresh } = useLandingContent();
  const [saving, setSaving] = useState(false);

  const form = useForm<LandingContentFormData>({
    resolver: zodResolver(landingContentSchema),
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (content) {
      form.reset({
        hero: {
          title: content.hero?.title ?? "",
          subtitle: content.hero?.subtitle ?? "",
          ctaText: content.hero?.ctaText ?? "",
          badgeText: content.hero?.badgeText ?? "",
          deliveryInfo: content.hero?.deliveryInfo ?? "",
        },
        benefits: content.benefits ?? [],
        benefitsSection: {
          heading: content.benefitsSection?.heading ?? "",
          subheading: content.benefitsSection?.subheading ?? "",
        },
        features: content.features ?? [],
        featuresSection: {
          heading: content.featuresSection?.heading ?? "",
          subheading: content.featuresSection?.subheading ?? "",
        },
        whyChooseUs: content.whyChooseUs ?? "",
        whyChooseUsSection: {
          heading: content.whyChooseUsSection?.heading ?? "",
          subheading: content.whyChooseUsSection?.subheading ?? "",
        },
        gallerySection: {
          heading: content.gallerySection?.heading ?? "",
          subheading: content.gallerySection?.subheading ?? "",
        },
        reviewsSection: {
          heading: content.reviewsSection?.heading ?? "",
          subheading: content.reviewsSection?.subheading ?? "",
        },
        faqSection: {
          heading: content.faqSection?.heading ?? "",
          subheading: content.faqSection?.subheading ?? "",
        },
        orderSection: {
          heading: content.orderSection?.heading ?? "",
          subheading: content.orderSection?.subheading ?? "",
        },
        footerContent: content.footerContent ?? "",
        footer: {
          brandName: content.footer?.brandName ?? "",
          tagline: content.footer?.tagline ?? "",
          phone: content.footer?.phone ?? "",
          email: content.footer?.email ?? "",
          address: content.footer?.address ?? "",
          copyright: content.footer?.copyright ?? "",
          contactItems: content.footer?.contactItems ?? [],
        },
      });
    }
  }, [content, form]);

  const onSubmit = async (data: LandingContentFormData) => {
    setSaving(true);
    try {
      await updateLandingContent(data);
      toast.success("Landing page content saved");
      refresh();
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const addBenefit = () => {
    const current = form.getValues("benefits") ?? [];
    form.setValue("benefits", [
      ...current,
      { title: "", description: "", icon: "" },
    ]);
  };

  const removeBenefit = (index: number) => {
    const current = form.getValues("benefits") ?? [];
    form.setValue(
      "benefits",
      current.filter((_, i) => i !== index)
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Landing Page CMS</h1>
          <p className="text-muted-foreground">Edit your landing page content</p>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!content && !loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Landing Page CMS</h1>
          <p className="text-muted-foreground">Edit your landing page content</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-muted-foreground text-lg">No content loaded</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const headingFields = (prefix: "benefitsSection" | "featuresSection" | "whyChooseUsSection" | "gallerySection" | "reviewsSection" | "faqSection" | "orderSection") => (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-heading`}>Heading</Label>
        <Input
          id={`${prefix}-heading`}
          placeholder="Section heading"
          {...form.register(`${prefix}.heading`)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-subheading`}>Subheading</Label>
        <Input
          id={`${prefix}-subheading`}
          placeholder="Section subheading"
          {...form.register(`${prefix}.subheading`)}
        />
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Landing Page CMS</h1>
        <p className="text-muted-foreground">Edit your landing page content</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1">
            <TabsTrigger value="hero" className="gap-2">
              <Layout className="h-4 w-4" />
              Hero
            </TabsTrigger>
            <TabsTrigger value="benefits" className="gap-2">
              <Star className="h-4 w-4" />
              Benefits
            </TabsTrigger>
            <TabsTrigger value="why-us" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              Why Choose Us
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <Type className="h-4 w-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2">
              <Image className="h-4 w-4" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <Star className="h-4 w-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="faq" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="order" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Order
            </TabsTrigger>
            <TabsTrigger value="footer" className="gap-2">
              <Phone className="h-4 w-4" />
              Footer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>
                  Main banner at the top of your landing page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hero-title">Title</Label>
                  <Input
                    id="hero-title"
                    placeholder="Organic Mehendi for Every Occasion"
                    {...form.register("hero.title")}
                  />
                  {form.formState.errors.hero?.title && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.hero.title.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero-subtitle">Subtitle</Label>
                  <Input
                    id="hero-subtitle"
                    placeholder="Natural, safe, and beautiful"
                    {...form.register("hero.subtitle")}
                  />
                  {form.formState.errors.hero?.subtitle && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.hero.subtitle.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero-cta">CTA Button Text</Label>
                  <Input
                    id="hero-cta"
                    placeholder="Order Now"
                    {...form.register("hero.ctaText")}
                  />
                  {form.formState.errors.hero?.ctaText && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.hero.ctaText.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero-badge">Badge Text</Label>
                  <Input
                    id="hero-badge"
                    placeholder="100% Organic"
                    {...form.register("hero.badgeText")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero-delivery">Delivery Info</Label>
                  <Input
                    id="hero-delivery"
                    placeholder="Free delivery in Dhaka | Cash on Delivery available"
                    {...form.register("hero.deliveryInfo")}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benefits">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Benefits Section</CardTitle>
                  <CardDescription>
                    Section heading and benefit cards
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBenefit}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Benefit
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {headingFields("benefitsSection")}
                </div>

                {(form.watch("benefits") ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8 border rounded-lg border-dashed">
                    No benefits yet. Click &ldquo;Add Benefit&rdquo; to add one.
                  </p>
                ) : (
                  (form.watch("benefits") ?? []).map((_, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">
                          Benefit {index + 1}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBenefit(index)}
                          className="h-6 w-6"
                          aria-label="Remove benefit"
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label>Title</Label>
                          <Input
                            {...form.register(`benefits.${index}.title`)}
                            placeholder="100% Natural"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Icon (emoji or icon name)</Label>
                          <Input
                            {...form.register(`benefits.${index}.icon`)}
                            placeholder="🌿"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Description</Label>
                          <Input
                            {...form.register(`benefits.${index}.description`)}
                            placeholder="Made from natural henna leaves"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="why-us">
            <Card>
              <CardHeader>
                <CardTitle>Why Choose Us</CardTitle>
                <CardDescription>
                  Section heading and content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {headingFields("whyChooseUsSection")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="why-choose-us">Content</Label>
                  <Textarea
                    id="why-choose-us"
                    rows={6}
                    placeholder="Tell customers why they should choose your product..."
                    {...form.register("whyChooseUs")}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Features Section</CardTitle>
                <CardDescription>
                  Section heading and product features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {headingFields("featuresSection")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="features-list">Features (one per line)</Label>
                  <Textarea
                    id="features-list"
                    rows={8}
                    placeholder="100% Natural Ingredients&#10;Long-lasting Color&#10;Safe for all skin types&#10;Easy to Apply"
                    value={(form.watch("features") ?? []).join("\n")}
                    onChange={(e) => {
                      const lines = e.target.value
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      form.setValue("features", lines);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <CardTitle>Gallery Section</CardTitle>
                <CardDescription>
                  Section heading for the image gallery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {headingFields("gallerySection")}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Reviews Section</CardTitle>
                <CardDescription>
                  Section heading for customer reviews
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {headingFields("reviewsSection")}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>FAQ Section</CardTitle>
                <CardDescription>
                  Section heading for frequently asked questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {headingFields("faqSection")}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="order">
            <Card>
              <CardHeader>
                <CardTitle>Order Section</CardTitle>
                <CardDescription>
                  Section heading for the order form
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {headingFields("orderSection")}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="footer">
            <Card>
              <CardHeader>
                <CardTitle>Footer</CardTitle>
                <CardDescription>
                  Brand info and contact details shown in the footer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="footer-brand">Brand Name</Label>
                    <Input
                      id="footer-brand"
                      placeholder="KTalk"
                      {...form.register("footer.brandName")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footer-tagline">Tagline</Label>
                    <Input
                      id="footer-tagline"
                      placeholder="Premium organic mehendi..."
                      {...form.register("footer.tagline")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footer-phone" className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      Phone
                    </Label>
                    <Input
                      id="footer-phone"
                      placeholder="+880 1XXX-XXXXXX"
                      {...form.register("footer.phone")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footer-email" className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      Email
                    </Label>
                    <Input
                      id="footer-email"
                      placeholder="hello@ktalk.com.bd"
                      {...form.register("footer.email")}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="footer-address" className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      Address
                    </Label>
                    <Input
                      id="footer-address"
                      placeholder="Dhaka, Bangladesh"
                      {...form.register("footer.address")}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="footer-copyright">Copyright</Label>
                    <Input
                      id="footer-copyright"
                      placeholder="© 2026 Rahid. All rights reserved."
                      {...form.register("footer.copyright")}
                    />
                  </div>

                  <Separator className="sm:col-span-2" />
                  <div className="space-y-3 sm:col-span-2">
                    <Label>Contact Items</Label>
                    <p className="text-xs text-muted-foreground">
                      Add, edit, or remove contact details shown in footer
                    </p>
                    {(form.watch("footer.contactItems") ?? []).map((_, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 border rounded-lg bg-muted/30">
                        <div className="w-24 shrink-0 space-y-1">
                          <Label className="text-xs">Icon</Label>
                          <Select
                            value={form.watch(`footer.contactItems.${i}.icon`) ?? "MapPin"}
                            onValueChange={(v) => form.setValue(`footer.contactItems.${i}.icon`, v)}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Phone">Phone</SelectItem>
                              <SelectItem value="Mail">Mail</SelectItem>
                              <SelectItem value="MapPin">MapPin</SelectItem>
                              <SelectItem value="Globe">Globe</SelectItem>
                              <SelectItem value="MessageCircle">Chat</SelectItem>
                              <SelectItem value="ExternalLink">Link</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Text</Label>
                          <Input
                            placeholder="+880 1XXX-XXXXXX"
                            {...form.register(`footer.contactItems.${i}.text`)}
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">URL (optional)</Label>
                          <Input
                            placeholder="https://..."
                            {...form.register(`footer.contactItems.${i}.url`)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="mt-5 text-destructive hover:text-destructive"
                          onClick={() => {
                            const items = form.watch("footer.contactItems") ?? [];
                            form.setValue("footer.contactItems", items.filter((_, j) => j !== i));
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const items = form.watch("footer.contactItems") ?? [];
                        form.setValue("footer.contactItems", [
                          ...items,
                          { icon: "MapPin", text: "", url: "" },
                        ]);
                      }}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Contact Item
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button type="submit" size="lg" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
