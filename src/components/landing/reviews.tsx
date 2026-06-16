"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useReviews } from "@/hooks/use-reviews";
import { useLandingContent } from "@/hooks/use-landing-content";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

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

const AUTO_SLIDE_INTERVAL = 5000;
const DRAG_THRESHOLD = 50;

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
    <div className="flex overflow-hidden">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="w-full min-w-0 md:w-1/2 lg:w-1/3 flex-shrink-0 px-2"
        >
          <Card>
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
        </div>
      ))}
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ReviewCard({ review }: { review: typeof fallbackReviews[number] }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const photos = review.photos ?? [];
  const hasMultiplePhotos = photos.length > 1;
  const isLongText = review.text.length > 120;
  const displayText = expanded || !isLongText ? review.text : review.text.slice(0, 120) + "...";

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % photos.length);
  };
  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="w-full min-w-0 md:w-1/2 lg:w-1/3 flex-shrink-0 px-2 select-none">
      <Card className="border-border/60 hover:border-primary/20 hover:shadow-md transition-all duration-300 h-full">
        {/* Photos */}
        {photos.length > 0 && (
          <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-xl">
            <img
              src={photos[photoIndex]}
              alt={`${review.customerName} photo ${photoIndex + 1}`}
              className="w-full h-full object-cover"
            />
            {hasMultiplePhotos && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                  {photoIndex + 1}/{photos.length}
                </div>
              </>
            )}
          </div>
        )}

        <CardContent className="p-5">
          <p className="text-muted-foreground leading-relaxed text-sm">
            {displayText}
          </p>
          {isLongText && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-primary text-xs font-medium mt-1 hover:underline"
            >
              {expanded ? "See less" : "See more"}
            </button>
          )}

          <div className="mt-3">
            <StarRating rating={review.rating} />
          </div>

          <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
            {photos.length === 0 && (
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(review.customerName)}
                </AvatarFallback>
              </Avatar>
            )}
            <span className="font-semibold text-foreground text-sm">
              {review.customerName}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ReviewsSection() {
  const { reviews, loading } = useReviews();
  const { content } = useLandingContent();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(() => {
    if (typeof window === "undefined") return 1;
    const width = window.innerWidth;
    if (width >= 1024) return 3;
    if (width >= 768) return 2;
    return 1;
  });
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragCurrentX = useRef(0);
  const isPaused = useRef(false);
  const autoSlideTimer = useRef<NodeJS.Timeout | null>(null);

  const displayReviews = reviews.length > 0 ? reviews.slice(0, 6) : fallbackReviews;
  const maxSlides = Math.max(0, displayReviews.length - cardsPerView);
  const slidePercentage = 100 / cardsPerView;
  const showArrows = displayReviews.length > cardsPerView;
  const effectiveSlide = Math.max(0, Math.min(currentSlide, maxSlides));
  const translateX = -(effectiveSlide * slidePercentage);

  const updateCardsPerView = useCallback(() => {
    const width = window.innerWidth;
    if (width >= 1024) {
      setCardsPerView(3);
    } else if (width >= 768) {
      setCardsPerView(2);
    } else {
      setCardsPerView(1);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, [updateCardsPerView]);

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentSlide(Math.max(0, Math.min(index, maxSlides)));
    },
    [maxSlides]
  );

  const goNext = useCallback(() => {
    if (effectiveSlide >= maxSlides) {
      setIsTransitionEnabled(false);
      setCurrentSlide(0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitionEnabled(true);
        });
      });
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  }, [effectiveSlide, maxSlides]);

  const goPrev = useCallback(() => {
    if (effectiveSlide <= 0) {
      setIsTransitionEnabled(false);
      setCurrentSlide(maxSlides);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitionEnabled(true);
        });
      });
    } else {
      setCurrentSlide((prev) => prev - 1);
    }
  }, [effectiveSlide, maxSlides]);

  useEffect(() => {
    if (displayReviews.length <= cardsPerView) {
      if (autoSlideTimer.current) {
        clearInterval(autoSlideTimer.current);
        autoSlideTimer.current = null;
      }
      return;
    }

    if (autoSlideTimer.current) {
      clearInterval(autoSlideTimer.current);
    }

    autoSlideTimer.current = setInterval(() => {
      if (!isPaused.current && !isDragging.current) {
        goNext();
      }
    }, AUTO_SLIDE_INTERVAL);

    return () => {
      if (autoSlideTimer.current) {
        clearInterval(autoSlideTimer.current);
        autoSlideTimer.current = null;
      }
    };
  }, [goNext, displayReviews.length, cardsPerView]);

  const finishDrag = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setIsTransitionEnabled(true);

    const delta = dragCurrentX.current - dragStartX.current;

    if (Math.abs(delta) > DRAG_THRESHOLD) {
      if (delta < -DRAG_THRESHOLD) {
        goNext();
      } else {
        goPrev();
      }
    } else {
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(${translateX}%)`;
      }
    }
  }, [goNext, goPrev, translateX]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragCurrentX.current = e.clientX;
    setIsTransitionEnabled(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    dragCurrentX.current = e.clientX;
    const delta = dragCurrentX.current - dragStartX.current;
    if (trackRef.current) {
      const containerWidth = containerRef.current?.offsetWidth || 1;
      const deltaPercent = (delta / containerWidth) * 100;
      trackRef.current.style.transform = `translateX(${translateX + deltaPercent}%)`;
    }
  };

  const handleMouseUp = () => {
    finishDrag();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    dragStartX.current = e.touches[0].clientX;
    dragCurrentX.current = e.touches[0].clientX;
    setIsTransitionEnabled(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    dragCurrentX.current = e.touches[0].clientX;
    const delta = dragCurrentX.current - dragStartX.current;
    if (trackRef.current) {
      const containerWidth = containerRef.current?.offsetWidth || 1;
      const deltaPercent = (delta / containerWidth) * 100;
      trackRef.current.style.transform = `translateX(${translateX + deltaPercent}%)`;
    }
  };

  const handleTouchEnd = () => {
    finishDrag();
  };

  return (
    <section id="reviews" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {content?.reviewsSection?.heading || "What Our Customers Say"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {content?.reviewsSection?.subheading ||
              "Real reviews from real customers who love our mehendi"}
          </p>
        </div>

        {loading ? (
          <ReviewsSkeleton />
        ) : (
          <div className="relative">
            <div
              ref={containerRef}
              className="overflow-hidden"
              onMouseEnter={() => {
                isPaused.current = true;
              }}
              onMouseLeave={() => {
                isPaused.current = false;
              }}
            >
              <div
                ref={trackRef}
                className="flex cursor-grab active:cursor-grabbing"
                style={{
                  transform: `translateX(${translateX}%)`,
                  transition: isTransitionEnabled ? "transform 0.5s ease" : "none",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {displayReviews.map((review, index) => (
                  <ReviewCard key={review.customerName + index} review={review} />
                ))}
              </div>
            </div>

            {showArrows && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 rounded-full shadow-md bg-background border-border hover:bg-accent hidden md:inline-flex"
                  onClick={goPrev}
                  aria-label="Previous review"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 rounded-full shadow-md bg-background border-border hover:bg-accent hidden md:inline-flex"
                  onClick={goNext}
                  aria-label="Next review"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </>
            )}

            {displayReviews.length > cardsPerView && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: maxSlides + 1 }).map((_, i) => (
                  <button
                    key={i}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      i === effectiveSlide
                        ? "bg-primary w-6"
                        : "w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                    onClick={() => goToSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
