"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useReviews } from "@/hooks/use-reviews";
import { useLandingContent } from "@/hooks/use-landing-content";
import { Star, Quote } from "lucide-react";

const fallbackReviews = [
  {
    customerName: "Fatima",
    photos: [] as string[],
    text: "Amazing quality! The color lasted so long and my design was beautiful. Will definitely order again.",
    rating: 5,
  },
  {
    customerName: "Ayesha",
    photos: [] as string[],
    text: "Best mehendi I've ever used. No irritation at all and the stain was so dark and rich!",
    rating: 5,
  },
  {
    customerName: "Sadia",
    photos: [] as string[],
    text: "Quick delivery and great product. Highly recommend! The packaging was also very nice.",
    rating: 5,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="w-4 h-4 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ReviewsSection() {
  const { reviews, loading } = useReviews();
  const { content } = useLandingContent();
  const sectionRef = useRef<HTMLElement>(null);

  const displayReviews = reviews.length > 0 ? reviews.slice(0, 6) : fallbackReviews;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.querySelectorAll(".review-card").forEach((card, i) => {
            setTimeout(() => {
              card.classList.add("opacity-100", "translate-y-0");
              card.classList.remove("opacity-0", "translate-y-4");
            }, i * 150);
          });
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [displayReviews]);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <section ref={sectionRef} id="reviews" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {content?.reviewsSection?.heading || "What Our Customers Say"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {content?.reviewsSection?.subheading ||
              "Real reviews from real customers who love KTalk Mehendi"}
          </p>
        </div>

        {loading ? (
          <ReviewsSkeleton />
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {displayReviews.map((review, index) => (
              <Card
                key={review.customerName + index}
                className="review-card border-border/60 hover:border-primary/20 hover:shadow-md transition-all duration-300 opacity-0 translate-y-4"
              >
                <CardContent className="p-6">
                  <Quote className="w-8 h-8 text-primary/20 mb-3" />
                  <StarRating rating={review.rating} />
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {review.text}
                  </p>
                  <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                    <Avatar className="w-9 h-9">
                      {review.photos && review.photos.length > 0 && (
                        <AvatarImage src={review.photos[0]} alt={review.customerName} />
                      )}
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(review.customerName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-semibold text-foreground text-sm">
                        {review.customerName}
                      </span>
                      {review.photos && review.photos.length > 0 && (
                        <span className="text-xs text-muted-foreground ml-2">
                          +{review.photos.length} photo{review.photos.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
