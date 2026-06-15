"use client";

import { useAnalytics } from "@/hooks/use-analytics";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  MousePointerClick,
  ShoppingCart,
  Percent,
} from "lucide-react";

export default function AnalyticsPage() {
  const { summary, loading } = useAnalytics();

  const statCards = [
    {
      label: "Total Visitors",
      value: summary?.totalVisitors ?? 0,
      icon: TrendingUp,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "CTA Clicks",
      value: summary?.ctaClicks ?? 0,
      icon: MousePointerClick,
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "Orders",
      value: summary?.ordersCount ?? 0,
      icon: ShoppingCart,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Conversion Rate",
      value: `${(summary?.conversionRate ?? 0).toFixed(1)}%`,
      icon: Percent,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your store performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Visitor to Order Ratio
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">
                        {summary?.totalVisitors ?? 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Visitors</p>
                    </div>
                    <div className="text-2xl text-muted-foreground">→</div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">
                        {summary?.ordersCount ?? 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Orders</p>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    CTA Engagement
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-amber-600">
                        {summary?.ctaClicks ?? 0}
                      </p>
                      <p className="text-xs text-muted-foreground">CTA Clicks</p>
                    </div>
                    <div className="text-2xl text-muted-foreground">/</div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">
                        {summary?.totalVisitors ?? 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Visitors</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {summary && summary.totalVisitors > 0
                      ? `${((summary.ctaClicks / summary.totalVisitors) * 100).toFixed(1)}% click rate`
                      : "No data yet"}
                  </p>
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Conversion Funnel
                </p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Visitors</span>
                      <span className="font-medium">{summary?.totalVisitors ?? 0}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CTA Clicks</span>
                      <span className="font-medium">{summary?.ctaClicks ?? 0}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{
                          width: summary
                            ? `${Math.min(
                                100,
                                (summary.ctaClicks /
                                  Math.max(summary.totalVisitors, 1)) *
                                  100
                              )}%`
                            : "0%",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Orders</span>
                      <span className="font-medium">{summary?.ordersCount ?? 0}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{
                          width: summary
                            ? `${Math.min(
                                100,
                                (summary.ordersCount /
                                  Math.max(summary.totalVisitors, 1)) *
                                  100
                              )}%`
                            : "0%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
