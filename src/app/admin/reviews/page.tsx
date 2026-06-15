"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useReviews } from "@/hooks/use-reviews";
import { createReview, updateReview, deleteReview } from "@/services/reviews";
import { uploadImage } from "@/services/storage";
import { reviewSchema, type ReviewFormData } from "@/validations";
import type { Review } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { format } from "date-fns";
import { Plus, Pencil, Trash2, Star, Loader2, AlertCircle, Upload, X, ImageIcon } from "lucide-react";

const MAX_PHOTOS = 5;

export default function ReviewsPage() {
  const { reviews, loading, error, refresh } = useReviews();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      customerName: "",
      photos: [],
      text: "",
      rating: 5,
    },
  });

  const openAdd = () => {
    form.reset({ customerName: "", photos: [], text: "", rating: 5 });
    setPhotos([]);
    setEditingReview(null);
    setDialogOpen(true);
  };

  const openEdit = (review: Review) => {
    form.reset({
      customerName: review.customerName,
      photos: review.photos ?? [],
      text: review.text,
      rating: review.rating,
    });
    setPhotos(review.photos ?? []);
    setEditingReview(review);
    setDialogOpen(true);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = MAX_PHOTOS - photos.length;
    if (files.length > remaining) {
      toast.error(`You can only add ${remaining} more photo${remaining === 1 ? "" : "s"} (max ${MAX_PHOTOS})`);
      return;
    }

    setUploadingFiles(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const path = `reviews/${Date.now()}-${file.name}`;
        const url = await uploadImage(file, path);
        uploadedUrls.push(url);
      }
      const updated = [...photos, ...uploadedUrls];
      setPhotos(updated);
      form.setValue("photos", updated, { shouldValidate: true });
      toast.success(`${uploadedUrls.length} photo${uploadedUrls.length === 1 ? "" : "s"} uploaded`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    form.setValue("photos", updated, { shouldValidate: true });
  };

  const onSubmit = async (data: ReviewFormData) => {
    setSubmitting(true);
    try {
      if (editingReview) {
        await updateReview(editingReview.id, { ...data, photos: data.photos ?? [] });
        toast.success("Review updated");
      } else {
        await createReview({ ...data, photos: data.photos ?? [] });
        toast.success("Review created");
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
      await deleteReview(deletingId);
      toast.success("Review deleted");
      setDeleteOpen(false);
      refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete";
      toast.error(message);
    } finally {
      setDeleting(false);
      setDeletingId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-muted-foreground">Manage customer reviews</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Review
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Photos</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="max-w-xs">Review</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-10 rounded" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                      <p className="text-destructive font-medium">Failed to load reviews</p>
                      <p className="text-sm text-muted-foreground mt-1">{error}</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={refresh}>
                        Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : !reviews.length ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No reviews yet. Add your first review.
                    </TableCell>
                  </TableRow>
                ) : (
                  reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        {review.photos && review.photos.length > 0 ? (
                          <img
                            src={review.photos[0]}
                            alt={review.customerName}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{review.customerName}</TableCell>
                      <TableCell>{renderStars(review.rating)}</TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {review.text}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {format(new Date(review.createdAt), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(review)}
                            aria-label="Edit review"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeletingId(review.id);
                              setDeleteOpen(true);
                            }}
                            aria-label="Delete review"
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingReview ? "Edit Review" : "Add Review"}
            </DialogTitle>
            <DialogDescription>
              {editingReview ? "Update the review details" : "Add a new customer review"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input id="customerName" {...form.register("customerName")} />
              {form.formState.errors.customerName && (
                <p className="text-sm text-destructive">{form.formState.errors.customerName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Photos ({photos.length}/{MAX_PHOTOS})</Label>
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {photos.map((url, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={url}
                        alt={`Review photo ${i + 1}`}
                        className="h-20 w-20 rounded object-cover border"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                disabled={uploadingFiles || photos.length >= MAX_PHOTOS}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFiles || photos.length >= MAX_PHOTOS}
                className="w-full"
              >
                {uploadingFiles ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" /> Upload Photo{photos.length >= MAX_PHOTOS ? "s (max reached)" : ""}
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                {photos.length >= MAX_PHOTOS
                  ? "Maximum 5 photos reached. Remove some to add new ones."
                  : `You can upload up to ${MAX_PHOTOS - photos.length} more photo${MAX_PHOTOS - photos.length === 1 ? "" : "s"}.`}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="text">Review Text</Label>
              <Textarea id="text" rows={3} {...form.register("text")} />
              {form.formState.errors.text && (
                <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <Select
                value={String(form.watch("rating"))}
                onValueChange={(v) => form.setValue("rating", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ (5)</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ (4)</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ (3)</SelectItem>
                  <SelectItem value="2">⭐⭐ (2)</SelectItem>
                  <SelectItem value="1">⭐ (1)</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.rating && (
                <p className="text-sm text-destructive">{form.formState.errors.rating.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || uploadingFiles}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingReview ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
