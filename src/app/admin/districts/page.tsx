"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useDistricts } from "@/hooks/use-districts";
import { updateDistrict, toggleDistrictActive } from "@/services/districts";
import type { District } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { Pencil, Loader2, AlertCircle } from "lucide-react";

export default function DistrictsPage() {
  const { districts, loading, error, refresh } = useDistricts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    defaultValues: { deliveryCharge: 0, active: true },
  });

  const openEdit = (district: District) => {
    form.reset({
      deliveryCharge: district.deliveryCharge,
      active: district.active,
    });
    setEditingDistrict(district);
    setDialogOpen(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDistrict) return;

    const data = form.getValues();
    setSubmitting(true);
    try {
      await updateDistrict(editingDistrict.id, {
        deliveryCharge: Number(data.deliveryCharge),
        active: data.active,
      });
      toast.success(`${editingDistrict.name} updated`);
      setDialogOpen(false);
      refresh();
    } catch {
      toast.error("Failed to update district");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await toggleDistrictActive(id, active);
      toast.success(active ? "District activated" : "District deactivated");
      refresh();
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Delivery Charges</h1>
          <p className="text-muted-foreground">Manage delivery fees for all districts</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>District</TableHead>
                  <TableHead>Delivery Charge</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-9" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                      <p className="text-destructive font-medium">Failed to load districts</p>
                      <p className="text-sm text-muted-foreground mt-1">{error}</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={refresh}>
                        Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : !districts.length ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      No districts found. Run the seed SQL to populate districts.
                    </TableCell>
                  </TableRow>
                ) : (
                  districts.map((district) => (
                    <TableRow key={district.id}>
                      <TableCell className="font-medium">
                        {district.name}
                      </TableCell>
                      <TableCell>
                        {formatPrice(district.deliveryCharge)}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={district.active}
                          onCheckedChange={(v) => handleToggle(district.id, v)}
                          aria-label={`Toggle ${district.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(district)}
                          aria-label={`Edit ${district.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit {editingDistrict?.name}
            </DialogTitle>
            <DialogDescription>
              Update the delivery charge for this district
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">District Name</Label>
              <Input
                id="name"
                value={editingDistrict?.name ?? ""}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">District names cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryCharge">Delivery Charge (৳)</Label>
              <Input
                id="deliveryCharge"
                type="number"
                min={0}
                {...form.register("deliveryCharge", { valueAsNumber: true })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="active-edit"
                checked={form.watch("active")}
                onCheckedChange={(v) => form.setValue("active", v)}
              />
              <Label htmlFor="active-edit">Active</Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
