"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { usePaymentSettings } from "@/hooks/use-payment-settings";
import { updatePaymentSettings } from "@/services/payments";
import { paymentSettingsSchema, type PaymentSettingsFormData } from "@/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Banknote, Smartphone, Loader2, AlertCircle } from "lucide-react";
import type { PaymentSettings } from "@/types";

export default function PaymentsPage() {
  const { paymentSettings, loading, error, refresh } = usePaymentSettings();
  const [saving, setSaving] = useState(false);

  const form = useForm<PaymentSettingsFormData>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      cod: { enabled: true },
      bkash: { enabled: false, number: "", instructions: "" },
      nagad: { enabled: false, number: "", instructions: "" },
    },
  });

  useEffect(() => {
    if (paymentSettings) {
      form.reset({
        cod: { enabled: paymentSettings.cod?.enabled ?? true },
        bkash: {
          enabled: paymentSettings.bkash?.enabled ?? false,
          number: paymentSettings.bkash?.number || "",
          instructions: paymentSettings.bkash?.instructions || "",
        },
        nagad: {
          enabled: paymentSettings.nagad?.enabled ?? false,
          number: paymentSettings.nagad?.number || "",
          instructions: paymentSettings.nagad?.instructions || "",
        },
      });
    }
  }, [paymentSettings, form]);

  const onSubmit = async (data: PaymentSettingsFormData) => {
    setSaving(true);
    try {
      await updatePaymentSettings(data as unknown as Partial<PaymentSettings>);
      toast.success("Payment settings saved");
      refresh();
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground">Configure your payment options</p>
        </div>
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && !paymentSettings) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground">Configure your payment options</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="h-10 w-10 text-destructive mb-3" />
            <p className="text-destructive font-medium">Failed to load payment settings</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={refresh}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const codEnabled = form.watch("cod.enabled");
  const bkashEnabled = form.watch("bkash.enabled");
  const nagadEnabled = form.watch("nagad.enabled");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground">Configure your payment options</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Banknote className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <CardTitle>Cash on Delivery (COD)</CardTitle>
                <CardDescription>
                  Allow customers to pay when they receive the product
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Switch
                id="cod-enabled"
                checked={codEnabled}
                onCheckedChange={(v) => form.setValue("cod.enabled", v)}
              />
              <Label htmlFor="cod-enabled">
                {codEnabled ? "Enabled" : "Disabled"}
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-100">
                <Smartphone className="h-5 w-5 text-pink-700" />
              </div>
              <div>
                <CardTitle>bKash</CardTitle>
                <CardDescription>
                  Accept payments via bKash mobile banking
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                id="bkash-enabled"
                checked={bkashEnabled}
                onCheckedChange={(v) => form.setValue("bkash.enabled", v)}
              />
              <Label htmlFor="bkash-enabled">
                {bkashEnabled ? "Enabled" : "Disabled"}
              </Label>
            </div>
            {bkashEnabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="bkash-number">bKash Number</Label>
                  <Input
                    id="bkash-number"
                    placeholder="01XXXXXXXXX"
                    {...form.register("bkash.number")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bkash-instructions">Payment Instructions</Label>
                  <Textarea
                    id="bkash-instructions"
                    placeholder="Send money to the above number and enter the transaction ID"
                    rows={3}
                    {...form.register("bkash.instructions")}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <Smartphone className="h-5 w-5 text-red-700" />
              </div>
              <div>
                <CardTitle>Nagad</CardTitle>
                <CardDescription>
                  Accept payments via Nagad mobile banking
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                id="nagad-enabled"
                checked={nagadEnabled}
                onCheckedChange={(v) => form.setValue("nagad.enabled", v)}
              />
              <Label htmlFor="nagad-enabled">
                {nagadEnabled ? "Enabled" : "Disabled"}
              </Label>
            </div>
            {nagadEnabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="nagad-number">Nagad Number</Label>
                  <Input
                    id="nagad-number"
                    placeholder="01XXXXXXXXX"
                    {...form.register("nagad.number")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nagad-instructions">Payment Instructions</Label>
                  <Textarea
                    id="nagad-instructions"
                    placeholder="Send money to the above number and enter the transaction ID"
                    rows={3}
                    {...form.register("nagad.instructions")}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
