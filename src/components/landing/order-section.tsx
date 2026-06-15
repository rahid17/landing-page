"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/use-products";
import { useDistricts } from "@/hooks/use-districts";
import { usePaymentSettings } from "@/hooks/use-payment-settings";
import { createOrder } from "@/services/orders";
import { logEvent } from "@/services/analytics";
import { formatPrice } from "@/lib/utils";
import { orderFormSchema } from "@/validations";
import type { OrderFormData } from "@/validations";
import { useRouter } from "next/navigation";
import { ShoppingCart, Send, CheckCircle, CreditCard, Truck } from "lucide-react";
import { toast } from "sonner";

export function OrderSection() {
  const router = useRouter();
  const { products, loading: productsLoading } = useProducts();
  const { activeDistricts, loading: districtsLoading } = useDistricts();
  const { paymentSettings, loading: paymentLoading } = usePaymentSettings();

  const [form, setForm] = useState({
    productId: "",
    quantity: 1,
    customerName: "",
    phone: "",
    address: "",
    districtId: "",
    paymentMethod: "cod" as "cod" | "bkash" | "nagad",
    transactionId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const product = products?.[0];
  const price = product?.discountPrice ?? product?.price ?? 250;
  const district = activeDistricts.find((d) => d.id === form.districtId);
  const deliveryCharge = district?.deliveryCharge ?? 0;
  const subtotal = price * form.quantity;
  const total = subtotal + deliveryCharge;

  const isLoading = productsLoading || districtsLoading || paymentLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: OrderFormData = {
      productId: product?.id ?? form.productId ?? "default",
      quantity: form.quantity,
      customerName: form.customerName,
      phone: form.phone,
      address: form.address,
      districtId: form.districtId,
      paymentMethod: form.paymentMethod,
      transactionId: form.paymentMethod !== "cod" && form.transactionId ? form.transactionId : undefined,
    };

    const result = orderFormSchema.safeParse(data);
    if (!result.success) {
      const firstError = result.error.issues[0];
      toast.error(firstError?.message ?? "Validation failed");
      return;
    }

    setSubmitting(true);
    try {
      const createdOrder = await createOrder({
        productId: result.data.productId,
        productName: product?.name ?? "Organic Mehendi",
        quantity: result.data.quantity,
        price,
        subtotal,
        deliveryCharge,
        total,
        customerName: result.data.customerName,
        phone: result.data.phone,
        address: result.data.address,
        districtId: result.data.districtId,
        districtName: district?.name ?? "",
        paymentMethod: result.data.paymentMethod,
        transactionId: result.data.transactionId,
      });

      await logEvent("order", {
        total,
        paymentMethod: result.data.paymentMethod,
        districtId: result.data.districtId,
      });

      toast.success("Order placed successfully!");
      router.push(`/success?orderId=${createdOrder.id}`);
    } catch {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section id="order-section" className="py-16 md:py-24 bg-secondary">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Order Confirmed!
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Thank you for your order! We will contact you shortly on your phone
            to confirm the delivery details.
          </p>
          <Button
            onClick={() => {
              setSubmitted(false);
              setForm({
                productId: "",
                quantity: 1,
                customerName: "",
                phone: "",
                address: "",
                districtId: "",
                paymentMethod: "cod",
                transactionId: "",
              });
            }}
            variant="outline"
          >
            Place Another Order
          </Button>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section id="order-section" className="py-16 md:py-24 bg-secondary">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-5 w-80 mx-auto" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const showTransactionId = form.paymentMethod !== "cod" && paymentSettings?.[form.paymentMethod]?.enabled;

  return (
    <section id="order-section" className="py-16 md:py-24 bg-secondary">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Place Your Order
          </h2>
          <p className="text-muted-foreground">
            Fill in your details below and we&apos;ll deliver fresh organic
            mehendi to your doorstep
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Order Form
            </CardTitle>
            <CardDescription>
              All fields marked with * are required
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Quantity */}
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-lg"
                    onClick={() =>
                      setForm((f) => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))
                    }
                    disabled={form.quantity <= 1}
                  >
                    -
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    max={100}
                    value={form.quantity}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        quantity: Math.max(1, parseInt(e.target.value) || 1),
                      }))
                    }
                    className="w-20 text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-lg"
                    onClick={() =>
                      setForm((f) => ({ ...f, quantity: Math.min(100, f.quantity + 1) }))
                    }
                    disabled={form.quantity >= 100}
                  >
                    +
                  </Button>
                  <span className="text-sm text-muted-foreground ml-2">
                    {formatPrice(price)} each
                  </span>
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  placeholder="Enter your full name"
                  value={form.customerName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customerName: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="01XXXXXXXXX"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  placeholder="House, Road, Area, City"
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  required
                  rows={3}
                />
              </div>

              {/* District */}
              <div>
                <Label htmlFor="district">District *</Label>
                <Select
                  value={form.districtId}
                  onValueChange={(v) => setForm((f) => ({ ...f, districtId: v }))}
                >
                  <SelectTrigger id="district">
                    <SelectValue placeholder="Select your district" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeDistricts.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} {d.deliveryCharge > 0 ? `(+${formatPrice(d.deliveryCharge)})` : "(Free)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Method */}
              <div>
                <Label className="mb-3 block">Payment Method *</Label>
                <RadioGroup
                  value={form.paymentMethod}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, paymentMethod: v as typeof form.paymentMethod, transactionId: "" }))
                  }
                  className="grid gap-3"
                >
                  {paymentSettings?.cod?.enabled !== false && (
                    <label className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer hover:border-primary/30 transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                      <RadioGroupItem value="cod" id="cod" />
                      <div>
                        <span className="font-medium text-foreground">Cash on Delivery</span>
                        <p className="text-sm text-muted-foreground">Pay when you receive</p>
                      </div>
                    </label>
                  )}
                  {paymentSettings?.bkash?.enabled && (
                    <label className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer hover:border-primary/30 transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                      <RadioGroupItem value="bkash" id="bkash" />
                      <div>
                        <span className="font-medium text-foreground">bKash</span>
                        <p className="text-sm text-muted-foreground">
                          Send to {paymentSettings.bkash.number}
                        </p>
                      </div>
                    </label>
                  )}
                  {paymentSettings?.nagad?.enabled && (
                    <label className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer hover:border-primary/30 transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                      <RadioGroupItem value="nagad" id="nagad" />
                      <div>
                        <span className="font-medium text-foreground">Nagad</span>
                        <p className="text-sm text-muted-foreground">
                          Send to {paymentSettings.nagad.number}
                        </p>
                      </div>
                    </label>
                  )}
                </RadioGroup>
              </div>

              {/* Transaction ID */}
              {showTransactionId && (
                <div>
                  <Label htmlFor="transactionId">Transaction ID *</Label>
                  <Input
                    id="transactionId"
                    placeholder={`Enter your ${form.paymentMethod} transaction ID`}
                    value={form.transactionId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, transactionId: e.target.value }))
                    }
                    required
                  />
                  {paymentSettings?.[form.paymentMethod]?.instructions && (
                    <p className="text-sm text-muted-foreground mt-1.5">
                      {paymentSettings[form.paymentMethod]!.instructions}
                    </p>
                  )}
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-secondary rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Charge</span>
                  <span className="font-medium">
                    {deliveryCharge > 0 ? formatPrice(deliveryCharge) : "Free"}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="animate-spin">&#9696;</span>
                    Placing Order...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Place Order
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center text-sm text-muted-foreground">
          <div className="flex flex-col items-center gap-1.5">
            <Truck className="w-5 h-5 text-primary" />
            <span>Fast Delivery</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <span>Easy Ordering</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <CreditCard className="w-5 h-5 text-primary" />
            <span>Secure Payment</span>
          </div>
        </div>
      </div>
    </section>
  );
}
