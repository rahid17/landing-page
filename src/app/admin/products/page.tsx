"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useProducts } from "@/hooks/use-products";
import { createProduct, updateProduct, deleteProduct, toggleProductActive } from "@/services/products";
import { productSchema, type ProductFormData } from "@/validations";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { Plus, Pencil, Trash2, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";

export default function ProductsPage() {
  const { products, loading, error, refresh } = useProducts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: undefined as unknown as number,
      discountPrice: undefined,
      images: [] as string[],
      gallery: [],
      features: [],
      benefits: [],
      stockStatus: "in_stock",
      active: true,
    },
  });

  const openAdd = () => {
    form.reset({
      name: "",
      slug: "",
      description: "",
      price: undefined as unknown as number,
      discountPrice: undefined,
      images: [] as string[],
      gallery: [],
      features: [],
      benefits: [],
      stockStatus: "in_stock",
      active: true,
    });
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    form.reset({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice,
      images: product.images,
      gallery: product.gallery,
      features: product.features,
      benefits: product.benefits,
      stockStatus: product.stockStatus,
      active: product.active,
    });
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const onSubmit = async (data: ProductFormData) => {
    setSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
        toast.success("Product updated");
      } else {
        await createProduct(data);
        toast.success("Product created");
      }
      setDialogOpen(false);
      refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await deleteProduct(deletingId);
      toast.success("Product deleted");
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
      await toggleProductActive(id, active);
      toast.success(active ? "Product activated" : "Product deactivated");
      refresh();
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your products</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-9" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                      <p className="text-destructive font-medium">Failed to load products</p>
                      <p className="text-sm text-muted-foreground mt-1">{error}</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={refresh}>
                        Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : !products.length ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No products yet. Click &ldquo;Add Product&rdquo; to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Avatar className="h-10 w-10 rounded">
                          {product.images?.[0] ? (
                            <AvatarImage src={product.images[0]} alt={product.name} />
                          ) : null}
                          <AvatarFallback>
                            <ImageIcon className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <div>
                          {product.discountPrice ? (
                            <>
                              <span className="font-medium">
                                {formatPrice(product.discountPrice)}
                              </span>
                              <span className="text-xs text-muted-foreground line-through ml-1">
                                {formatPrice(product.price)}
                              </span>
                            </>
                          ) : (
                            <span className="font-medium">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={product.stockStatus === "in_stock" ? "default" : "destructive"}
                        >
                          {product.stockStatus === "in_stock" ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={product.active}
                          onCheckedChange={(v) => handleToggle(product.id, v)}
                          aria-label={`Toggle product ${product.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(product)}
                            aria-label="Edit product"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeletingId(product.id);
                              setDeleteOpen(true);
                            }}
                            aria-label="Delete product"
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add Product"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Update the product details"
                : "Fill in the details for the new product"}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" {...form.register("slug")} />
                {form.formState.errors.slug && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.slug.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} {...form.register("description")} />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...form.register("price", { valueAsNumber: true })}
                />
                {form.formState.errors.price && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.price.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountPrice">Discount Price (optional)</Label>
                <Input
                  id="discountPrice"
                  type="number"
                  step="0.01"
                  {...form.register("discountPrice", { valueAsNumber: true })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="images">Image URLs (comma-separated)</Label>
              <Input
                id="images"
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                value={form.watch("images")?.join(", ") ?? ""}
                onChange={(e) => {
                  const urls = e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  form.setValue("images", urls, { shouldValidate: true });
                }}
              />
              {form.formState.errors.images && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.images.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gallery">Gallery URLs (comma-separated)</Label>
              <Input
                id="gallery"
                placeholder="https://example.com/gallery1.jpg, https://example.com/gallery2.jpg"
                value={(form.watch("gallery") ?? []).join(", ")}
                onChange={(e) => {
                  const urls = e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  form.setValue("gallery", urls, { shouldValidate: true });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea
                id="features"
                rows={3}
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                value={(form.watch("features") ?? []).join("\n")}
                onChange={(e) => {
                  const lines = e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  form.setValue("features", lines, { shouldValidate: true });
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stock Status</Label>
                <Select
                  value={form.watch("stockStatus")}
                  onValueChange={(v: "in_stock" | "out_of_stock") =>
                    form.setValue("stockStatus", v, { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex items-end pb-2">
                <div className="flex items-center gap-2">
                  <Switch
                    id="active"
                    checked={form.watch("active")}
                    onCheckedChange={(v) => form.setValue("active", v)}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>
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
                {editingProduct ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be
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
