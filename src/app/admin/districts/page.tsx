"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useDistricts } from "@/hooks/use-districts";
import { createDistrict, updateDistrict, deleteDistrict, toggleDistrictActive } from "@/services/districts";
import { districtSchema, type DistrictFormData } from "@/validations";
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
import { Plus, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react";

export default function DistrictsPage() {
  const { districts, loading, error, refresh } = useDistricts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<DistrictFormData>({
    resolver: zodResolver(districtSchema),
    defaultValues: { name: "", deliveryCharge: 0, active: true },
  });

  const openAdd = () => {
    form.reset({ name: "", deliveryCharge: 0, active: true });
    setEditingDistrict(null);
    setDialogOpen(true);
  };

  const openEdit = (district: District) => {
    form.reset({
      name: district.name,
      deliveryCharge: district.deliveryCharge,
      active: district.active,
    });
    setEditingDistrict(district);
    setDialogOpen(true);
  };

  const onSubmit = async (data: DistrictFormData) => {
    setSubmitting(true);
    try {
      if (editingDistrict) {
        await updateDistrict(editingDistrict.id, data);
        toast.success("District updated");
      } else {
        await createDistrict(data);
        toast.success("District added");
      }
      setDialogOpen(false);
      refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await deleteDistrict(deletingId);
      toast.success("District deleted");
      setDeleteOpen(false);
      refresh();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
      setDeletingId(null);
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
          <p className="text-muted-foreground">Manage districts and delivery fees</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add District
        </Button>
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
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-9" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
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
                      No districts yet. Add your first district.
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
                          aria-label={`Toggle district ${district.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(district)}
                            aria-label="Edit district"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeletingId(district.id);
                              setDeleteOpen(true);
                            }}
                            aria-label="Delete district"
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDistrict ? "Edit District" : "Add District"}
            </DialogTitle>
            <DialogDescription>
              Set the district name and delivery charge
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">District Name</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryCharge">Delivery Charge (৳)</Label>
              <Input
                id="deliveryCharge"
                type="number"
                {...form.register("deliveryCharge", { valueAsNumber: true })}
              />
              {form.formState.errors.deliveryCharge && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.deliveryCharge.message}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={form.watch("active")}
                onCheckedChange={(v) => form.setValue("active", v)}
              />
              <Label htmlFor="active">Active</Label>
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
                {editingDistrict ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete District</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this district?
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
