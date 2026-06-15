"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useReviews } from "@/hooks/use-reviews";
import { createReview, updateReview, deleteReview } from "@/services/reviews";
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
import {
  Card,
  CardContent,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Plus, Pencil, Trash2, Star, Loader2 } from "lucide-react";

export default function ReviewsPage() {
  const { reviews, loading, refresh } = useReviews();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      customerName: "",
      photoURL: "",
      text: "",
      rating: 5,
    },
  });

  const openAdd = () => {
    form.reset({ customerName: "", photoURL: "", text: "", rating: 5 });
    setEditingReview(null);
    setDialogOpen(true);
  };

  const openEdit = (review: Review) => {
    form.reset({
      customerName: review.customerName,
      photoURL: review.photoURL || "",
      text: review.text,
      rating: review.rating,
    });
    setEditingReview(review);
    setDialogOpen(true);
  };

  const onSubmit = async (data: ReviewFormData) => {
    setSubmitting(true);
    try {
      if (editingReview) {
        await updateReview(editingReview.id, data);
        toast.success("Review updated");
      } else {
        await createReview(data);
        toast.success("Review created");
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
      await deleteReview(deletingId);
      toast.success("Review deleted");
      setDeleteOpen(false);
      refresh();
    } catch {
      toast.error("Failed to delete");
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
            className={`h-4 w-4 ${
              i < rating
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground"
            }`}
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
                  <TableHead className="w-12">Photo</TableHead>
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
                      <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
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
                        <Avatar className="h-10 w-10">
                          {review.photoURL ? (
                            <AvatarImage
                              src={review.photoURL}
                              alt={review.customerName}
                            />
                          ) : null}
                          <AvatarFallback>
                            {review.customerName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        {review.customerName}
                      </TableCell>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingReview ? "Edit Review" : "Add Review"}
            </DialogTitle>
            <DialogDescription>
              {editingReview
                ? "Update the review details"
                : "Add a new customer review"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input id="customerName" {...form.register("customerName")} />
              {form.formState.errors.customerName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.customerName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="photoURL">Photo URL (optional)</Label>
              <Input
                id="photoURL"
                placeholder="https://example.com/photo.jpg"
                {...form.register("photoURL")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="text">Review Text</Label>
              <Textarea id="text" rows={3} {...form.register("text")} />
              {form.formState.errors.text && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.text.message}
                </p>
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
                <p className="text-sm text-destructive">
                  {form.formState.errors.rating.message}
                </p>
              )}
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
