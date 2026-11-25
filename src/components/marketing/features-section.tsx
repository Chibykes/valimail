"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { FeatureIllustration } from "@/components/marketing/feature-illustrations";
import { SectionHeading } from "@/components/marketing/section-heading";
import { FEATURES, type FeatureKey, LIST_STATS } from "@/constants/marketing";
import { cn } from "@/lib/utils";

export function FeaturesSection() {
  const [active, setActive] = useState<FeatureKey>(FEATURES[0].key);
  const feature = FEATURES.find((item) => item.key === active) ?? FEATURES[0];

  return (
    <section id="features" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="How it works"
          title="What does Valimail exactly do?"
          description="tl;dr — remove invalid recipients, block fake users and bots, prevent fraud, and save money on every send."
        />

        <div
          role="tablist"
          className="mx-auto mt-10 flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-2xl border border-border bg-surface p-1"
        >
          {FEATURES.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={item.key === active}
              onClick={() => setActive(item.key)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium transition-all",
                item.key === active
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.tab}
            </button>
          ))}
        </div>

        <div
          key={feature.key}
          className="mt-10 grid animate-fade-up items-center gap-10 lg:grid-cols-2"
        >
          <div className="order-2 lg:order-1">
            <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {feature.title}
            </h3>
            <p className="mt-4 text-lg text-muted-foreground">{feature.body}</p>
            <ul className="mt-6 space-y-3">
              {feature.points.map((point) => (
                <li key={point} className="flex items-center gap-3 text-sm">
                  <span className="grid size-6 place-items-center rounded-full bg-brand-50 text-brand-600">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 lg:order-2">
            <FeatureIllustration feature={feature.key} />
          </div>
        </div>

        <div className="mt-20 rounded-3xl border border-border bg-surface p-8 md:p-10">
          <p className="max-w-xl font-display text-2xl font-semibold tracking-tight">
            Place us after your sign-up forms and landing pages. We&apos;ll make
            sure you only get real users.
          </p>
          <dl className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {LIST_STATS.map((stat) => (
              <div key={stat.label} className="border-l-2 border-brand-200 pl-4">
                <dt className="font-display text-4xl font-semibold text-brand-600">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-sm text-muted-foreground">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
