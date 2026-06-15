"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useOrders } from "@/hooks/use-orders";
import { updateOrderStatus, deleteOrder } from "@/services/orders";
import type { Order, OrderStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import { Eye, Trash2, Search, Loader2 } from "lucide-react";

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-purple-100 text-purple-800 border-purple-200",
  shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const statusFilters: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export default function OrdersPage() {
  const { orders, loading, refresh } = useOrders();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus =
        statusFilter === "all" || o.status === statusFilter;
      const matchSearch =
        !search ||
        o.phone.includes(search) ||
        o.orderNumber.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, search]);

  const openDetail = (order: Order) => {
    setSelectedOrder(order);
    setSheetOpen(true);
  };

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(id, status);
      toast.success(`Order status updated to ${status}`);
      refresh();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await deleteOrder(deletingId);
      toast.success("Order deleted");
      setDeleteOpen(false);
      refresh();
      if (selectedOrder?.id === deletingId) setSheetOpen(false);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by phone or order #"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
            aria-label="Search orders"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <Button
            key={f.value}
            variant={statusFilter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 11 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : !filteredOrders.length ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer"
                      onClick={() => openDetail(order)}
                    >
                      <TableCell className="font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.phone}</TableCell>
                      <TableCell>{order.districtName}</TableCell>
                      <TableCell>{order.productName}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>{formatPrice(order.total)}</TableCell>
                      <TableCell className="uppercase text-xs">
                        {order.paymentMethod}
                      </TableCell>
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
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetail(order);
                            }}
                            aria-label="View order"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingId(order.id);
                              setDeleteOpen(true);
                            }}
                            aria-label="Delete order"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Order Details</SheetTitle>
            <SheetDescription>
              {selectedOrder?.orderNumber}
            </SheetDescription>
          </SheetHeader>
          {selectedOrder && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedOrder.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-medium">{selectedOrder.address}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">District</p>
                  <p className="font-medium">{selectedOrder.districtName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Product</p>
                  <p className="font-medium">{selectedOrder.productName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Quantity</p>
                  <p className="font-medium">{selectedOrder.quantity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Price</p>
                  <p className="font-medium">
                    {formatPrice(selectedOrder.price)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Subtotal</p>
                  <p className="font-medium">
                    {formatPrice(selectedOrder.subtotal)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Delivery Charge</p>
                  <p className="font-medium">
                    {formatPrice(selectedOrder.deliveryCharge)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-bold text-primary">
                    {formatPrice(selectedOrder.total)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium uppercase">
                    {selectedOrder.paymentMethod}
                  </p>
                </div>
                {selectedOrder.transactionId && (
                  <div>
                    <p className="text-muted-foreground">Transaction ID</p>
                    <p className="font-medium text-xs">
                      {selectedOrder.transactionId}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(
                      new Date(selectedOrder.createdAt),
                      "dd MMM yyyy hh:mm a"
                    )}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Update Status</p>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(v) =>
                    handleStatusChange(selectedOrder.id, v as OrderStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  setDeletingId(selectedOrder.id);
                  setDeleteOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Order
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this order? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
