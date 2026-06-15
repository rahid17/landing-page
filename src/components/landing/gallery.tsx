"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { useLandingContent } from "@/hooks/use-landing-content";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, Image } from "lucide-react";

const placeholderImages = Array.from({ length: 6 }, (_, i) => ({
  id: `placeholder-${i}`,
  index: i,
}));

export function GallerySection() {
  const { products, loading } = useProducts();
  const { content } = useLandingContent();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const product = products?.[0];
  const images = product?.gallery?.length ? product.gallery : null;
  const hasImages = images && images.length > 0;

  const totalImages = hasImages ? images!.length : 6;

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const goNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % totalImages);
  };

  const goPrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + totalImages) % totalImages);
  };

  return (
    <section id="gallery" className="py-16 md:py-24 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {content?.gallerySection?.heading || "Product Gallery"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {content?.gallerySection?.subheading ||
              "See the rich, dark stains our organic mehendi delivers"}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {hasImages
              ? images!.map((src, index) => (
                  <button
                    key={src}
                    onClick={() => openLightbox(index)}
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all"
                  >
                    <img
                      src={src}
                      alt={`Mehendi design ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </button>
                ))
              : placeholderImages.map(({ id, index }) => (
                  <button
                    key={id}
                    onClick={() => openLightbox(index)}
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all bg-gradient-to-br from-green-50 to-amber-50 dark:from-green-950 dark:to-amber-950"
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                      <Image className="w-10 h-10 mb-2 opacity-40" />
                      <span className="text-xs opacity-40">
                        Mehendi Design {index + 1}
                      </span>
                    </div>
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 right-4 w-20 h-20 rounded-full border-2 border-green-400" />
                      <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full border-2 border-amber-400" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-1 bg-green-400 rounded-full transform rotate-45" />
                    </div>
                  </button>
                ))}
          </div>
        )}

        <Dialog open={selectedIndex !== null} onOpenChange={() => closeLightbox()}>
          <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
            <DialogTitle className="sr-only">
              Mehendi Gallery Image {selectedIndex !== null ? selectedIndex + 1 : ""}
            </DialogTitle>

            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative flex items-center justify-center min-h-[60vh] p-4">
              {selectedIndex !== null && hasImages && images && (
                <img
                  src={images[selectedIndex]}
                  alt={`Mehendi design ${selectedIndex + 1}`}
                  className="max-h-[80vh] max-w-full object-contain rounded-lg"
                />
              )}
              {selectedIndex !== null && !hasImages && (
                <div className="w-full h-96 bg-gradient-to-br from-green-100 to-amber-100 dark:from-green-900 dark:to-amber-900 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Image className="w-20 h-20 mx-auto mb-4 text-green-500" />
                    <p className="text-foreground text-lg">
                      Mehendi Design {selectedIndex + 1}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={goPrev}
                className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {selectedIndex !== null ? `${selectedIndex + 1} / ${totalImages}` : ""}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
