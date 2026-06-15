"use client";

import { useFAQs } from "@/hooks/use-faqs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

const fallbackFAQs = [
  {
    id: "1",
    question: "Is KTalk Mehendi 100% natural?",
    answer:
      "Yes! Our mehendi is made from pure organic henna leaves with no chemicals or additives. We source from trusted farms to ensure the highest quality.",
    order: 1,
  },
  {
    id: "2",
    question: "How long does the color last?",
    answer:
      "The stain typically lasts 1-2 weeks depending on skin type and aftercare. For best results, keep the paste on for at least 4-6 hours and avoid water contact for 24 hours after removal.",
    order: 2,
  },
  {
    id: "3",
    question: "Do you deliver outside Dhaka?",
    answer:
      "Yes! We deliver all across Bangladesh. Delivery charges vary by district. Delivery within Dhaka is free.",
    order: 3,
  },
  {
    id: "4",
    question: "What payment methods do you accept?",
    answer:
      "We accept Cash on Delivery, bKash, and Nagad for your convenience.",
    order: 4,
  },
  {
    id: "5",
    question: "Is it safe for sensitive skin?",
    answer:
      "Absolutely. Our mehendi is dermatologically tested and free from PPD and ammonia. It's gentle enough for sensitive skin while still delivering a rich, dark stain.",
    order: 5,
  },
];

function FAQSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

export function FAQSection() {
  const { faqs, loading } = useFAQs();

  const displayFAQs = faqs.length > 0 ? faqs : fallbackFAQs;

  return (
    <section id="faq" className="py-16 md:py-24 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Got questions? We&apos;ve got answers about our organic mehendi
          </p>
        </div>

        {loading ? (
          <FAQSkeleton />
        ) : (
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-2">
              {displayFAQs.map((faq) => (
                <AccordionItem
                  key={faq.id || faq.question}
                  value={faq.id || faq.question}
                  className="border border-border rounded-xl px-4 bg-card data-[state=open]:border-primary/30 data-[state=open]:shadow-sm transition-all"
                >
                  <AccordionTrigger className="text-foreground font-medium hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </div>
    </section>
  );
}
