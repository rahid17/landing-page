"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, ShoppingBag, ArrowLeft } from "lucide-react";
import { getOrder } from "@/services/orders";
import type { Order } from "@/types";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("No order found.");
      setLoading(false);
      return;
    }
    getOrder(orderId)
      .then((o) => {
        if (!o) {
          setError("Order not found.");
        } else {
          setOrder(o);
        }
      })
      .catch(() => setError("Failed to load order details."))
      .finally(() => setLoading(false));
  }, [orderId]);

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const paymentLabels: Record<string, string> = {
    cod: "Cash on Delivery",
    bkash: "bKash",
    nagad: "Nagad",
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-8 space-y-4">
          <Skeleton className="h-20 w-20 rounded-full mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !order) {
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-8 text-center space-y-4">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">{error || "Order not found"}</h2>
          <Link href="/">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <CardTitle className="text-2xl text-green-800">Order Placed Successfully!</CardTitle>
        <p className="text-muted-foreground text-sm mt-1">
          Thank you for your order. We will contact you shortly.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Order Number</span>
            <span className="font-mono font-bold text-primary">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Product</span>
            <span className="font-medium">{order.productName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Quantity</span>
            <span className="font-medium">{order.quantity}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Delivery Charge</span>
            <span className="font-medium">{formatPrice(order.deliveryCharge)}</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between items-center">
            <span className="font-semibold">Total Amount</span>
            <span className="font-bold text-lg text-primary">{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Payment Method</span>
            <span className="font-medium">{paymentLabels[order.paymentMethod] || order.paymentMethod}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge className={statusColors[order.status] || ""}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">District</span>
            <span className="font-medium">{order.districtName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Date</span>
            <span className="font-medium text-sm">
              {format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")}
            </span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" /> Home
            </Button>
          </Link>
          <Button
            className="flex-1 gap-2"
            onClick={() => router.push("/#order-section")}
          >
            <ShoppingBag className="h-4 w-4" /> Order Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
