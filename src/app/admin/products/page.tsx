"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useProducts } from "@/hooks/use-products";
import { createProduct, updateProduct, deleteProduct, toggleProductActive } from "@/services/products";
import { uploadImage } from "@/services/storage";
import { productSchema, type ProductFormData } from "@/validations";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Pencil, Trash2, Upload, X, Loader2, AlertCircle, ImageIcon, ZoomIn, RefreshCw } from "lucide-react";

export default function ProductsPage() {
  const { products, loading, error, refresh } = useProducts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [replacingImageIndex, setReplacingImageIndex] = useState<number | null>(null);
  const [replacingGalleryIndex, setReplacingGalleryIndex] = useState<number | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const replaceImageInputRef = useRef<HTMLInputElement>(null);
  const replaceGalleryInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      code: "",
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
      code: "",
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
    setImages([]);
    setGallery([]);
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    form.reset({
      name: product.name,
      slug: product.slug,
      code: product.code || "",
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice,
      images: product.images ?? [],
      gallery: product.gallery ?? [],
      features: product.features ?? [],
      benefits: product.benefits ?? [],
      stockStatus: product.stockStatus,
      active: product.active,
    });
    setImages(product.images ?? []);
    setGallery(product.gallery ?? []);
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const path = `products/${Date.now()}-${file.name}`;
        const url = await uploadImage(file, path);
        uploaded.push(url);
      }
      const updated = [...images, ...uploaded];
      setImages(updated);
      form.setValue("images", updated, { shouldValidate: true });
      toast.success(`${uploaded.length} image${uploaded.length > 1 ? "s" : ""} uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const path = `products/gallery/${Date.now()}-${file.name}`;
        const url = await uploadImage(file, path);
        uploaded.push(url);
      }
      const updated = [...gallery, ...uploaded];
      setGallery(updated);
      form.setValue("gallery", updated, { shouldValidate: true });
      toast.success(`${uploaded.length} gallery image${uploaded.length > 1 ? "s" : ""} uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    form.setValue("images", updated, { shouldValidate: true });
  };

  const removeGallery = (index: number) => {
    const updated = gallery.filter((_, i) => i !== index);
    setGallery(updated);
    form.setValue("gallery", updated, { shouldValidate: true });
  };

  const handleReplaceImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replacingImageIndex === null) return;
    setUploadingImage(true);
    try {
      const path = `products/${Date.now()}-${file.name}`;
      const url = await uploadImage(file, path);
      const updated = [...images];
      updated[replacingImageIndex] = url;
      setImages(updated);
      form.setValue("images", updated, { shouldValidate: true });
      toast.success("Image replaced");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Replace failed");
    } finally {
      setUploadingImage(false);
      setReplacingImageIndex(null);
      if (replaceImageInputRef.current) replaceImageInputRef.current.value = "";
    }
  };

  const handleReplaceGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replacingGalleryIndex === null) return;
    setUploadingGallery(true);
    try {
      const path = `products/gallery/${Date.now()}-${file.name}`;
      const url = await uploadImage(file, path);
      const updated = [...gallery];
      updated[replacingGalleryIndex] = url;
      setGallery(updated);
      form.setValue("gallery", updated, { shouldValidate: true });
      toast.success("Gallery image replaced");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Replace failed");
    } finally {
      setUploadingGallery(false);
      setReplacingGalleryIndex(null);
      if (replaceGalleryInputRef.current) replaceGalleryInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, { ...data, images: data.images ?? [], gallery: data.gallery ?? [] });
        toast.success("Product updated");
      } else {
        await createProduct({ ...data, images: data.images ?? [], gallery: data.gallery ?? [] });
        toast.success("Product created");
      }
      setDialogOpen(false);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
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
                  <TableHead>Code</TableHead>
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
                      <TableCell><Skeleton className="h-10 w-10 rounded" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-9" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                      <p className="text-destructive font-medium">Failed to load products</p>
                      <p className="text-sm text-muted-foreground mt-1">{error}</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={refresh}>Retry</Button>
                    </TableCell>
                  </TableRow>
                ) : !products.length ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No products yet. Click Add Product to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-10 w-10 rounded object-cover cursor-pointer hover:ring-2 ring-primary transition-all"
                            onClick={() => setZoomedImage(product.images[0])}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {product.code || "-"}
                      </TableCell>
                      <TableCell>
                        {product.discountPrice ? (
                          <>
                            <span className="font-medium">{formatPrice(product.discountPrice)}</span>
                            <span className="text-xs text-muted-foreground line-through ml-1">
                              {formatPrice(product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="font-medium">{formatPrice(product.price)}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.stockStatus === "in_stock" ? "default" : "destructive"}>
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
                          <Button variant="ghost" size="icon" onClick={() => openEdit(product)} aria-label="Edit product">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setDeletingId(product.id); setDeleteOpen(true); }}
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Update the product details" : "Fill in the details for the new product"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" {...form.register("name")} placeholder="Organic Mehendi" />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Product Code *</Label>
                <Input id="code" {...form.register("code")} placeholder="KT-001" />
                {form.formState.errors.code && (
                  <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" {...form.register("slug")} placeholder="organic-mehendi" />
              {form.formState.errors.slug && (
                <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} {...form.register("description")} />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input id="price" type="number" step="0.01" placeholder="250" {...form.register("price", { valueAsNumber: true })} />
                {form.formState.errors.price && (
                  <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountPrice">Discount Price</Label>
                <Input id="discountPrice" type="number" step="0.01" placeholder="200" {...form.register("discountPrice", { valueAsNumber: true })} />
              </div>
            </div>

            {/* Product Images */}
            <div className="space-y-2">
              <Label>Product Images * ({images.length} uploaded)</Label>
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {images.map((url, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={url}
                        alt={`Product ${i + 1}`}
                        className="h-20 w-20 rounded border object-cover cursor-pointer hover:ring-2 ring-primary transition-all"
                        onClick={() => setZoomedImage(url)}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplacingImageIndex(i);
                          replaceImageInputRef.current?.click();
                        }}
                        disabled={uploadingImage}
                        className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
              <input
                ref={replaceImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleReplaceImage}
                disabled={uploadingImage}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage}
                className="w-full"
              >
                {uploadingImage ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading...</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" /> Upload Product Image{images.length > 0 ? "s" : ""}</>
                )}
              </Button>
              {form.formState.errors.images && (
                <p className="text-sm text-destructive">{form.formState.errors.images.message as string}</p>
              )}
            </div>

            {/* Gallery Images */}
            <div className="space-y-2">
              <Label>Gallery Images ({gallery.length} uploaded)</Label>
              {gallery.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {gallery.map((url, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={url}
                        alt={`Gallery ${i + 1}`}
                        className="h-20 w-20 rounded border object-cover cursor-pointer hover:ring-2 ring-primary transition-all"
                        onClick={() => setZoomedImage(url)}
                      />
                      <button
                        type="button"
                        onClick={() => removeGallery(i)}
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplacingGalleryIndex(i);
                          replaceGalleryInputRef.current?.click();
                        }}
                        disabled={uploadingGallery}
                        className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                disabled={uploadingGallery}
                className="hidden"
              />
              <input
                ref={replaceGalleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleReplaceGallery}
                disabled={uploadingGallery}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadingGallery}
                className="w-full"
              >
                {uploadingGallery ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading...</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" /> Upload Gallery Image{gallery.length > 0 ? "s" : ""}</>
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea
                id="features"
                rows={3}
                placeholder="100% Natural Ingredients&#10;Easy to Apply&#10;Long Lasting"
                value={(form.watch("features") ?? []).join("\n")}
                onChange={(e) => {
                  const lines = e.target.value.split("\n").map((s) => s.trim()).filter(Boolean);
                  form.setValue("features", lines, { shouldValidate: true });
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stock Status</Label>
                <Select
                  value={form.watch("stockStatus")}
                  onValueChange={(v: "in_stock" | "out_of_stock") => form.setValue("stockStatus", v, { shouldValidate: true })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex items-end pb-2">
                <div className="flex items-center gap-2">
                  <Switch
                    id="product-active"
                    checked={form.watch("active")}
                    onCheckedChange={(v) => form.setValue("active", v)}
                  />
                  <Label htmlFor="product-active">Active</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting || uploadingImage || uploadingGallery}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingProduct ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Zoom Dialog */}
      <Dialog open={!!zoomedImage} onOpenChange={() => setZoomedImage(null)}>
        <DialogContent className="max-w-4xl p-1 bg-black/90 border-0">
          {zoomedImage && (
            <div className="relative flex items-center justify-center">
              <button
                onClick={() => setZoomedImage(null)}
                className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={zoomedImage}
                alt="Zoomed product"
                className="max-h-[80vh] w-full object-contain rounded"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
