"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useProducts } from "@/hooks/use-products";
import { useDistricts } from "@/hooks/use-districts";
import { usePaymentSettings } from "@/hooks/use-payment-settings";
import { useLandingContent } from "@/hooks/use-landing-content";
import { createOrder } from "@/services/orders";
import { logEvent } from "@/services/analytics";
import { formatPrice } from "@/lib/utils";
import { orderFormSchema, type OrderFormData } from "@/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Send, CreditCard, Truck, Plus, Minus } from "lucide-react";

export function OrderSection() {
  const router = useRouter();
  const { products, loading: productsLoading } = useProducts();
  const { activeDistricts, loading: districtsLoading } = useDistricts();
  const { paymentSettings, loading: paymentLoading } = usePaymentSettings();
  const { content: landingContent } = useLandingContent();

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      items: [],
      customerName: "",
      phone: "",
      address: "",
      districtId: "",
      paymentMethod: "cod",
      transactionId: "",
    },
  });

  const districtId = watch("districtId");
  const paymentMethod = watch("paymentMethod");
  const district = activeDistricts.find((d) => d.id === districtId);
  const deliveryCharge = district?.deliveryCharge ?? 0;

  const activeProducts = products?.filter((p) => p.active) ?? [];

  const setQuantity = (productId: string, qty: number) => {
    const clamped = Math.max(0, qty);
    const updated = { ...quantities, [productId]: clamped };
    setQuantities(updated);

    const items = activeProducts
      .filter((p) => (updated[p.id] ?? 0) > 0)
      .map((p) => ({
        productId: p.id,
        productName: p.name,
        productImage: p.images?.[0] ?? "",
        quantity: updated[p.id] ?? 0,
        price: p.discountPrice ?? p.price,
      }));
    setValue("items", items, { shouldValidate: true });
  };

  const subtotal = activeProducts.reduce((sum, p) => {
    const qty = quantities[p.id] ?? 0;
    return sum + (p.discountPrice ?? p.price) * qty;
  }, 0);
  const total = subtotal + deliveryCharge;

  const handlePlaceOrder = async (data: OrderFormData) => {
    setSubmitting(true);
    try {
      const createdOrder = await createOrder({
        items: data.items.filter((i) => i.quantity > 0),
        subtotal,
        deliveryCharge,
        total,
        customerName: data.customerName,
        phone: data.phone,
        address: data.address,
        districtId: data.districtId,
        districtName: district?.name ?? "",
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
      });

      await logEvent("order", {
        total,
        itemCount: createdOrder.items.length,
        paymentMethod: data.paymentMethod,
      });

      toast.success("Order placed successfully!");
      router.push(`/success?orderId=${createdOrder.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = productsLoading || districtsLoading || paymentLoading;

  return (
    <section id="order-section" className="py-16 md:py-24 bg-secondary/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">
            {landingContent?.orderSection?.heading || "Place Your Order"}
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            {landingContent?.orderSection?.subheading ||
              "Select your products, choose quantity, and fill in your details. We'll deliver to your doorstep."}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <CardTitle>Order Form</CardTitle>
            </div>
            <CardDescription>All fields marked with * are required</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handlePlaceOrder)} className="space-y-8">
              {/* Product Selection */}
              <div className="space-y-3">
                <Label className="text-base">Select Products *</Label>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : activeProducts.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4">No products available at this time.</p>
                ) : (
                  <div className="space-y-2">
                    {activeProducts.map((product) => {
                      const qty = quantities[product.id] ?? 0;
                      const price = product.discountPrice ?? product.price;
                      return (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/30 transition-colors"
                        >
                          <div className="h-14 w-14 shrink-0 rounded bg-muted overflow-hidden">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{product.name}</p>
                            <p className="text-sm text-primary font-semibold">
                              {formatPrice(price)}
                              {product.discountPrice && (
                                <span className="text-xs text-muted-foreground line-through ml-1">
                                  {formatPrice(product.price)}
                                </span>
                              )}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setQuantity(product.id, qty - 1)}
                              disabled={qty === 0}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min={0}
                              value={qty}
                              onChange={(e) => setQuantity(product.id, parseInt(e.target.value) || 0)}
                              className="h-8 w-14 text-center text-sm [&::-webkit-inner-spin-button]:opacity-100"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setQuantity(product.id, qty + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="text-right shrink-0 w-20">
                            <p className="text-sm font-semibold">
                              {formatPrice(price * qty)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {qty} × {formatPrice(price)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {errors.items && (
                  <p className="text-sm text-destructive">{errors.items.message}</p>
                )}
              </div>

              <Separator />

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" placeholder="Enter your full name" {...register("customerName")} />
                  {errors.customerName && (
                    <p className="text-sm text-destructive">{errors.customerName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" placeholder="01XXXXXXXXX" {...register("phone")} />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address *</Label>
                <Textarea
                  id="address"
                  rows={2}
                  placeholder="House, Road, Area, City"
                  {...register("address")}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Select
                    value={districtId}
                    onValueChange={(v) => setValue("districtId", v, { shouldValidate: true })}
                  >
                    <SelectTrigger id="district">
                      <SelectValue placeholder="Select your district" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeDistricts.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name} {d.deliveryCharge > 0 ? `(${formatPrice(d.deliveryCharge)})` : "(Free)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.districtId && (
                    <p className="text-sm text-destructive">{errors.districtId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Payment Method *</Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) => setValue("paymentMethod", v as "cod" | "bkash" | "nagad")}
                    className="flex flex-wrap gap-4"
                  >
                    {paymentSettings?.cod?.enabled !== false && (
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="cursor-pointer">Cash on Delivery</Label>
                      </div>
                    )}
                    {paymentSettings?.bkash?.enabled && (
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="bkash" id="bkash" />
                        <Label htmlFor="bkash" className="cursor-pointer">bKash</Label>
                      </div>
                    )}
                    {paymentSettings?.nagad?.enabled && (
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="nagad" id="nagad" />
                        <Label htmlFor="nagad" className="cursor-pointer">Nagad</Label>
                      </div>
                    )}
                  </RadioGroup>
                  {errors.paymentMethod && (
                    <p className="text-sm text-destructive">{errors.paymentMethod.message}</p>
                  )}
                </div>
              </div>

              {paymentMethod !== "cod" && (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
                  <p className="text-sm font-medium text-amber-800">
                    {paymentMethod === "bkash"
                      ? paymentSettings?.bkash?.instructions || "Send money to the bKash number below and enter Transaction ID."
                      : paymentSettings?.nagad?.instructions || "Send money to the Nagad number below and enter Transaction ID."}
                  </p>
                  <p className="text-lg font-bold text-amber-900">
                    {paymentMethod === "bkash"
                      ? paymentSettings?.bkash?.number || ""
                      : paymentSettings?.nagad?.number || ""}
                  </p>
                  <div className="space-y-1">
                    <Label htmlFor="txnId" className="text-amber-800">Transaction ID *</Label>
                    <Input
                      id="txnId"
                      placeholder="Enter your transaction ID"
                      {...register("transactionId")}
                    />
                  </div>
                </div>
              )}

              <Separator />

              {/* Order Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Charge</span>
                  <span className="font-semibold">
                    {deliveryCharge === 0 ? (
                      <Badge variant="secondary" className="text-green-700">Free</Badge>
                    ) : (
                      formatPrice(deliveryCharge)
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-base">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary text-lg">{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full text-base"
                disabled={submitting || subtotal === 0}
              >
                {submitting ? "Placing Order..." : "Place Order"}
                {!submitting && <Send className="ml-2 h-4 w-4" />}
              </Button>

              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-2">
                <div className="flex items-center gap-1">
                  <Truck className="h-3 w-3" /> Fast Delivery
                </div>
                <div className="flex items-center gap-1">
                  <ShoppingCart className="h-3 w-3" /> Easy Ordering
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3" /> Secure Payment
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
