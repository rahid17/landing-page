"use client";

import { useOrders } from "@/hooks/use-orders";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import type { OrderStatus } from "@/types";

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-purple-100 text-purple-800 border-purple-200",
  shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function DashboardPage() {
  const { stats, loading } = useOrders();

  const statCards = [
    {
      label: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      borderColor: "border-l-blue-500",
      iconBg: "bg-blue-100 text-blue-600",
    },
    {
      label: "Pending",
      value: stats?.pendingOrders ?? 0,
      icon: Clock,
      borderColor: "border-l-amber-500",
      iconBg: "bg-amber-100 text-amber-600",
    },
    {
      label: "Confirmed",
      value: stats?.confirmedOrders ?? 0,
      icon: CheckCircle2,
      borderColor: "border-l-green-500",
      iconBg: "bg-green-100 text-green-600",
    },
    {
      label: "Revenue",
      value: formatPrice(stats?.totalRevenue ?? 0),
      icon: DollarSign,
      borderColor: "border-l-emerald-500",
      iconBg: "bg-emerald-100 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-l-4 border-l-muted">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-8 w-20" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat) => (
              <Card
                key={stat.label}
                className={`border-l-4 ${stat.borderColor}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.iconBg}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !stats?.recentOrders?.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No orders yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.phone}</TableCell>
                      <TableCell>{order.districtName}</TableCell>
                      <TableCell>{formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <Badge
                          className={statusColors[order.status]}
                          variant="outline"
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {format(new Date(order.createdAt), "dd MMM yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
