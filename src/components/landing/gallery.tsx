"use client";

import { useState, useMemo } from "react";
import { useProducts } from "@/hooks/use-products";
import { useLandingContent } from "@/hooks/use-landing-content";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, Image } from "lucide-react";

interface GalleryItem {
  productId: string;
  productName: string;
  price: number;
  src: string | null;
  index: number;
}

export function GallerySection() {
  const { products, loading } = useProducts();
  const { content } = useLandingContent();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const allProducts = products?.filter((p) => p.active) ?? [];

  const galleryItems: GalleryItem[] = useMemo(() => {
    const items: GalleryItem[] = [];
    allProducts.forEach((product) => {
      const price = product.discountPrice ?? product.price;
      const images = product.gallery?.length ? product.gallery : product.images ?? [];
      images.forEach((src, i) => {
        items.push({
          productId: product.id,
          productName: product.name,
          price,
          src,
          index: i,
        });
      });
    });
    if (items.length === 0) {
      for (let i = 0; i < 6; i++) {
        items.push({
          productId: "",
          productName: "KTalk Mehendi",
          price: 250,
          src: null,
          index: i,
        });
      }
    }
    return items;
  }, [allProducts]);

  const hasImages = galleryItems.some((item) => item.src !== null);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const goNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % galleryItems.length);
  };

  const goPrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + galleryItems.length) % galleryItems.length);
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
            {galleryItems.map((item, idx) => (
              <button
                key={`${item.productId}-${idx}`}
                onClick={() => openLightbox(idx)}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all"
              >
                {item.src ? (
                  <img
                    src={item.src}
                    alt={`${item.productName} design ${item.index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center">
                    <Image className="w-10 h-10 opacity-40 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                  <p className="text-white font-semibold text-sm truncate">{item.productName}</p>
                  <p className="text-amber-300 font-bold text-sm">{formatPrice(item.price)}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        <Dialog open={selectedIndex !== null} onOpenChange={() => closeLightbox()}>
          <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
            <DialogTitle className="sr-only">
              Gallery Image {selectedIndex !== null ? selectedIndex + 1 : ""}
            </DialogTitle>

            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative flex items-center justify-center min-h-[60vh] p-4">
              {selectedIndex !== null && (
                <>
                  {galleryItems[selectedIndex].src ? (
                    <img
                      src={galleryItems[selectedIndex].src!}
                      alt={`${galleryItems[selectedIndex].productName} design`}
                      className="max-h-[80vh] max-w-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-96 bg-gradient-to-br from-green-100 to-amber-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Image className="w-20 h-20 mx-auto mb-4 text-green-500" />
                        <p className="text-foreground text-lg">{galleryItems[selectedIndex].productName}</p>
                        <p className="text-primary font-semibold">{formatPrice(galleryItems[selectedIndex].price)}</p>
                      </div>
                    </div>
                  )}

                  {hasImages && (
                    <>
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
                    </>
                  )}
                </>
              )}
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {selectedIndex !== null ? `${selectedIndex + 1} / ${galleryItems.length}` : ""}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
