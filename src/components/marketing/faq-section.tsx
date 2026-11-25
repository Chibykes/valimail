import { Plus } from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import { FAQS } from "@/constants/marketing";

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1fr_1.4fr]">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently asked questions"
          description="Can't find the answer you're looking for? Everything about how checks work is right here."
          align="left"
        />
        <div className="divide-y divide-border rounded-3xl border border-border bg-background">
          {FAQS.map((item) => (
            <details key={item.q} className="group px-4 sm:px-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-left font-medium">
                {item.q}
                <span className="grid size-7 shrink-0 place-items-center rounded-full border border-border transition group-open:rotate-45 group-open:border-brand-200 group-open:bg-brand-50 group-open:text-brand-600">
                  <Plus className="size-4" />
                </span>
              </summary>
              <p className="-mt-1 pb-5 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
