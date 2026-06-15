"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useFAQs } from "@/hooks/use-faqs";
import { createFAQ, updateFAQ, deleteFAQ } from "@/services/faqs";
import { faqSchema, type FAQFormData } from "@/validations";
import type { FAQ } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, GripVertical, Loader2 } from "lucide-react";

export default function FAQsPage() {
  const { faqs, loading, refresh } = useFAQs();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<FAQFormData>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: "",
      answer: "",
      order: 0,
    },
  });

  const openAdd = () => {
    form.reset({ question: "", answer: "", order: faqs.length });
    setEditingFAQ(null);
    setDialogOpen(true);
  };

  const openEdit = (faq: FAQ) => {
    form.reset({
      question: faq.question,
      answer: faq.answer,
      order: faq.order,
    });
    setEditingFAQ(faq);
    setDialogOpen(true);
  };

  const onSubmit = async (data: FAQFormData) => {
    setSubmitting(true);
    try {
      if (editingFAQ) {
        await updateFAQ(editingFAQ.id, data);
        toast.success("FAQ updated");
      } else {
        await createFAQ(data);
        toast.success("FAQ added");
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
      await deleteFAQ(deletingId);
      toast.success("FAQ deleted");
      setDeleteOpen(false);
      refresh();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">FAQs</h1>
          <p className="text-muted-foreground">Manage frequently asked questions</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>FAQ List</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : !faqs.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No FAQs yet. Click &ldquo;Add FAQ&rdquo; to get started.
              </p>
            ) : (
              <div className="space-y-2">
                {faqs
                  .sort((a, b) => a.order - b.order)
                  .map((faq) => (
                    <div
                      key={faq.id}
                      className="flex items-center gap-2 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {faq.question}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {faq.answer}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Order: {faq.order}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(faq)}
                          className="h-8 w-8"
                          aria-label="Edit FAQ"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingId(faq.id);
                            setDeleteOpen(true);
                          }}
                          className="h-8 w-8"
                          aria-label="Delete FAQ"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {!faqs.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No FAQs to preview
              </p>
            ) : (
              <Accordion type="single" collapsible>
                {faqs
                  .sort((a, b) => a.order - b.order)
                  .map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFAQ ? "Edit FAQ" : "Add FAQ"}
            </DialogTitle>
            <DialogDescription>
              {editingFAQ
                ? "Update the question and answer"
                : "Add a new frequently asked question"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                placeholder="How long does mehendi last?"
                {...form.register("question")}
              />
              {form.formState.errors.question && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.question.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                rows={4}
                placeholder="Our mehendi lasts up to 2 weeks with proper care..."
                {...form.register("answer")}
              />
              {form.formState.errors.answer && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.answer.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                {...form.register("order", { valueAsNumber: true })}
              />
              {form.formState.errors.order && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.order.message}
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
                {editingFAQ ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete FAQ</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this FAQ?
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
