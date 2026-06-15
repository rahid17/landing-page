"use client";

import { useState, useEffect } from "react";
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
import { Plus, Trash2, Loader2, Layout, Heart, List, HelpCircle, Text } from "lucide-react";

export default function CMSPage() {
  const { content, loading, refresh } = useLandingContent();
  const [saving, setSaving] = useState(false);

  const form = useForm<LandingContentFormData>({
    resolver: zodResolver(landingContentSchema),
    defaultValues: {
      hero: { title: "", subtitle: "", ctaText: "" },
      benefits: [],
      features: [],
      whyChooseUs: "",
      footerContent: "",
    },
  });

  useEffect(() => {
    if (content) {
      form.reset({
        hero: {
          title: content.hero?.title || "",
          subtitle: content.hero?.subtitle || "",
          ctaText: content.hero?.ctaText || "",
        },
        benefits: content.benefits || [],
        features: content.features || [],
        whyChooseUs: content.whyChooseUs || "",
        footerContent: content.footerContent || "",
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
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const addBenefit = () => {
    const benefits = form.getValues("benefits") || [];
    form.setValue("benefits", [
      ...benefits,
      { title: "", description: "", icon: "" },
    ]);
  };

  const removeBenefit = (index: number) => {
    const benefits = form.getValues("benefits") || [];
    form.setValue(
      "benefits",
      benefits.filter((_, i) => i !== index)
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Landing Page CMS</h1>
          <p className="text-muted-foreground">Edit your landing page content</p>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Landing Page CMS</h1>
          <p className="text-muted-foreground">Edit your landing page content</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="flex flex-wrap gap-2 h-auto p-1">
            <TabsTrigger value="hero" className="gap-2">
              <Layout className="h-4 w-4" />
              Hero
            </TabsTrigger>
            <TabsTrigger value="benefits" className="gap-2">
              <Heart className="h-4 w-4" />
              Benefits
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <List className="h-4 w-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="why-us" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              Why Choose Us
            </TabsTrigger>
            <TabsTrigger value="footer" className="gap-2">
              <Text className="h-4 w-4" />
              Footer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>
                  Main banner content at the top of your landing page
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benefits">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Benefits</CardTitle>
                  <CardDescription>
                    Benefit cards shown on the landing page
                  </CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addBenefit}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Benefit
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {(form.watch("benefits") || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No benefits yet. Click &ldquo;Add Benefit&rdquo; to add one.
                  </p>
                ) : (
                  (form.watch("benefits") || []).map((_, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3 relative">
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

          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
                <CardDescription>
                  List of product features (one per line)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Textarea
                  rows={8}
                  placeholder="100% Natural Ingredients&#10;Long-lasting Color&#10;Safe for all skin types&#10;Easy to Apply"
                  value={(form.watch("features") || []).join("\n")}
                  onChange={(e) => {
                    const lines = e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean);
                    form.setValue("features", lines);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="why-us">
            <Card>
              <CardHeader>
                <CardTitle>Why Choose Us</CardTitle>
                <CardDescription>
                  Content for the &ldquo;Why Choose Us&rdquo; section
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Textarea
                  rows={6}
                  placeholder="Tell customers why they should choose your product..."
                  {...form.register("whyChooseUs")}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="footer">
            <Card>
              <CardHeader>
                <CardTitle>Footer Content</CardTitle>
                <CardDescription>
                  Content displayed in the website footer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Textarea
                  rows={6}
                  placeholder="Footer text, copyright info, etc..."
                  {...form.register("footerContent")}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button type="submit" size="lg" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save All Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
